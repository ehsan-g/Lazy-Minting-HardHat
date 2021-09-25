
import React from 'react';
// import { ethers, Contract } from 'ethers';
import { deployMyFactory  } from '../src/deploy'

const App = () => {


  
  const handleDeploy = async () => {
    console.log('hi')
    await deployMyFactory()
    // const signature = new Signature({  contract, signer: minter })
    // Signature.signTransaction(price, tokenId, tokenUri) 
  }
  return (
    <div>
      <button onClick={() => handleDeploy()}>
        Deploy My store
      </button>
      <button>
        Sign my token
      </button>
    </div>
)
}

export default App;