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

    // const chainId = await this.contract.getChainID();
    this.domainData = {
      name: "Awesome dApp",
      version: "1",
      chainId: "4",
      // the address of the contract that will verify the signature. The user-agent may do contract specific phishing prevention.
      verifyingContract: this.contract.address,
    };
    return this.domainData;
  }

  async signTransaction(amount, tokenId, tokenUri) {
    console.log(await this.signer.getAddress())
    const domain = await this.designDomain();
    // define your data types
    const types = {
      Voucher: [
        { name: "amount", type: "uint256" },
        { name: "account", type: "address" },
        { name: "tokenId", type: "uint256" },
        { name: "tokenUri", type: "string" },
        { name: "content", type: "string" },
      ],
    };
    // the data to sign / signature will be added to our solidity struct
    const voucher = {
      amount: amount,
      account: await this.signer.getAddress(),
      tokenId: tokenId,
      tokenUri: tokenUri,
      content: "Hello World!",
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
