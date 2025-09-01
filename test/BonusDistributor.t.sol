// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./helpers/TestBase.sol";
import {DeployAll} from "./helpers/DeployAll.sol";
import {BonusDistributor} from "../contracts/exchange/staking/BonusDistributor.sol";
import {IERC20} from "../contracts/exchange/libraries/token/IERC20.sol";

contract BonusDistributorTest is DeployAll {
    BonusDistributor public bonus;

    function setUp() public override {
        DeployAll.setUp();
        bonus = new BonusDistributor(address(zus), address(stakedZusTracker));
        vm.prank(bonus.gov());
        bonus.setGov(admin);
        vm.startPrank(admin);
        bonus.acceptGov();
        stakedZusTracker.setHandler(address(bonus), true);
        vm.stopPrank();
    }

    function testAdminAndGov() public {
        vm.prank(admin);
        bonus.setAdmin(admin);
        vm.prank(admin);
        bonus.updateLastDistributionTime();
        vm.prank(admin);
        bonus.setBonusMultiplier(1000);
        assertEq(bonus.tokensPerInterval(), (IERC20(address(stakedZusTracker)).totalSupply() * 1000) / 10000 / 365 days);
    }
}
