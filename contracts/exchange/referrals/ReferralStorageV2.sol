// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "../libraries/math/SafeMath.sol";

import "../access/Governable.sol";
import "../peripherals/interfaces/ITimelock.sol";

import "./interfaces/IReferralStorageV2.sol";

contract ReferralStorageV2 is Governable, IReferralStorageV2 {
    using SafeMath for uint256;

    struct Tier {
        uint256 traderDiscount; // e.g. 2400 for 24%
        uint256 referrerDiscount; // e.g. 5000 for 50%
    }

    uint256 public constant BASIS_POINTS = 10000;

    mapping (uint256 => Tier) public tiers;
    mapping (address => uint256) public override referrerTiers; // link between user <> tier

    mapping (address => bool) public isHandler;

    mapping (bytes32 => address) public override codeOwners;
    mapping (address => bytes32) public override ownerToCode;
    mapping (address => bytes32) public override traderReferralCodes;

    event SetHandler(address handler, bool isActive);
    event SetTraderReferralCode(address account, bytes32 code);
    event SetTier(uint256 tierId, uint256 totalRebate, uint256 discountShare);
    event SetReferrerTier(address referrer, uint256 tierId);
    event RegisterCode(address account, bytes32 code);
    event GovSetCodeOwner(bytes32 code, address newAccount);

    modifier onlyHandler() {
        require(isHandler[msg.sender], "ReferralStorage: forbidden");
        _;
    }

    function setHandler(address _handler, bool _isActive) external onlyGov {
        isHandler[_handler] = _isActive;
        emit SetHandler(_handler, _isActive);
    }

    function setTier(uint256 _tierId, uint256 _traderDiscount, uint256 _referrerDiscount) external override onlyGov {
        require(_traderDiscount <= BASIS_POINTS, "ReferralStorage: invalid totalRebate");
        require(_referrerDiscount <= BASIS_POINTS, "ReferralStorage: invalid discountShare");

        Tier memory tier = tiers[_tierId];
        tier.traderDiscount = _traderDiscount;
        tier.referrerDiscount = _referrerDiscount;
        tiers[_tierId] = tier;
        emit SetTier(_tierId, _traderDiscount, _referrerDiscount);
    }

    function setReferrerTier(address _referrer, uint256 _tierId) external override onlyGov {
        referrerTiers[_referrer] = _tierId;
        emit SetReferrerTier(_referrer, _tierId);
    }

    function setTraderReferralCode(address _account, bytes32 _code) external override onlyHandler {

        // is not allowed to refer himself
        if (_account == codeOwners[_code]) {
            return;
        }

        // no fake codes
        if (codeOwners[_code] == address(0)) {
            return;
        }

        _setTraderReferralCode(_account, _code);
    }

    function setTraderReferralCodeByUser(bytes32 _code) external {
        _setTraderReferralCode(msg.sender, _code);
    }

    function registerCode(bytes32 _code) external {
        require(_code != bytes32(0), "ReferralStorage: invalid _code");
        require(codeOwners[_code] == address(0), "ReferralStorage: code already exists");

        codeOwners[_code] = msg.sender;
        ownerToCode[msg.sender] = _code;
        emit RegisterCode(msg.sender, _code);
    }

    function govSetCodeOwner(bytes32 _code, address _newAccount) external override onlyGov {
        require(_code != bytes32(0), "ReferralStorage: invalid _code");
        require(ownerToCode[_newAccount] == bytes32(0), "ReferralStorage: already exists");
        require(codeOwners[_code] == address(0), "ReferralStorage: code already exists");

        codeOwners[_code] = _newAccount;
        ownerToCode[_newAccount] = _code;
        emit GovSetCodeOwner(_code, _newAccount);
    }

    function getTraderReferralInfo(address _account) external override view returns (bytes32, address) {
        bytes32 code = traderReferralCodes[_account];
        address referrer;
        if (code != bytes32(0)) {
            referrer = codeOwners[code];
        }
        return (code, referrer);
    }

    function _setTraderReferralCode(address _account, bytes32 _code) private {
        traderReferralCodes[_account] = _code;
        emit SetTraderReferralCode(_account, _code);
    }
}
