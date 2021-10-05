
// These constants must match the ones used in the smart contract.
const SIGNING_DOMAIN_NAME = "LazyNFT"
const SIGNING_DOMAIN_VERSION = "1"

class Signature {
  constructor({ contract, signer }) {
    this.contract = contract;
    this.signer = signer;
  }

  // design your domain separator
  async designDomain() {
    if (this.domainData != null) {
      return this.domainData;
    }

    let chainId = await this.contract.getChainID();
    console.log('chainId: ' + chainId.toString())
    
    this.domainData = {
      name: SIGNING_DOMAIN_NAME,
      version: SIGNING_DOMAIN_VERSION,
      verifyingContract: this.contract.address,
      chainId,
      // the address of the contract that will verify the signature. The user-agent may do contract specific phishing prevention.
    };
    return this.domainData;
  }

  async signTransaction(tokenId, sellingPrice ,tokenUri) {
    const domain = await this.designDomain();
    // define your data types
    const types = {
      NFTVoucher: [
        { name: "tokenId", type: "uint256" },
        { name: "sellingPrice", type: "uint256" },
        { name: "tokenUri", type: "string" },
        { name: "content", type: "string" },
      ],
    };

    // the data to sign / signature will be added to our solidity struct
    const voucher = {
      tokenId,
      tokenUri,
      sellingPrice,
      content: "You are signing this item to be available on market!",
    };

    // signer._signTypedData(domain, types, value) =>  returns a raw signature
    const signature = await this.signer._signTypedData(domain, types, voucher);
    return {
      ...voucher,
      signature,
    };
  }
}


module.exports = {
  Signature,
};
