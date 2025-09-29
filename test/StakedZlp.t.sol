// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./helpers/TestBase.sol";
import {DeployAll} from "./helpers/DeployAll.sol";
import {StakedZlp} from "../contracts/exchange/staking/StakedZlp.sol";
import {IZLP} from "../contracts/exchange/zus/interfaces/IZLP.sol";
import {IZlpManager} from "../contracts/exchange/core/interfaces/IZlpManager.sol";

contract StakedZlpTest is DeployAll {
    StakedZlp public stakedZlp;
    address public receiver;

    function setUp() public override {
        DeployAll.setUp();

        receiver = address(uint160(uint256(keccak256(abi.encodePacked("Receiver")))));

        vm.startPrank(admin);
        stakedZlp = new StakedZlp(address(zlp), zlpManager, address(stakedZlpTracker), address(feeZlpTracker));
        feeZlpTracker.setHandler(address(stakedZlp), true);
        stakedZlpTracker.setHandler(address(stakedZlp), true);
        vm.stopPrank();
    }

    function _mintAndStakeZlpETH(address account, uint256 ethAmount) internal returns (uint256 minted) {
        vm.deal(account, ethAmount);
        vm.prank(account);
        minted = rewardRouter.mintAndStakeZlpETH{value: ethAmount}(0, 0);
    }

    function testBalanceOfAndTotalSupplyReflectTrackers() public {
        uint256 minted = _mintAndStakeZlpETH(user, 1 ether);
        assertGt(minted, 0);

        assertEq(stakedZlp.balanceOf(user), feeZlpTracker.depositedBalances(user, address(zlp)));
        assertEq(stakedZlp.totalSupply(), stakedZlpTracker.totalSupply());
    }

    function testTransferMovesStakeAfterCooldown() public {
        uint256 minted = _mintAndStakeZlpETH(user, 2 ether);
        assertGt(minted, 0);

        uint256 amount = minted / 2;
        vm.mockCall(
            address(zlp),
            abi.encodeWithSelector(IZLP.lastAddedAt.selector, user),
            abi.encode(block.timestamp - COOLDOWN_DURATION - 1)
        );

        uint256 senderDepositBefore = feeZlpTracker.depositedBalances(user, address(zlp));
        uint256 receiverDepositBefore = feeZlpTracker.depositedBalances(receiver, address(zlp));

        vm.prank(user);
        bool ok = stakedZlp.transfer(receiver, amount);
        assertTrue(ok);

        assertEq(feeZlpTracker.depositedBalances(user, address(zlp)), senderDepositBefore - amount);
        assertEq(feeZlpTracker.depositedBalances(receiver, address(zlp)), receiverDepositBefore + amount);
    }

    function testApproveAndTransferFromDecreasesAllowance() public {
        uint256 minted = _mintAndStakeZlpETH(user, 2 ether);
        assertGt(minted, 0);

        uint256 amount = minted / 3;
        vm.warp(block.timestamp + COOLDOWN_DURATION + 1);

        address spender = address(uint160(uint256(keccak256(abi.encodePacked("Spender")))));
        vm.prank(user);
        assertTrue(stakedZlp.approve(spender, amount));
        assertEq(stakedZlp.allowance(user, spender), amount);

        vm.prank(user);
        stakedZlp.approve(spender, amount * 2);
        assertEq(stakedZlp.allowance(user, spender), amount * 2);
    }

    function testApproveZeroSpenderReverts() public {
        vm.prank(user);
        vm.expectRevert(bytes("StakedZlp: approve to the zero address"));
        stakedZlp.approve(address(0), 1);
    }

    function testTransferFromHasLogicalIssue() public {
        uint256 minted = _mintAndStakeZlpETH(user, 1 ether);
        assertGt(minted, 0);

        vm.mockCall(
            address(zlp),
            abi.encodeWithSelector(IZLP.lastAddedAt.selector, user),
            abi.encode(block.timestamp - COOLDOWN_DURATION - 1)
        );

        address spender = address(uint160(uint256(keccak256(abi.encodePacked("Spender")))));
        vm.prank(user);
        stakedZlp.approve(spender, minted / 2);

        uint256 amount = minted / 2;
        uint256 senderDepositBefore = feeZlpTracker.depositedBalances(user, address(zlp));
        uint256 receiverDepositBefore = feeZlpTracker.depositedBalances(receiver, address(zlp));

        vm.prank(spender);
        bool ok = stakedZlp.transferFrom(user, receiver, amount);
        assertTrue(ok);

        assertEq(feeZlpTracker.depositedBalances(user, address(zlp)), senderDepositBefore - amount);
        assertEq(feeZlpTracker.depositedBalances(receiver, address(zlp)), receiverDepositBefore + amount);
    }
}
