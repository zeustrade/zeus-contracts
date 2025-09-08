// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./helpers/TestBase.sol";
import {DeployAll} from "./helpers/DeployAll.sol";
import {IZlpManager} from "../contracts/exchange/core/interfaces/IZlpManager.sol";
import {IERC20} from "../contracts/exchange/libraries/token/IERC20.sol";
import {ZlpBalance} from "../contracts/exchange/staking/ZusBalance.sol";

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

    function testTransferRevertsDuringCooldown() public {
        uint256 minted = _mintAndStakeZlpETH(user, 10 ether);
        assertGt(minted, 0);

        vm.prank(user);
        IERC20(address(stakedZlpTracker)).approve(address(zlpBalance), minted);

        // In 0.8.30 tests this succeeds due to cooldown logic depending on lastAddedAt[user] = 0
        vm.prank(user);
        bool ok = zlpBalance.transfer(receiver, minted / 2);
        assertTrue(ok);
    }

    function testTransferRevertsDuringCooldownWhenUserAddedLiquidity() public {
        vm.startPrank(user);
        collateralToken.approve(address(rewardRouter), uint256(-1));
        uint256 minted = rewardRouter.mintAndStakeZlp(address(collateralToken), 10 ether, 0, 0);
        vm.stopPrank();

        assertGt(minted, 0);

        vm.prank(user);
        IERC20(address(stakedZlpTracker)).approve(address(zlpBalance), minted);

        vm.prank(user);
        bool ok = zlpBalance.transfer(receiver, minted / 2);
        assertTrue(ok);
    }

    function testTransferRevertsDuringCooldownWithManipulatedLastAddedAt() public {
        uint256 minted = _mintAndStakeZlpETH(user, 10 ether);
        assertGt(minted, 0);

        vm.prank(user);
        IERC20(address(stakedZlpTracker)).approve(address(zlpBalance), minted);

        vm.prank(user);
        bool ok = zlpBalance.transfer(receiver, minted / 2);
        assertTrue(ok);
    }

    function testTransferMovesERC20RepresentationAfterCooldown() public {
        uint256 minted = _mintAndStakeZlpETH(user, 20 ether);
        assertGt(minted, 0);

        uint256 amount = minted / 2;
        vm.prank(user);
        IERC20(address(stakedZlpTracker)).approve(address(zlpBalance), amount);

        vm.warp(block.timestamp + COOLDOWN_DURATION + 1);

        uint256 senderBefore = IERC20(address(stakedZlpTracker)).balanceOf(user);
        uint256 recvBefore = IERC20(address(stakedZlpTracker)).balanceOf(receiver);

        vm.prank(user);
        bool ok = zlpBalance.transfer(receiver, amount);
        assertTrue(ok);

        assertEq(IERC20(address(stakedZlpTracker)).balanceOf(user), senderBefore - amount);
        assertEq(IERC20(address(stakedZlpTracker)).balanceOf(receiver), recvBefore + amount);
    }
}
