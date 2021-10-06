import { Signature } from '../src/Signature'
import LazyFactory from '../src/build/contracts/LazyFactory.sol/artifacts/contracts/LazyFactory.sol/LazyFactory.json';
import { ethers } from 'ethers';


export const createVoucher = async (signerContract, tokenId, sellingPrice, tokenUri) => {
  let voucher;
  if (window.ethereum) {
    try {
      await window.ethereum.enable();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const theSellingPrice = ethers.utils.parseUnits(sellingPrice.toString(), "ether")

      const theSignature = new Signature({ contract: signerContract, signer })

      voucher = await theSignature.signTransaction( tokenId,theSellingPrice, tokenUri)
      console.log(theSignature)
      console.log(voucher)
      
    } catch (e) {
      console.log('problem Signing: ');
      console.log(e.error);
    }
  }
  return voucher
}


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
      signerContract = await signerFactory.deploy('xyz', 'my token', signer.getAddress());
    
      
    } catch (e) {
      console.log('problem deploying: ');
      console.log(e.error);
    }
  }

  return { signerContract, signerFactory }
}

export const purchase = async (signerFactory, signerContract, voucher) => {
  if (window.ethereum) {
    try {
      await window.ethereum.enable();
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const redeemer = provider.getSigner();
      
      // Returns a new instance of the ContractFactory with the same interface and bytecode, but with a different signer.
      const redeemerFactory = signerFactory.connect(redeemer)

      // Return an instance of a Contract attached to address. This is the same as using the Contract constructor 
      // with address and this the interface and signerOrProvider passed in when creating the ContractFactory.
      const redeemerContract = redeemerFactory.attach(signerContract.address)

      const redeemerAddress = await redeemer.getAddress();

      const mintedTokenId = await redeemerContract.redeem(redeemerAddress, voucher, { value: voucher.sellingPrice })

      return mintedTokenId


    } catch (e) {
      console.log('problem buying: ');
      console.log(e.error);
    }

  }
}

export const balance = async (contractAddress) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const balance = await provider.getBalance("address")
    const balance =  await provider.getBalance(contractAddress)
    const balanceInEth = ethers.utils.formatEther(balance)
    return balanceInEth
    } catch (e) {
      console.log('problem balance: ');
      console.log(e.error);
    }
}

export const withdraw = async (signerContract) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const withraw = await signerContract.withdraw()
  } catch (e) {
    console.log('problem withdraw: ');
    console.log(e.error);
  }
}