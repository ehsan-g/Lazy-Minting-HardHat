import React, { useState, useEffect } from 'react';
// import { ethers, Contract } from 'ethers';
import { deployMyFactory, createVoucher, purchase, balance } from '../src/deploy'

const App = () => {


  const [contractAddress, setContractAddress] = useState('')
  const [deployedContract, setDeployedContract] = useState()
  const [factory, setFactory] = useState()
  const [myBalance, setMyBalance] = useState(null)

  const [voucher1, setVoucher1] = useState()
  const [voucher2, setVoucher2] = useState()
  const [disable, setDisable] = useState(false)

  useEffect(() => {
    if (contractAddress) {
      setDisable(true)
    }
  }, [contractAddress])

  const handleDeploy = async () => {
    const { signerContract, signerFactory } = await deployMyFactory()
    setDeployedContract(signerContract)
    setContractAddress(signerContract.address)

    setFactory(signerFactory)
  }

  const handleSignature1 = async () => {
    const theVoucher = await createVoucher(deployedContract, 0.00015, 1, 'https//tokenUri.com1')
    setVoucher1(theVoucher)
  }

  const handleSignature2 = async () => {
    const theVoucher = await createVoucher(deployedContract, 0.000004, 2, 'https//tokenUri.com2')
    setVoucher2(theVoucher)
  }

  const handlePurchase = async (theVoucher) => {
    const purchasedToken = await purchase(factory, deployedContract, theVoucher)
    console.log(purchasedToken)
  }

  const handleBalance = async () => {
   const balanceInEth = await balance(contractAddress)
    console.log(balanceInEth)
    setMyBalance(balanceInEth)
    
    
  }
  return (
    <div>
      <button disabled={disable} onClick={() => handleDeploy()}>
        Deploy My store Once
      </button>
      <br />
      <br />
      <span>Store Contract Address: <a target="_blank" href={`https://rinkeby.etherscan.io/address/${contractAddress}`} rel="noreferrer">{contractAddress}</a></span>



      {contractAddress && (

        <div>
      <div> ---------------------------------------- </div>

              <button disabled={voucher1} onClick={() => handleSignature1()}>
              Sign My First Item
            </button>
            <br />
            <button disabled={voucher2} onClick={() => handleSignature2()}>
              Sign My Second Item
            </button>
          <br />
      <div> ---------------------------------------- </div>

          </div>
         )}
      {
        voucher1 && (
          <div>
            <pre>{JSON.stringify(voucher1, null, 2)}</pre>
            <button onClick={() => handlePurchase(voucher1)}>
              Buy token 1
            </button>
          </div>
        )
      }
      <br />
      {
        voucher2 && (
          <div>
            <pre>{JSON.stringify(voucher2, null, 2)}</pre>
            <button onClick={() => handlePurchase(voucher2)}>
              Buy token 2
            </button>
          </div>
        )
      }
      <div> ---------------------------------------- </div>
      <div>
            <button onClick={() => handleBalance()}>
             Store Balance
        </button><br />
        <div>{`balance: ${myBalance} ETH`}</div>
          </div>
    </div>

  )
}

export default App;