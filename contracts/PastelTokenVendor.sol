// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./PastelToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/escrow/Escrow.sol";
import "hardhat/console.sol";

contract Vendor is Ownable {
    constructor() {
        token = new PastelToken(1000);
        escrow = new Escrow();
    }

    Escrow escrow;
    PastelToken public token;
    uint256 public tokensPerEther = 100;
    event Bought(address buyer, uint256 amountOfEthers, uint256 amountOfTokens);
    event Sold(address seller, uint256 amountOfEthers, uint256 amountOfTokens);

    function buyTokens() public payable {
        require(msg.value > 0, "You need to send some ETHER to proceed");
        uint256 amountToBuy = msg.value * tokensPerEther;

        uint256 pastelBalance = token.balanceOf(address(this));
        require(pastelBalance >= amountToBuy, "Vendor has insufficient tokens");

        bool sent = token.transfer(msg.sender, amountToBuy);
        require(sent, "Failed to transfer tokens to user");

        emit Bought(msg.sender, msg.value, amountToBuy);

        console.log("Vendor ETHER ->", address(this).balance);
        console.log("User ETHER ->", msg.sender.balance);
        console.log("User PASTEL ->", token.balanceOf(msg.sender));
        console.log("Vendor PASTEL ->", token.balanceOf(address(this)));
    }

    function sellTokens(uint256 tokenAmountToSell) public {
        require(
            tokenAmountToSell > 0,
            "Specify an amount of tokens greater than zero"
        );

        uint256 allowance = token.allowance(msg.sender, address(this));
        require(allowance >= tokenAmountToSell, "Check the token allowance");

        uint256 userBalance = token.balanceOf(msg.sender);
        require(
            userBalance >= tokenAmountToSell,
            "You have insufficient tokens"
        );

        uint256 amountOfEtherToTransfer = tokenAmountToSell / tokensPerEther;

        uint256 ownerEtherBalance = address(this).balance;
        require(
            ownerEtherBalance >= amountOfEtherToTransfer,
            "Vendor has insufficient funds"
        );

        bool sent = token.transferFrom(
            msg.sender,
            address(this),
            tokenAmountToSell
        );
        require(sent, "Failed to transfer tokens from user to vendor");
        payable(msg.sender).transfer(amountOfEtherToTransfer);
        emit Sold(msg.sender, amountOfEtherToTransfer, tokenAmountToSell);

        console.log("Vendor ETHER ->", address(this).balance);
        console.log("User ETHER ->", msg.sender.balance);
        console.log("User PASTEL ->", token.balanceOf(msg.sender));
        console.log("Vendor PASTEL ->", token.balanceOf(address(this)));
    }

    function withdraw() public onlyOwner {
        uint256 ownerBalance = address(this).balance;
        require(ownerBalance > 0, "No ETHER present in vendor");
        (bool sent, ) = msg.sender.call{value: address(this).balance}("");
        require(sent, "Failed to withdraw");
    }
}
