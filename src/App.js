import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/ThumbsUpPortal.json";
import Loader from "./components/Loader.jsx";

const App = () => {

  /*
  * Just a state variable we use to store our user's public wallet.
  */
  const [currentAccount, setCurrentAccount] = useState("");
  const contractAddress = "0x3858B158DDbD5f00dd075Dd140141C95F160c570";
  const contractABI = abi.abi;
  const [isLoading, setIsLoading] = useState(false);



  const checkIfWalletIsConnected = async () => {
    /*
    * First make sure we have access to window.ethereum
    */
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }
      
      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
      
  }

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const thumbsUp = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const thumbsUpPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await thumbsUpPortalContract.getTotalThumbsUp();
        console.log("Retrieved total thumbsUp count...", count.toNumber());

        /*
        * Execute the actual thumbsUp from your smart contract
        */
        const thumbsUpTxn = await thumbsUpPortalContract.thumbsUp();
        setIsLoading(true);
        console.log("Mining...", thumbsUpTxn.hash);

        await thumbsUpTxn.wait();
        console.log("Mined -- ", thumbsUpTxn.hash);
        setIsLoading(false);

        count = await thumbsUpPortalContract.getTotalThumbsUp();
        console.log("Retrieved total thumbsUp count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
}

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👍 Hey there!
        </div>

        <div className="bio">
        I am Fabian Nice to meet you!!! Connect your Ethereum wallet and give me a thumbs up below!
        </div>

        {
          isLoading 
            ? (<Loader />)
            :(<button 
          className="thumbsUpButton" 
          onClick={thumbsUp}>
          Give me a ThumbsUp 👍
        </button>)
        }
          
      
        
        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="thumbsUpButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}

export default App