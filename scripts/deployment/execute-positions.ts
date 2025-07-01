// get vault stats

import { ethers } from "hardhat";
import { VaultErrorController } from "../../typechain-types/core/VaultErrorController";

import { PositionRouter } from "../../typechain-types/core/PositionRouter";
import { PositionUtils } from "../../typechain-types/core/PositionUtils";

async function main() {

    const PositionUtilsFactory = await ethers.getContractFactory("PositionUtils");
    const positionUtils = (await PositionUtilsFactory.attach("0x243bAE2098d121a92e6F4fFFdb27A4A35Ea2306e")) as unknown as PositionUtils;
  
    const PositionRouterFactory = await ethers.getContractFactory("PositionRouter", {libraries: {PositionUtils: positionUtils.target.toString()}});
    const positionRouter = await PositionRouterFactory.attach("0xDa5e1385631EC333aCBD2F510C715E44611D208d") as unknown as PositionRouter;

    let queueLengths;

    for (let i = 0; i < 1000; i++) {
        console.log("--------------------------------");
        console.log("step:", i);
        queueLengths = await positionRouter.getRequestQueueLengths();
        console.log("queueLengthsBefore:", queueLengths);
        
        const tx = await positionRouter.executeDecreasePositions(queueLengths[2] + 150n, "0x0000000000000000000000000000000000000000");
        await tx.wait();
        console.log("tx:", tx.hash);

        queueLengths = await positionRouter.getRequestQueueLengths();
        console.log("queueLengthsAfter:", queueLengths);
    }



}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });