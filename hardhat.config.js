require("dotenv").config();

require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  solidity: "0.8.4",
  defaultNetwork: "hardhat",
  networks: {
    rinkeby: {
      url: process.env.ALCHEMY_RINKEBY_URL,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
    hardhat: {
      forking: {
        url: process.env.ALCHEMY_MAINNET_URL,
      },
    },
  },
};
