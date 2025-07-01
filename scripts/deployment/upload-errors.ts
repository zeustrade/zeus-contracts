// get vault stats

import { ethers } from "hardhat";
import { VaultErrorController } from "../../typechain-types/core/VaultErrorController";
import { Vault } from "../../typechain-types/core/Vault";
async function main() {

  const vaultErrorController = await ethers.getContractAt("VaultErrorController", "0xF239665704660b82bfD9ff667bCD8C68810D2e15") as unknown as VaultErrorController;
  const vault = await ethers.getContractAt("Vault", "0xAE296bAF15F1c9AC5478df837BEf00B130E8d11b") as unknown as Vault;

  const errors = [
    "Vault: zero error",
    "Vault: already initialized",
    "Vault: invalid _maxLeverage",
    "Vault: invalid _taxBasisPoints",
    "Vault: invalid _stableTaxBasisPoints",
    "Vault: invalid _mintBurnFeeBasisPoints",
    "Vault: invalid _swapFeeBasisPoints",
    "Vault: invalid _stableSwapFeeBasisPoints",
    "Vault: invalid _marginFeeBasisPoints",
    "Vault: invalid _liquidationFeeUsd",
    "Vault: invalid _fundingInterval",
    "Vault: invalid _fundingRateFactor",
    "Vault: invalid _stableFundingRateFactor",
    "Vault: token not whitelisted",
    "Vault: _token not whitelisted",
    "Vault: invalid tokenAmount",
    "Vault: _token not whitelisted",
    "Vault: invalid tokenAmount",
    "Vault: invalid usdgAmount",
    "Vault: _token not whitelisted",
    "Vault: invalid usdgAmount",
    "Vault: invalid redemptionAmount",
    "Vault: invalid amountOut",
    "Vault: swaps not enabled",
    "Vault: _tokenIn not whitelisted",
    "Vault: _tokenOut not whitelisted",
    "Vault: invalid tokens",
    "Vault: invalid amountIn",
    "Vault: leverage not enabled",
    "Vault: insufficient collateral for fees",
    "Vault: invalid position.size",
    "Vault: empty position",
    "Vault: position size exceeded",
    "Vault: position collateral exceeded",
    "Vault: invalid liquidator",
    "Vault: empty position",
    "Vault: position cannot be liquidated",
    "Vault: invalid position",
    "Vault: invalid _averagePrice",
    "Vault: collateral should be withdrawn",
    "Vault: _size must be more than _collateral",
    "Vault: invalid msg.sender",
    "Vault: mismatched tokens",
    "Vault: _collateralToken not whitelisted",
    "Vault: _collateralToken must not be a stableToken",
    "Vault: _collateralToken not whitelisted",
    "Vault: _collateralToken must be a stableToken",
    "Vault: _indexToken must not be a stableToken",
    "Vault: _indexToken not shortable",
    "Vault: invalid increase",
    "Vault: reserve exceeds pool",
    "Vault: max USDG exceeded",
    "Vault: reserve exceeds pool",
    "Vault: forbidden",
    "Vault: forbidden",
    "Vault: maxGasPrice exceeded"
]

// const tx = await vaultErrorController.setErrors("0xAE296bAF15F1c9AC5478df837BEf00B130E8d11b", errors);
// await tx.wait();
// console.log("Errors set, tx: ", tx.hash);

console.log("Vault error0: ", await vault.errors(0));
console.log("Vault error1: ", await vault.errors(1));
console.log("Vault error2: ", await vault.errors(2));
console.log("Vault error3: ", await vault.errors(3));
console.log("Vault error4: ", await vault.errors(4));
console.log("Vault error5: ", await vault.errors(5));
console.log("Vault error6: ", await vault.errors(6));
console.log("Vault error7: ", await vault.errors(7));
console.log("Vault error8: ", await vault.errors(8));
console.log("Vault error9: ", await vault.errors(9));
console.log("Vault error10: ", await vault.errors(10));
console.log("Vault error11: ", await vault.errors(11));
console.log("Vault error12: ", await vault.errors(12));
console.log("Vault error13: ", await vault.errors(13));
console.log("Vault error14: ", await vault.errors(14));
console.log("Vault error15: ", await vault.errors(15));
console.log("Vault error16: ", await vault.errors(16));
console.log("Vault error17: ", await vault.errors(17));
console.log("Vault error18: ", await vault.errors(18));
console.log("Vault error19: ", await vault.errors(19));
console.log("Vault error20: ", await vault.errors(20));
console.log("Vault error21: ", await vault.errors(21));
console.log("Vault error22: ", await vault.errors(22));
console.log("Vault error23: ", await vault.errors(23));
console.log("Vault error24: ", await vault.errors(24));
console.log("Vault error25: ", await vault.errors(25));
console.log("Vault error26: ", await vault.errors(26));
console.log("Vault error27: ", await vault.errors(27));
console.log("Vault error28: ", await vault.errors(28));
console.log("Vault error29: ", await vault.errors(29));
console.log("Vault error30: ", await vault.errors(30));
console.log("Vault error31: ", await vault.errors(31));
console.log("Vault error32: ", await vault.errors(32));
console.log("Vault error33: ", await vault.errors(33));
console.log("Vault error34: ", await vault.errors(34));
console.log("Vault error35: ", await vault.errors(35));
console.log("Vault error36: ", await vault.errors(36));
console.log("Vault error37: ", await vault.errors(37));
console.log("Vault error38: ", await vault.errors(38));
console.log("Vault error39: ", await vault.errors(39));
console.log("Vault error40: ", await vault.errors(40));
console.log("Vault error41: ", await vault.errors(41));
console.log("Vault error42: ", await vault.errors(42));
console.log("Vault error43: ", await vault.errors(43));
console.log("Vault error44: ", await vault.errors(44));
console.log("Vault error45: ", await vault.errors(45));
console.log("Vault error46: ", await vault.errors(46));
console.log("Vault error47: ", await vault.errors(47));
console.log("Vault error48: ", await vault.errors(48));
console.log("Vault error49: ", await vault.errors(49));
console.log("Vault error50: ", await vault.errors(50));
console.log("Vault error51: ", await vault.errors(51));
console.log("Vault error52: ", await vault.errors(52));
console.log("Vault error53: ", await vault.errors(53));
console.log("Vault error54: ", await vault.errors(54));
console.log("Vault error55: ", await vault.errors(55));

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });