// get vault stats

import { ethers } from "hardhat";
import { Vault } from "../../typechain-types/core/Vault";

async function main() {

  const vault1 = await ethers.getContractAt("Vault", "0xAE296bAF15F1c9AC5478df837BEf00B130E8d11b") as unknown as Vault;
  // const vault2 = await ethers.getContractAt("Vault", "0x1c607eD4Fd933bC1927ec8476c9172f90a024148") as unknown as Vault;

  console.log("Vault1 isInitialized: ", await vault1.isInitialized());
  // console.log("Vault2 isInitialized: ", await vault2.isInitialized());

  console.log("Vault1 isSwapEnabled: ", await vault1.isSwapEnabled());
  // console.log("Vault2 isSwapEnabled: ", await vault2.isSwapEnabled());

  console.log("Vault1 isLeverageEnabled: ", await vault1.isLeverageEnabled());
  // console.log("Vault2 isLeverageEnabled: ", await vault2.isLeverageEnabled());
  
  console.log("Vault1 whitelistedTokenCount: ", await vault1.whitelistedTokenCount());
  // console.log("Vault2 whitelistedTokenCount: ", await vault2.whitelistedTokenCount());

  console.log("Vault1 maxLeverage: ", await vault1.maxLeverage());
  //  console.log("Vault2 maxLeverage: ", await vault2.maxLeverage());

  console.log("Vault1 liquidationFeeUsd: ", await vault1.liquidationFeeUsd());
  //  console.log("Vault2 liquidationFeeUsd: ", await vault2.liquidationFeeUsd());

  console.log("Vault1 taxBasisPoints: ", await vault1.taxBasisPoints());
  // console.log("Vault2 taxBasisPoints: ", await vault2.taxBasisPoints());

  console.log("Vault1 stableTaxBasisPoints: ", await vault1.stableTaxBasisPoints());
  // console.log("Vault2 stableTaxBasisPoints: ", await vault2.stableTaxBasisPoints());

  console.log("Vault1 mintBurnFeeBasisPoints: ", await vault1.mintBurnFeeBasisPoints());
  // console.log("Vault2 mintBurnFeeBasisPoints: ", await vault2.mintBurnFeeBasisPoints());

  console.log("Vault1 swapFeeBasisPoints: ", await vault1.swapFeeBasisPoints());
  // console.log("Vault2 swapFeeBasisPoints: ", await vault2.swapFeeBasisPoints());

  console.log("Vault1 stableSwapFeeBasisPoints: ", await vault1.stableSwapFeeBasisPoints());
  // console.log("Vault2 stableSwapFeeBasisPoints: ", await vault2.stableSwapFeeBasisPoints());

  console.log("Vault1 marginFeeBasisPoints: ", await vault1.marginFeeBasisPoints());
  // console.log("Vault2 marginFeeBasisPoints: ", await vault2.marginFeeBasisPoints());

  console.log("Vault1 minProfitTime: ", await vault1.minProfitTime());
  // console.log("Vault2 minProfitTime: ", await vault2.minProfitTime());

  console.log("Vault1 hasDynamicFees: ", await vault1.hasDynamicFees());
  // console.log("Vault2 hasDynamicFees: ", await vault2.hasDynamicFees());

  console.log("Vault1 fundingInterval: ", await vault1.fundingInterval());
  // console.log("Vault2 fundingInterval: ", await vault2.fundingInterval());

  console.log("Vault1 fundingRateFactor: ", await vault1.fundingRateFactor());
  // console.log("Vault2 fundingRateFactor: ", await vault2.fundingRateFactor());

  console.log("Vault1 stableFundingRateFactor: ", await vault1.stableFundingRateFactor());
  // console.log("Vault2 stableFundingRateFactor: ", await vault2.stableFundingRateFactor());

  console.log("Vault1 totalTokenWeights: ", await vault1.totalTokenWeights());
  // console.log("Vault2 totalTokenWeights: ", await vault2.totalTokenWeights());

  console.log("Vault1 includeAmmPrice: ", await vault1.includeAmmPrice());
  // console.log("Vault2 includeAmmPrice: ", await vault2.includeAmmPrice());

  console.log("Vault1 useSwapPricing: ", await vault1.useSwapPricing());
  // console.log("Vault2 useSwapPricing: ", await vault2.useSwapPricing());

  console.log("Vault1 inManagerMode: ", await vault1.inManagerMode());
  // console.log("Vault2 inManagerMode: ", await vault2.inManagerMode());

  console.log("Vault1 inPrivateLiquidationMode: ", await vault1.inPrivateLiquidationMode());
  // console.log("Vault2 inPrivateLiquidationMode: ", await vault2.inPrivateLiquidationMode());

  console.log("Vault1 maxGasPrice: ", await vault1.maxGasPrice());
  // console.log("Vault2 maxGasPrice: ", await vault2.maxGasPrice());

  

  

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });