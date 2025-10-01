// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./helpers/TestBase.sol";
import {DeployAll} from "./helpers/DeployAll.sol";
import {IZlpManager} from "../contracts/exchange/core/interfaces/IZlpManager.sol";
import {IERC20} from "../contracts/exchange/libraries/token/IERC20.sol";
import {ZlpBalance} from "../contracts/exchange/staking/ZlpBalance.sol";

contract ZlpBalanceTest is DeployAll {
    ZlpBalance public zlpBalance;
    address public receiver;

    function setUp() public override {
        DeployAll.setUp();
        receiver = address(uint160(uint256(keccak256(abi.encodePacked("Receiver")))));
        zlpBalance = new ZlpBalance(IZlpManager(address(zlpManager)), address(stakedZlpTracker));
    }

    function _mintAndStakeZlpETH(address account, uint256 ethAmount) internal returns (uint256 minted) {
        vm.deal(account, ethAmount);
        vm.prank(account);
        minted = rewardRouter.mintAndStakeZlpETH{value: ethAmount}(0, 0);
    }

    function _addLiquidityDirectly(address account, uint256 ethAmount) internal returns (uint256 minted) {
        vm.deal(account, ethAmount);
        vm.prank(account);
        uint256 tokenAmount = ethAmount;
        collateralToken.mint(account, tokenAmount);
        collateralToken.approve(address(zlpManager), tokenAmount);
        minted = zlpManager.addLiquidity(address(collateralToken), tokenAmount, 0, 0);

        vm.prank(account);
        zlp.approve(address(stakedZlpTracker), minted);
        stakedZlpTracker.stakeForAccount(account, account, address(zlp), minted);
    }
}
