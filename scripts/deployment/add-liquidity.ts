// get vault stats

import { ethers } from "hardhat";
import { VaultErrorController } from "../../typechain-types/core/VaultErrorController";

import { ZlpManager } from "../../typechain-types/core/ZlpManager";
import { TestToken } from "../../typechain-types/tokens/TestToken";
import { W5IRE } from "../../typechain-types/tokens/W5IRE";

async function main() {

    const TestTokenFactory = await ethers.getContractFactory("TestToken");
    const W5IREFactory = await ethers.getContractFactory("W5IRE");

    const w5ire = (await W5IREFactory.attach("0x7ca51e8c2600bc369011ffEE067fD5E87c5fE712")) as unknown as W5IRE;
    console.log("w5ire:", w5ire.target);

    const wbtc = (await TestTokenFactory.attach("0x0b3BC705ff5335D31f66057C626915b637aa3685")) as unknown as TestToken;
    console.log("wbtc:", wbtc.target);

    const eth = (await TestTokenFactory.attach("0xf27D49dc283Df73af8436f0Ea7FFa63293956fad")) as unknown as TestToken;
    console.log("eth:", eth.target);

    const usdt = (await TestTokenFactory.attach("0x2B32B587d0b1f7e1336d9526c53803A775bE5e4A")) as unknown as TestToken;
    console.log("usdt:", usdt.target);

    const usdc = (await TestTokenFactory.attach("0x067308617bBA98E09e2c0089DEEDBF40C29b2526")) as unknown as TestToken;
    console.log("usdc:", usdc.target);

    const zlpManager = await ethers.getContractAt("ZlpManager", "0xfC5cf8AA5f0CC709586D0c96Ecbf934f0b041912") as unknown as ZlpManager;
    
    // await w5ire.approve(zlpManager.target, ethers.MaxUint256);
    // await wbtc.approve(zlpManager.target, ethers.MaxUint256);
    // await eth.approve(zlpManager.target, ethers.MaxUint256);
    // await usdt.approve(zlpManager.target, ethers.MaxUint256);
    // await usdc.approve(zlpManager.target, ethers.MaxUint256);


    await w5ire.deposit({value: ethers.parseUnits("1000000", 18)});

    const tx = await zlpManager.addLiquidity(
        w5ire.target,
        ethers.parseUnits("1000000", 18),
        0,
        0
    )
    await tx.wait();
    console.log("Liquidity added, tx: ", tx.hash);



}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });