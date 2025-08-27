const { ethers } = require("hardhat");

async function main() {
  // Address of Umbrella Registry contract
  const REGISTRY_ADDRESS = "0x8C0D76C9B18779665475F3E212D9Ca1Ed6A1A0e6"; // Polygon Mainnet
  
  // Key for the price feed you want to query (example for ETH/USD)
  const PRICE_FEED_KEY = ethers.utils.formatBytes32String("ETH-USD");

  // Get Registry contract interface
  const Registry = await ethers.getContractAt(
    "IRegistry", // ABI interface name
    REGISTRY_ADDRESS
  );

  try {
    // Get latest price data
    const priceData = await Registry.getCurrentPrice(PRICE_FEED_KEY);
    
    // Parse price data
    const price = ethers.utils.formatUnits(priceData.price, priceData.decimals);
    
    console.log(`Latest price: ${price}`);
    console.log(`Timestamp: ${priceData.timestamp}`);
    console.log(`Decimals: ${priceData.decimals}`);

  } catch (error) {
    console.error("Ошибка при получении цены:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 