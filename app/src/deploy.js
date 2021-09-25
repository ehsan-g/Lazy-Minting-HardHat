import { Signature } from '../src/Signature'
import LazyFactory from '../src/build/contracts/LazyFactory.sol/artifacts/contracts/LazyFactory.sol/LazyFactory.json';
import { ethers } from 'ethers';

export const deployMyFactory = async () => {
  let signerContract;
  let signerFactory;
  if (window.ethereum) {
    try {

      await window.ethereum.enable();
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const signer = provider.getSigner();

      const { chainId } = await provider.getNetwork();
      console.log(`chain Id: ${chainId}`);

      signerFactory = new ethers.ContractFactory(LazyFactory.abi, LazyFactory.bytecode, signer)
      signerContract = await signerFactory.deploy('xyz', 'my token');
    } catch (e) {
      console.log(e);
    }
  }

  return { signerContract, signerFactory }
}

export const makeVoucher = async (signerContract, amount, tokenId, tokenUri) => {
  let voucher;
  if (window.ethereum) {
    try {
      await window.ethereum.enable();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const theSignature = new Signature({ contract: signerContract, signer })
      console.log(theSignature)

      voucher = await theSignature.signTransaction(amount, tokenId, tokenUri)
    } catch (e) {
      console.log(e);
    }
  }
  return voucher
}

export const purchase = async (signerFactory, signerContract, voucher) => {
  if (window.ethereum) {
    try {
      await window.ethereum.enable();
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const redeemer = provider.getSigner();
      const redeemerFactory = signerFactory.connect(redeemer)

      const redeemerContract = redeemerFactory.attach(signerContract.address)

      const redeemerAddress = await redeemer.getAddress();


      const mintedTokenId = await redeemerContract.redeem(redeemerAddress, voucher)
      // const mintedTokenId = await redeemerContract.redeem(redeemerAddress, voucher)

      return mintedTokenId

    } catch (e) {
      console.log(e);
    }

  }
}