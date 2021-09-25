/* eslint-disable no-undef */
import { ethers, Contract } from 'ethers';
import LazyFactory from './build/contracts/Factory.json';

require('dotenv').config();

export const fetchBlockchainByWallet = async () => {
  if (window.ethereum && Factory.address) {
    try {
      await window.ethereum.enable();
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();
      const marketPlace = new Contract(
        MarketPlace.address,
        MarketPlace.abi,
        signer
      );
      const factory = new Contract(Factory.address, Factory.abi, signer);
      const { chainId } = await provider.getNetwork();
      console.log(`chain Id: ${chainId}`);

      return { signerAddress, marketPlace, factory };
    } catch (e) {
      console.log(e);
    }
  }
};
