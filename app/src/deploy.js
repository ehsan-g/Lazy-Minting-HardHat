import {Signature} from '../src/Signature'
import LazyFactory from './build/artifacts/contracts/LazyFactory.sol/LazyFactory.json';
import { ethers, Contract } from 'ethers';
import { id } from '@ethersproject/hash';

export const deployMyFactory = async () => {
  let signerContract;
  if (window.ethereum) {
    try {

      await window.ethereum.enable();
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();

      const { chainId } = await provider.getNetwork();
      console.log(`chain Id: ${chainId}`);

      const signerFactory = new ethers.ContractFactory(LazyFactory.abi, LazyFactory.bytecode, signer)
      signerContract = await signerFactory.deploy(signerAddress);
      if (signerContract) {
        
        makeVoucher(signerContract)
      }
    } catch (e) {
      console.log(e);
    }
  }

  return signerContract
}

export const makeVoucher = async (signerContract) => {
  let voucher;
  if (window.ethereum) {
    try {
      await window.ethereum.enable();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const theSignature = new Signature({ contract: signerContract, signer })
      console.log(theSignature)
      console.log('here')

      voucher = await theSignature.signTransaction(200,1, "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi")
    } catch (e) {
      console.log(e);
    }
  }

  return { voucher }
}

// export async function signToken(signer, redeemer, price, tokenId, tokenUri) {

//   // the redeemerContract is an instance of the signerContract that's wired up to the redeemer's signing key
//   const redeemerFactory = signerFactory.connect(redeemer);
//   const redeemerContract = redeemerFactory.attach(signerContract.address);


//   const signature = new Signature({ signerFactory, signer })
//   const voucher = await signature.signTransaction(price, tokenId, tokenUri)

// }