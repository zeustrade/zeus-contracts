import { ethers } from "hardhat";
import { expect } from "chai";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ZUS } from "../typechain-types/contracts/ZUS";

describe("ZUS Token Contract", async () => {
  let signers: SignerWithAddress[];
  let ZUS: ZUS;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;

  beforeEach(async () => {
    // get owner as signer, account as customer
    signers = await ethers.getSigners();
    owner = signers[0];
    user = signers[1];

    // deploy smart contract
    const ZUSFactory = await ethers.getContractFactory("ZUS");
    ZUS = (await ZUSFactory.deploy(owner.address)) as ZUS;
    await ZUS.deployed();
  });

  it('Started total supply MUST BE equal to "100_000_000"', async () => {
    expect(await ZUS.totalSupply()).equal("100000000000000000000000000");
  });

  it("Started owner MUST BE equal to deployer", async () => {
    expect(await ZUS.owner()).equal(owner.address);
  });

  it('Name MUST BE equal to "ZEUS Exchange Token"', async () => {
    expect(await ZUS.name()).equal("ZEUS Exchange Token");
  });

  it('Symbol MUST BE equal to "ZUS"', async () => {
    expect(await ZUS.symbol()).equal("ZUS");
  });

  it('Decimals MUST BE equal to "18"', async () => {
    expect(await ZUS.decimals()).equal(18);
  });

});
