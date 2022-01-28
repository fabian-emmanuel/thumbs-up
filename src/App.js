import React, {useEffect, useState} from "react";
import {ethers} from "ethers";
import './App.css';
import abi from "./utils/ThumbsUpPortal.json";
import Loader from "./components/Loader.jsx";

const App = () => {

  /*
  * Just a state variable we use to store our user's public wallet.
  */
  const [currentAccount, setCurrentAccount] = useState("");
  const contractAddress = "0x4Adb7eA26e1284c623d15A9dae25ae1A3d62f19e";
  const contractABI = abi.abi;
  const [isLoading, setIsLoading] = useState(false);
  const [allThumbsUps, setAllThumbsUps] = useState([]);
  const [message, setMessage] = useState("");

  const handleInput = event => {
    setMessage(event.target.value)
  };


  const getAllThumbsUps = async () => {
    try {
      const {ethereum} = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const thumbsUpPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const thumbsUps = await thumbsUpPortalContract.getAllThumbsUps();

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let thumbsUpCleaned = [];
        thumbsUps.forEach(thumbsUp => {
          thumbsUpCleaned.push({
            address: thumbsUp.thumbsUper,
            timestamp: new Date(thumbsUp.timestamp * 1000),
            message: thumbsUp.message
          });
        });
        /*
         * Store our data in React State
         */
        setAllThumbsUps(thumbsUpCleaned);
      } else {
        console.log()
      }

    } catch (error) {
      console.log(error)
    }
  }

  const checkIfWalletIsConnected = async () => {
    /*
    * First make sure we have access to window.ethereum
    */
    try {
      const {ethereum} = window;
      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        await getAllThumbsUps();
        console.log(allThumbsUps);
        console.log("We have the ethereum object", ethereum);
      }

      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({method: "eth_accounts"});

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
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
      const {ethereum} = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({method: "eth_requestAccounts"});

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const thumbsUp = async () => {
    try {
      const {ethereum} = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const thumbsUpPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await thumbsUpPortalContract.getTotalThumbsUps();
        console.log("Retrieved total thumbsUp count...", count.toNumber());

        /*
        * Execute the actual thumbsUp from your smart contract
        */
        const thumbsUpTxn = await thumbsUpPortalContract.thumbsUp(message);
        setIsLoading(true);
        console.log("Mining...", thumbsUpTxn.hash);

        await thumbsUpTxn.wait();
        console.log("Mined -- ", thumbsUpTxn.hash);
        setIsLoading(false);

        count = await thumbsUpPortalContract.getTotalThumbsUps();
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
           I am Fabian Nice to meet you!!!
           Please Connect your Ethereum wallet,
           Leave a message below
           And give me a thumbs up!
         </div>

         {
           isLoading
              ? (<Loader/>)
              :(
                 <>
                   <input className="field" onChange={handleInput} placeholder="Enter Message..."/>
           <button
           className="thumbsUpButton"
           onClick={thumbsUp}>
           Give me a ThumbsUp 👍
           </button>
                 </>
              )}

         {/*
        * If there is no currentAccount render this button
        */}
         {!currentAccount && (
            <button className="thumbsUpButton" onClick={connectWallet}>
              Connect Wallet
            </button>
         )}

         {allThumbsUps.map((thumbsUp, index) => {
           return (
              <div className="thumbsUpCount" key={index}>
                <div>Address: {thumbsUp.address}</div>
                <div>Time: {thumbsUp.timestamp.toString()}</div>
                <div>Message: {thumbsUp.message}</div>
              </div>)
         })}
       </div>
     </div>
  );
}

export default App
