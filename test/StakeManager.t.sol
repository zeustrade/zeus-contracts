// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import './helpers/TestBase.sol';
import {DeployAll} from './helpers/DeployAll.sol';
import {StakeManager} from '../contracts/exchange/staking/StakeManager.sol';

contract StakeManagerTest is DeployAll {
    StakeManager public stakeManager;
    address public alice;

    function setUp() public override {
        DeployAll.setUp();
        stakeManager = new StakeManager();
        alice = address(uint160(uint256(keccak256(abi.encodePacked('Alice')))));

        vm.prank(stakeManager.gov());
        stakeManager.setGov(admin);

        vm.startPrank(admin);
        stakedZusTracker.setHandler(address(stakeManager), true);
        vm.stopPrank();
    }

    function testOnlyGovCanStakeForAccount() public {
        uint256 amount = 10e18;
        vm.prank(admin);
        zus.transfer(alice, amount);
        vm.prank(alice);
        zus.approve(address(stakedZusTracker), uint256(-1));

        vm.prank(user);
        vm.expectRevert(bytes('Governable: forbidden'));
        stakeManager.stakeForAccount(address(stakedZusTracker), alice, address(zus), amount);
    }

    function testStakeForAccountHappyPath() public {
        uint256 amount = 25e18;
        vm.prank(admin);
        zus.transfer(alice, amount);
        vm.startPrank(alice);
        zus.approve(address(stakedZusTracker), uint256(-1));
        vm.stopPrank();
        vm.prank(admin);
        stakeManager.stakeForAccount(address(stakedZusTracker), alice, address(zus), amount);
        assertEq(stakedZusTracker.depositBalances(alice, address(zus)), amount);
        assertEq(stakedZusTracker.stakedAmounts(alice), amount);
    }
}
