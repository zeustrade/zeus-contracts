// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "forge-std/Script.sol";
import "forge-std/console2.sol";

import {ReferralStorageV2} from "../contracts/exchange/referrals/ReferralStorageV2.sol";
import {PositionRouter} from "../contracts/exchange/core/PositionRouter.sol";
import {PositionManager} from "../contracts/exchange/core/PositionManager.sol";

contract SetRefStorageV2 is Script {
    address payable public positionRouter = 0x857e1Cd7EB1E527153ceB6476494679C3B61037D;
    address payable public positionManager = 0x7a93a88E2Fb48801963f3e3581b14FAa50F99Cc6;

    function run() public {
        // address deployer = vm.envAddress('DEPLOYER');

        vm.startBroadcast();

        ReferralStorageV2 ref = new ReferralStorageV2();
        console2.log("ReferralStorageV2:", address(ref));

        ref.setHandler(positionRouter, true);
        ref.setHandler(positionManager, true);

        ref.setTier(0, 0, 1000); // default: 10% to referrer, 0% to trader

        PositionRouter(positionRouter).setReferralStorage(address(ref));
        PositionManager(positionManager).setReferralStorage(address(ref));

        console2.log("PositionRouter setReferralStorage ->", positionRouter);
        console2.log("PositionManager setReferralStorage ->", positionManager);

        vm.stopBroadcast();
    }
}
