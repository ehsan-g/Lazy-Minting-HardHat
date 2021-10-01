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
    console.log(chainId.toString())
    this.domainData = {
      name: "Awesome dApp",
      version: "1",
      chainId: chainId.toString() ,
      // the address of the contract that will verify the signature. The user-agent may do contract specific phishing prevention.
      verifyingContract: this.contract.address,
    };
    return this.domainData;
  }

  async signTransaction(sellingPrice, tokenId, tokenUri) {
    const domain = await this.designDomain();
    // define your data types
    const types = {
      Voucher: [
        // { name: "signerWallet", type: "address" },
        { name: "sellingPrice", type: "uint256" },
        { name: "tokenId", type: "uint256" },
        { name: "tokenUri", type: "string" },
        { name: "content", type: "string" },
      ],
    };

    // the data to sign / signature will be added to our solidity struct
    const voucher = {
      // signerWallet: await this.signer.getAddress(),
      sellingPrice: sellingPrice,
      tokenId: tokenId,
      tokenUri: tokenUri,
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
