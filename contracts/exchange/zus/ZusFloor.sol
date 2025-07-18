//SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../libraries/math/SafeMath.sol";
import "../libraries/token/IERC20.sol";
import "../libraries/token/SafeERC20.sol";
import "../libraries/utils/ReentrancyGuard.sol";

import "../tokens/interfaces/IMintable.sol";
import "../access/TokenManager.sol";

contract ZusFloor is ReentrancyGuard, TokenManager {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    uint256 public constant BASIS_POINTS_DIVISOR = 10000;
    uint256 public constant PRICE_PRECISION = 10 ** 30;
    uint256 public constant BURN_BASIS_POINTS = 9000;

    address public zus;
    address public reserveToken;
    uint256 public backedSupply;
    uint256 public baseMintPrice;
    uint256 public mintMultiplier;
    uint256 public mintedSupply;
    uint256 public multiplierPrecision;

    mapping (address => bool) public isHandler;

    modifier onlyHandler() {
        require(isHandler[msg.sender], "ZusFloor: forbidden");
        _;
    }

    constructor(
        address _zus,
        address _reserveToken,
        uint256 _backedSupply,
        uint256 _baseMintPrice,
        uint256 _mintMultiplier,
        uint256 _multiplierPrecision,
        uint256 _minAuthorizations
    ) public TokenManager(_minAuthorizations) {
        zus = _zus;

        reserveToken = _reserveToken;
        backedSupply = _backedSupply;

        baseMintPrice = _baseMintPrice;
        mintMultiplier = _mintMultiplier;
        multiplierPrecision = _multiplierPrecision;
    }

    function initialize(address[] memory _signers) public override onlyAdmin {
        TokenManager.initialize(_signers);
    }

    function setHandler(address _handler, bool _isHandler) public onlyAdmin {
        isHandler[_handler] = _isHandler;
    }

    function setBackedSupply(uint256 _backedSupply) public onlyAdmin {
        require(_backedSupply > backedSupply, "ZusFloor: invalid _backedSupply");
        backedSupply = _backedSupply;
    }

    function setMintMultiplier(uint256 _mintMultiplier) public onlyAdmin {
        require(_mintMultiplier > mintMultiplier, "ZusFloor: invalid _mintMultiplier");
        mintMultiplier = _mintMultiplier;
    }

    // mint refers to increasing the circulating supply
    // the ZEUS tokens to be transferred out must be pre-transferred into this contract
    function mint(uint256 _amount, uint256 _maxCost, address _receiver) public onlyHandler nonReentrant returns (uint256) {
        require(_amount > 0, "ZusFloor: invalid _amount");

        uint256 currentMintPrice = getMintPrice();
        uint256 nextMintPrice = currentMintPrice.add(_amount.mul(mintMultiplier).div(multiplierPrecision));
        uint256 averageMintPrice = currentMintPrice.add(nextMintPrice).div(2);

        uint256 cost = _amount.mul(averageMintPrice).div(PRICE_PRECISION);
        require(cost <= _maxCost, "ZusFloor: _maxCost exceeded");

        mintedSupply = mintedSupply.add(_amount);
        backedSupply = backedSupply.add(_amount);

        IERC20(reserveToken).safeTransferFrom(msg.sender, address(this), cost);
        IERC20(zus).transfer(_receiver, _amount);

        return cost;
    }

    function burn(uint256 _amount, uint256 _minOut, address _receiver) public onlyHandler nonReentrant returns (uint256) {
        require(_amount > 0, "ZusFloor: invalid _amount");

        uint256 amountOut = getBurnAmountOut(_amount);
        require(amountOut >= _minOut, "ZusFloor: insufficient amountOut");

        backedSupply = backedSupply.sub(_amount);

        IMintable(zus).burn(msg.sender, _amount);
        IERC20(reserveToken).safeTransfer(_receiver, amountOut);

        return amountOut;
    }

    function getMintPrice() public view returns (uint256) {
        return baseMintPrice.add(mintedSupply.mul(mintMultiplier).div(multiplierPrecision));
    }

    function getBurnAmountOut(uint256 _amount) public view returns (uint256) {
        uint256 balance = IERC20(reserveToken).balanceOf(address(this));
        return _amount.mul(balance).div(backedSupply).mul(BURN_BASIS_POINTS).div(BASIS_POINTS_DIVISOR);
    }
}
