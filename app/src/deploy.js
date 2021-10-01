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
      signerContract = await signerFactory.deploy('xyz', 'my token', await signer.getAddress());
    } catch (e) {
      console.log('problem deploying: ');
      console.log(e);
    }
  }

  return { signerContract, signerFactory }
}

export const createVoucher = async (signerContract, sellingPrice, tokenId, tokenUri) => {
  let voucher;
  if (window.ethereum) {
    try {
      await window.ethereum.enable();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const theSellingPrice = ethers.utils.parseUnits(sellingPrice.toString(), "ether")

      const theSignature = new Signature({ contract: signerContract, signer })

      voucher = await theSignature.signTransaction(theSellingPrice, tokenId, tokenUri)
      console.log(theSignature)
      console.log(voucher)
      

    } catch (e) {
      console.log('problem Signing: ');
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

      console.log(voucher)

      const mintedTokenId = await redeemerContract.redeem(redeemerAddress, voucher, {value: voucher.sellingPrice})


      return mintedTokenId

    } catch (e) {
      console.log('problem buying: ');
      console.log(e);
    }

  }
}