import { ethers } from "hardhat";

import { OrderBook } from "../../typechain-types/core/OrderBook";

const ROUTER_ADDRESS = '0xd15b5531050AC78Aa78AeF8A6DE4256Fa4536107';
const VAULT_ADDRESS = '0xf530AD425154CC9635CAaD538e8bf3C638191a4E';
const WETH_ADDRESS = '0x4200000000000000000000000000000000000006';
const USDG_ADDRESS = '0xef667bc447a82e48640c824bd7d865a871836fba';
const MIN_EXECUTION_FEE = '100000000000000';
const MINT_PURCHASE_TOKEN_AMOUNT_USDG = '10000000000000000000000000000000';

async function main() {
  const OrderBookFactory = await ethers.getContractFactory("OrderBook");
  const orderBook = await OrderBookFactory.deploy() as OrderBook;
  console.log("OrderBook deployed:", orderBook.target);

  

  await orderBook.initialize(
    ROUTER_ADDRESS,
    VAULT_ADDRESS,
    WETH_ADDRESS,
    USDG_ADDRESS,
    MIN_EXECUTION_FEE,
    MINT_PURCHASE_TOKEN_AMOUNT_USDG
  );
    
  console.log('OrderBook initialized successfully');

  const router = await ethers.getContractAt("Router", ROUTER_ADDRESS);
  await router.addPlugin(orderBook.target.toString());
  await new Promise(resolve => setTimeout(resolve, 5000));
  await router.approvePlugin(orderBook.target.toString());
  await new Promise(resolve => setTimeout(resolve, 5000));

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });