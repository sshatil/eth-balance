import React, { useEffect, useState } from "react";
import { Button, TextField, Typography } from "@mui/material";
import Web3 from "web3";
import { erc20ABI } from "../utils/erc20ABI";
import "../styles/balance.css";
import Loading from "../utils/Loading";

const Balance = () => {
  const [ethBalance, setEthBalance] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [erc20Balance, setERC20Balance] = useState("");
  const [loading, setLoading] = useState(true);

  // const web3 = new Web3(window.ethereum);
  // link to Sepolia
  const sepoliaRPCURL = "https://ethereum-sepolia.publicnode.com";

  const web3 = new Web3(new Web3.providers.HttpProvider(sepoliaRPCURL));

  // connect to MetaMask
  const connectToMetaMask = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        console.log("MetaMask connected successfully");
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("MetaMask not found");
    }
  };

  const handleETHBalanceQuery = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const ethBalance = await web3.eth.getBalance(accounts[0]);
      const ethBalanceInEther = web3.utils.fromWei(ethBalance, "ether");
      const formattedEthBalance = Number(ethBalanceInEther).toFixed(2);
      setEthBalance(formattedEthBalance);
    } catch (error) {
      console.error("Error querying ETH balance:", error);
    }
  };

  const handleERC20BalanceQuery = async (e) => {
    e.preventDefault();
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const erc20TokenABI = erc20ABI;
      const erc20TokenAddress = contractAddress;

      const erc20Contract = new web3.eth.Contract(
        erc20TokenABI,
        erc20TokenAddress
      );
      const erc20Balance = await erc20Contract.methods
        .balanceOf(accounts[0])
        .call();
      setERC20Balance(Number(erc20Balance.toString()).toFixed(2) + " ERC20");
      setContractAddress("");
    } catch (error) {
      console.log(error);
    }
  };

  const fetchData = async () => {
    await connectToMetaMask();
    await handleETHBalanceQuery();
  };
  useEffect(() => {
    fetchData();
  }, []);

  if (loading)
    return (
      <div>
        <Loading />
      </div>
    );

  return (
    <div className="container">
      <Typography variant="h4">Your Total Balance</Typography>
      <div className="container__balance">
        <Typography variant="h6">ETH Balance: {ethBalance} ETH</Typography>
        <Typography variant="h6">ERC20 Balance: {erc20Balance}</Typography>
      </div>
      <form className="erc__input" onSubmit={handleERC20BalanceQuery}>
        <TextField
          label="ERC20 contract address"
          variant="outlined"
          value={contractAddress}
          size="small"
          onChange={(e) => setContractAddress(e.target.value)}
        />
        <Button variant="contained" type="submit">
          Get ERC20
        </Button>
      </form>
    </div>
  );
};

export default Balance;
