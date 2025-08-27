// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./helpers/TestBase.sol";
import {DeployAll} from "./helpers/DeployAll.sol";
import {StakedZlpMigrator} from "../contracts/exchange/staking/StakedZlpMigrator.sol";

contract StakedZlpMigratorTest is DeployAll {
    StakedZlpMigrator public migrator;
    address public receiver;

    function setUp() public override {
        DeployAll.setUp();
        receiver = address(uint160(uint256(keccak256(abi.encodePacked("Receiver")))));

        vm.startPrank(admin);
        migrator = new StakedZlpMigrator(user, address(zlp), address(stakedZlpTracker), address(feeZlpTracker));
        feeZlpTracker.setHandler(address(migrator), true);
        stakedZlpTracker.setHandler(address(migrator), true);
        vm.stopPrank();

        vm.deal(user, 2 ether);
        vm.prank(user);
        rewardRouter.mintAndStakeZlpETH{value: 2 ether}(0, 0);
    }

    function _mintAndStakeZlpETH(address account, uint256 ethAmount) internal returns (uint256 minted) {
        vm.deal(account, ethAmount);
        vm.prank(account);
        minted = rewardRouter.mintAndStakeZlpETH{value: ethAmount}(0, 0);
    }

    function testTransferMigratesStake() public {
        uint256 minted = _mintAndStakeZlpETH(user, 2 ether);
        assertGt(minted, 0);

        uint256 amount = feeZlpTracker.depositBalances(user, address(zlp)) / 2;
        assertGt(amount, 0);

        uint256 senderFeeBefore = feeZlpTracker.depositBalances(user, address(zlp));
        uint256 senderStakedBefore = stakedZlpTracker.depositBalances(user, address(feeZlpTracker));
        uint256 recvFeeBefore = feeZlpTracker.depositBalances(receiver, address(zlp));
        uint256 recvStakedBefore = stakedZlpTracker.depositBalances(receiver, address(feeZlpTracker));

        vm.prank(admin);
        migrator.transfer(receiver, amount);

        assertEq(feeZlpTracker.depositBalances(user, address(zlp)), senderFeeBefore - amount);
        assertEq(stakedZlpTracker.depositBalances(user, address(feeZlpTracker)), senderStakedBefore - amount);
        assertEq(feeZlpTracker.depositBalances(receiver, address(zlp)), recvFeeBefore + amount);
        assertEq(stakedZlpTracker.depositBalances(receiver, address(feeZlpTracker)), recvStakedBefore + amount);
    }

    function testDisablePreventsTransfer() public {
        vm.prank(admin);
        migrator.disable();

        vm.prank(admin);
        vm.expectRevert(bytes("StakedZlpMigrator: not enabled"));
        migrator.transfer(receiver, 1);
    }
}
