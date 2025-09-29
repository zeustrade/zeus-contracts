// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./helpers/TestBase.sol";
import {SafeMath} from "../contracts/exchange/libraries/math/SafeMath.sol";

import {DeployAll} from "./helpers/DeployAll.sol";
import {IRewardTracker} from "../contracts/exchange/staking/interfaces/IRewardTracker.sol";

contract RewardRouterV2Test is DeployAll {
    function testInitializeParameters() public {
        assertEq(rewardRouter.weth(), address(weth));
        assertEq(rewardRouter.zus(), address(zus));
        assertEq(rewardRouter.zlp(), address(zlp));
        assertEq(rewardRouter.stakedZusTracker(), address(stakedZusTracker));
        assertEq(rewardRouter.feeZlpTracker(), address(feeZlpTracker));
        assertEq(rewardRouter.stakedZlpTracker(), address(stakedZlpTracker));
        assertEq(rewardRouter.zlpManager(), address(zlpManager));
    }

    function testInitializeRevertsWhenCalledTwice() public {
        vm.startPrank(admin);
        vm.expectRevert(bytes("RewardRouter: already initialized"));
        rewardRouter.initialize(
            address(weth),
            address(zus),
            address(zlp),
            address(stakedZusTracker),
            address(feeZlpTracker),
            address(stakedZlpTracker),
            address(zlpManager)
        );
        vm.stopPrank();
    }

    function testMintStakeZlpWithToken() public {
        uint256 depositAmount = 150e18;
        vm.startPrank(user);
        collateralToken.approve(address(rewardRouter), uint256(-1));
        uint256 minted = rewardRouter.mintAndStakeZlp(address(collateralToken), depositAmount, 0, 0);
        assertGt(minted, 0);
        assertEq(IRewardTracker(feeZlpTracker).depositedBalances(user, address(zlp)), minted);
        assertEq(IRewardTracker(stakedZlpTracker).depositedBalances(user, address(feeZlpTracker)), minted);
        vm.stopPrank();
    }

    function testUnstakeAndRedeemZlpETH() public {
        uint256 ethAmount = 2 ether;
        vm.deal(user, ethAmount);
        vm.startPrank(user);
        uint256 minted = rewardRouter.mintAndStakeZlpETH{value: ethAmount}(0, 0);
        assertGt(minted, 0);
        vm.warp(block.timestamp + COOLDOWN_DURATION + 1);
        uint256 userEthBefore = user.balance;
        uint256 redeemAmount = minted / 2;
        uint256 out = rewardRouter.unstakeAndRedeemZlpETH(redeemAmount, 0, payable(user));
        assertGt(out, 0);
        assertEq(user.balance, userEthBefore + out);
        vm.stopPrank();
    }

    function testHandleRewardsClaimWethNoConvert() public {
        vm.deal(user, 1 ether);
        vm.prank(user);
        rewardRouter.mintAndStakeZlpETH{value: 1 ether}(0, 0);
        vm.warp(block.timestamp + 1 hours);
        uint256 wethBefore = weth.balanceOf(user);
        vm.prank(user);
        rewardRouter.handleRewards(false);
        assertGt(weth.balanceOf(user), wethBefore);
    }

    function testHandleRewardsClaimWethConvertToEth() public {
        vm.deal(user, 1 ether);
        vm.prank(user);
        rewardRouter.mintAndStakeZlpETH{value: 1 ether}(0, 0);
        vm.warp(block.timestamp + 1 hours);
        uint256 ethBefore = user.balance;
        uint256 wethBefore = weth.balanceOf(user);
        vm.prank(user);
        rewardRouter.handleRewards(true);
        assertGt(user.balance, ethBefore);
        assertEq(weth.balanceOf(user), wethBefore);
    }

    function testSignalAndAcceptTransferZusAndZlp() public {
        uint256 zusAmount = 50e18;
        vm.prank(admin);
        zus.transfer(user, zusAmount);
        vm.deal(user, 5 ether);
        vm.startPrank(user);
        zus.approve(address(stakedZusTracker), uint256(-1));
        rewardRouter.stakeZus(zusAmount);
        uint256 minted = rewardRouter.mintAndStakeZlpETH{value: 1 ether}(0, 0);
        assertGt(minted, 0);
        vm.stopPrank();

        address receiver = address(uint160(uint256(keccak256(abi.encodePacked("Receiver")))));

        vm.prank(user);
        rewardRouter.signalTransfer(receiver);

        vm.prank(receiver);
        rewardRouter.acceptTransfer(user);

        assertEq(IRewardTracker(stakedZusTracker).depositedBalances(user, address(zus)), 0);
        assertEq(IRewardTracker(feeZlpTracker).depositedBalances(user, address(zlp)), 0);
        assertEq(IRewardTracker(stakedZlpTracker).depositedBalances(user, address(feeZlpTracker)), 0);

        assertEq(IRewardTracker(stakedZusTracker).depositedBalances(receiver, address(zus)), zusAmount);
        assertEq(IRewardTracker(feeZlpTracker).depositedBalances(receiver, address(zlp)), minted);
        assertEq(IRewardTracker(stakedZlpTracker).depositedBalances(receiver, address(feeZlpTracker)), minted);
    }

    function testWithdrawToken() public {
        Token randomToken = new Token();
        uint256 amount = 10e18;
        randomToken.mint(user, amount);
        vm.prank(user);
        randomToken.transfer(address(rewardRouter), amount);
        uint256 balanceBefore = randomToken.balanceOf(user);
        vm.prank(admin);
        rewardRouter.withdrawTokensOrETH(address(randomToken), user, amount);
        uint256 balanceAfter = randomToken.balanceOf(user);
        assertEq(balanceAfter, balanceBefore + amount);
    }

    function testStakeAndUnstakeZusFlow() public {
        uint256 amount = 100e18;
        vm.prank(admin);
        zus.transfer(user, amount);
        vm.startPrank(user);
        zus.approve(address(stakedZusTracker), uint256(-1));
        rewardRouter.stakeZus(amount);
        assertEq(IRewardTracker(stakedZusTracker).depositedBalances(user, address(zus)), amount);
        uint256 unstakeAmount = 40e18;
        rewardRouter.unstakeZus(unstakeAmount);
        assertEq(IRewardTracker(stakedZusTracker).depositedBalances(user, address(zus)), amount - unstakeAmount);
        vm.stopPrank();
    }

    function testMintStakeZlpETHAndUnstakeRedeemFlow() public {
        uint256 ethAmount = 2 ether;
        vm.deal(user, ethAmount);
        vm.startPrank(user);
        uint256 minted = rewardRouter.mintAndStakeZlpETH{value: ethAmount}(0, 0);
        assertGt(minted, 0);
        assertEq(IRewardTracker(feeZlpTracker).depositedBalances(user, address(zlp)), minted);
        assertEq(IRewardTracker(stakedZlpTracker).depositedBalances(user, address(feeZlpTracker)), minted);
        vm.warp(block.timestamp + COOLDOWN_DURATION + 1);
        uint256 userBalBefore = weth.balanceOf(user);
        uint256 redeemAmount = minted / 2;
        uint256 out = rewardRouter.unstakeAndRedeemZlp(address(weth), redeemAmount, 0, user);
        assertGt(out, 0);
        assertEq(weth.balanceOf(user), userBalBefore + out);
        assertEq(IRewardTracker(feeZlpTracker).depositedBalances(user, address(zlp)), minted - redeemAmount);
        assertEq(
            IRewardTracker(stakedZlpTracker).depositedBalances(user, address(feeZlpTracker)), minted - redeemAmount
        );
        vm.stopPrank();
    }

    function testClaimAndClaimFees() public {
        vm.deal(user, 1 ether);
        vm.startPrank(user);
        uint256 minted = rewardRouter.mintAndStakeZlpETH{value: 1 ether}(0, 0);
        assertGt(minted, 0);
        vm.stopPrank();
        vm.warp(block.timestamp + 1 hours);
        uint256 wethBefore = weth.balanceOf(user);
        uint256 zusBefore = zus.balanceOf(user);
        vm.prank(user);
        rewardRouter.claim();
        assertGt(weth.balanceOf(user), wethBefore);
        assertGt(zus.balanceOf(user), zusBefore);
        vm.warp(block.timestamp + 30 minutes);
        uint256 wethBefore2 = weth.balanceOf(user);
        uint256 zusBefore2 = zus.balanceOf(user);
        vm.prank(user);
        rewardRouter.claimFees();
        assertGt(weth.balanceOf(user), wethBefore2);
        assertEq(zus.balanceOf(user), zusBefore2);
    }
}

interface TokenLike {
    function mint(address to, uint256 amount) external;
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address) external view returns (uint256);
}

contract Token is TokenLike {
    using SafeMath for uint256;

    string public name = "T";
    string public symbol = "T";
    uint8 public decimals = 18;
    mapping(address => uint256) public override balanceOf;

    function mint(address to, uint256 amt) external override {
        balanceOf[to] = balanceOf[to].add(amt);
    }

    function transfer(address to, uint256 amt) external override returns (bool) {
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(amt);
        balanceOf[to] = balanceOf[to].add(amt);
        return true;
    }
}
