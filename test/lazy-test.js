const { expect } = require("chai");
const hardhat = require("hardhat");
const { ethers } = hardhat;
const { Signature } = require("../app/src/Signature");

async function deploy() {
  const [minter, redeemer] = await ethers.getSigners();

  const factory = await ethers.getContractFactory("LazyFactory", minter);
  const contract = await factory.deploy("xyz", "my token", minter.address);

  // the redeemerContract is an instance of the contract that's wired up to the redeemer's signing key
  const redeemerFactory = factory.connect(redeemer);
  const redeemerContract = redeemerFactory.attach(contract.address);

  return {
    minter,
    redeemer,
    contract,
    redeemerContract,
  };
}

describe("LazyFactory", function () {
  it("Should deploy", async function () {
    const [minter] = await ethers.getSigners();
    const LazyFactory = await ethers.getContractFactory("LazyFactory");
    const contract = await LazyFactory.deploy(
      "xyz",
      "my token",
      minter.address
    );

    await contract.deployed();
  });

  it("Should redeem an NFT from a signed voucher", async function () {
    const { contract, redeemerContract, redeemer, minter } = await deploy();

    const theSignature = new Signature({ contract, signer: minter });
    const theSellingPrice = ethers.utils.parseUnits("0.000000008", "ether");

    console.log("theSellingPrice: " + theSellingPrice);
    console.log("minter: " + minter.address);
    console.log("redeemer: " + redeemer.address);

    const voucher = await theSignature.signTransaction(
      1,
      theSellingPrice,
      "www.tokenUri.com"
    );

    await expect(
      redeemerContract.redeem(redeemer.address, voucher, {
        value: voucher.sellingPrice,
      })
    )
      .to.emit(contract, "Transfer") // transfer from null address to minter
      .withArgs(
        "0x0000000000000000000000000000000000000000",
        minter.address,
        voucher.tokenId
      )
      .and.to.emit(contract, "Transfer") // transfer from minter to redeemer
      .withArgs(minter.address, redeemer.address, voucher.tokenId);
  });

  //   it("Should fail to redeem an NFT that's already been claimed", async function () {
  //     const { contract, redeemerContract, redeemer, minter } = await deploy();

  //     const lazyMinter = new Signature({ contract, signer: minter });
  //     const voucher = await lazyMinter.createVoucher(
  //       1,
  //       "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
  //     );

  //     await expect(redeemerContract.redeem(redeemer.address, voucher))
  //       .to.emit(contract, "Transfer") // transfer from null address to minter
  //       .withArgs(
  //         "0x0000000000000000000000000000000000000000",
  //         minter.address,
  //         voucher.tokenId
  //       )
  //       .and.to.emit(contract, "Transfer") // transfer from minter to redeemer
  //       .withArgs(minter.address, redeemer.address, voucher.tokenId);

  //     await expect(
  //       redeemerContract.redeem(redeemer.address, voucher)
  //     ).to.be.revertedWith("ERC721: token already minted");
  //   });
});
