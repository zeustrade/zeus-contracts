// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./helpers/TestBase.sol";
import {DeployAll} from "./helpers/DeployAll.sol";
import {IShortsTracker} from "../contracts/exchange/core/interfaces/IShortsTracker.sol";
import {USDG} from "../contracts/exchange/tokens/USDG.sol";

contract ZlpManagerTest is DeployAll {
    function testConstructor() public {
        assertEq(address(zlpManager.vault()), address(vault));
        assertEq(zlpManager.usdg(), address(usdg));
        assertEq(zlpManager.zlp(), address(zlp));
        assertEq(zlpManager.cooldownDuration(), COOLDOWN_DURATION);
        assertEq(zlpManager.gov(), admin);
    }

    function testSetInPrivateMode() public {
        vm.startPrank(admin);
        assertEq(zlpManager.inPrivateMode(), false);
        zlpManager.setInPrivateMode(true);
        assertEq(zlpManager.inPrivateMode(), true);
        zlpManager.setInPrivateMode(false);
        assertEq(zlpManager.inPrivateMode(), false);
        vm.stopPrank();
    }

    function testSetShortTracker() public {
        vm.startPrank(admin);
        IShortsTracker shortTracker = IShortsTracker(address(0));
        zlpManager.setShortsTracker(shortTracker);
        assertEq(address(shortTracker), address(zlpManager.shortsTracker()));
        vm.stopPrank();
    }

    function testAddLiquidityAndRemoveLiquidityFlow() public {
        uint256 depositAmount = 100e18;

        vm.startPrank(user);
        collateralToken.approve(address(zlpManager), uint256(-1));

        uint256 minted = zlpManager.addLiquidity(address(collateralToken), depositAmount, 0, 0);
        assertGt(minted, 0);
        assertEq(zlp.balanceOf(user), minted);
        assertEq(zlp.totalSupply(), minted);
        assertEq(zlpManager.lastAddedAt(user), block.timestamp);
        assertGt(vault.poolAmounts(address(collateralToken)), 0);
        assertGt(USDG(usdg).totalSupply(), 0);

        vm.expectRevert(bytes("ZlpManager: cooldown duration not yet passed"));
        zlpManager.removeLiquidity(address(collateralToken), minted / 2, 0, user);

        vm.warp(block.timestamp + COOLDOWN_DURATION + 1);
        uint256 userBalBefore = collateralToken.balanceOf(user);
        uint256 out = zlpManager.removeLiquidity(address(collateralToken), minted / 2, 0, user);
        assertGt(out, 0);
        assertEq(collateralToken.balanceOf(user), userBalBefore + out);
        vm.stopPrank();
    }

    function testAddLiquidityRevertsOnMinConstraints() public {
        uint256 depositAmount = 1e18;
        vm.startPrank(user);
        collateralToken.approve(address(zlpManager), uint256(-1));
        vm.expectRevert(bytes("ZlpManager: insufficient USDG output"));
        zlpManager.addLiquidity(address(collateralToken), depositAmount, uint256(-1), 0);
        vm.stopPrank();
    }

    function testHandlerPermissions() public {
        uint256 depositAmount = 10e18;

        vm.startPrank(user);
        collateralToken.approve(address(zlpManager), uint256(-1));
        vm.expectRevert(bytes("ZlpManager: forbidden"));
        zlpManager.addLiquidityForAccount(user, user, address(collateralToken), depositAmount, 0, 0);
        vm.stopPrank();

        vm.startPrank(admin);
        zlpManager.setHandler(user, true);
        vm.stopPrank();

        vm.startPrank(user);
        collateralToken.approve(address(zlpManager), uint256(-1));
        uint256 minted = zlpManager.addLiquidityForAccount(user, user, address(collateralToken), depositAmount, 0, 0);
        assertGt(minted, 0);
        vm.stopPrank();
    }

    function testSetCooldownDuration() public {
        vm.startPrank(user);
        vm.expectRevert(bytes("Governable: forbidden"));
        zlpManager.setCooldownDuration(10 minutes);
        vm.stopPrank();

        vm.startPrank(admin);
        zlpManager.setCooldownDuration(10 minutes);
        assertEq(zlpManager.cooldownDuration(), 10 minutes);
        vm.stopPrank();
    }

    function testSetShortsTrackerAveragePriceWeightValidation() public {
        vm.startPrank(admin);
        zlpManager.setShortsTrackerAveragePriceWeight(100);
        assertEq(zlpManager.shortsTrackerAveragePriceWeight(), 100);
        vm.expectRevert(bytes("ZlpManager: invalid weight"));
        zlpManager.setShortsTrackerAveragePriceWeight(100001);
        vm.stopPrank();
    }

    function testAumAdjustmentShiftsAumInUsdg() public {
        uint256 beforeMax = zlpManager.getAumInUsdg(true);
        uint256 beforeMin = zlpManager.getAumInUsdg(false);

        vm.prank(admin);
        zlpManager.setAumAdjustment(2e30, 1e30);

        uint256 afterMax = zlpManager.getAumInUsdg(true);
        uint256 afterMin = zlpManager.getAumInUsdg(false);

        assertEq(afterMax, beforeMax + 1e18);
        assertEq(afterMin, beforeMin + 1e18);
    }

    function testAumAdjustmentZeroFloor() public {
        vm.startPrank(admin);
        zlpManager.setAumAdjustment(0, uint256(-1));
        vm.stopPrank();

        assertEq(zlpManager.getAumInUsdg(true), 0);
        assertEq(zlpManager.getAumInUsdg(false), 0);
    }

    function testRemoveLiquidityForAccount() public {
        uint256 depositAmount = 100e18;

        vm.startPrank(admin);
        zlpManager.setHandler(user, true);
        vm.stopPrank();

        vm.startPrank(user);
        collateralToken.approve(address(zlpManager), uint256(-1));
        uint256 minted = zlpManager.addLiquidityForAccount(user, user, address(collateralToken), depositAmount, 0, 0);
        assertGt(minted, 0);
        vm.stopPrank();

        vm.warp(block.timestamp + COOLDOWN_DURATION + 1);

        vm.startPrank(user);
        uint256 userZlpBefore = zlp.balanceOf(user);
        uint256 userTokenBefore = collateralToken.balanceOf(user);
        uint256 amountOut = zlpManager.removeLiquidityForAccount(user, address(collateralToken), minted / 2, 0, user);
        assertGt(amountOut, 0);
        assertEq(zlp.balanceOf(user), userZlpBefore - (minted / 2));
        assertEq(collateralToken.balanceOf(user), userTokenBefore + amountOut);
        vm.stopPrank();
    }

    function testGetPriceAfterLiquidity() public {
        uint256 depositAmount = 50e18;
        vm.startPrank(user);
        collateralToken.approve(address(zlpManager), uint256(-1));
        uint256 minted = zlpManager.addLiquidity(address(collateralToken), depositAmount, 0, 0);
        vm.stopPrank();
        assertGt(minted, 0);

        uint256 priceMax = zlpManager.getPrice(true);
        uint256 priceMin = zlpManager.getPrice(false);
        assertGt(priceMax, 0);
        assertGt(priceMin, 0);

        uint256 supply = zlp.totalSupply();
        uint256 aumMax = zlpManager.getAum(true);
        uint256 aumMin = zlpManager.getAum(false);
        assertEq(priceMax, (aumMax * 1e18) / supply);
        assertEq(priceMin, (aumMin * 1e18) / supply);
    }

    function testGetAumsAndAumInUsdgConsistency() public {
        vm.startPrank(user);
        collateralToken.approve(address(zlpManager), uint256(-1));
        zlpManager.addLiquidity(address(collateralToken), 10e18, 0, 0);
        vm.stopPrank();

        uint256[] memory aums = zlpManager.getAums();
        assertEq(aums.length, 2);

        uint256 aumMax = zlpManager.getAum(true);
        uint256 aumMin = zlpManager.getAum(false);
        assertEq(aums[0], aumMax);
        assertEq(aums[1], aumMin);

        uint256 inUsdgMax = zlpManager.getAumInUsdg(true);
        uint256 inUsdgMin = zlpManager.getAumInUsdg(false);
        assertEq(inUsdgMax, (aumMax * 1e18) / 1e30);
        assertEq(inUsdgMin, (aumMin * 1e18) / 1e30);
    }

    function testGetGlobalShortAveragePriceUsesShortsTracker() public {
        assertEq(zlpManager.shortsTrackerAveragePriceWeight(), 0);
        assertEq(zlpManager.getGlobalShortAveragePrice(address(collateralToken)), 0);

        address[] memory tokens = new address[](1);
        tokens[0] = address(collateralToken);
        uint256[] memory avgPrices = new uint256[](1);
        avgPrices[0] = 123e30;

        vm.startPrank(admin);
        shortsTracker.setInitData(tokens, avgPrices);
        zlpManager.setShortsTrackerAveragePriceWeight(10000);
        vm.stopPrank();

        assertEq(zlpManager.getGlobalShortAveragePrice(address(collateralToken)), 123e30);
    }

    function testGetGlobalShortDeltaComputation() public {
        address[] memory tokens = new address[](1);
        tokens[0] = address(collateralToken);
        uint256[] memory avgPrices = new uint256[](1);
        avgPrices[0] = 100e30;

        vm.startPrank(admin);
        shortsTracker.setInitData(tokens, avgPrices);
        zlpManager.setShortsTrackerAveragePriceWeight(10000);
        vm.stopPrank();

        uint256 size = 1000e30;
        uint256 priceBelow = 80e30;
        (uint256 delta1, bool hasProfit1) = zlpManager.getGlobalShortDelta(address(collateralToken), priceBelow, size);
        assertEq(delta1, 200e30);
        assertTrue(hasProfit1);

        uint256 priceAbove = 120e30;
        (uint256 delta2, bool hasProfit2) = zlpManager.getGlobalShortDelta(address(collateralToken), priceAbove, size);
        assertEq(delta2, 200e30);
        assertFalse(hasProfit2);
    }
}
