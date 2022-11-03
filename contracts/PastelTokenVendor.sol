// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./PastelToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Vendor is Ownable {
    constructor(address tokenAddress) {
        token = PastelToken(tokenAddress);
    }

    PastelToken token;
    uint256 public tokensPerEther = 100;
    event BuyTokens(
        address buyer,
        uint256 amountOfEthers,
        uint256 amountOfTokens
    );

    function buyTokens() public payable returns (uint256 tokenAmount) {
        require(msg.value > 0, "You need to send some ETHER to proceed");
        uint256 amountToBuy = msg.value * tokensPerEther;

        uint256 vendorBalance = token.balanceOf(address(this));
        require(vendorBalance >= amountToBuy, "Vendor has insufficient tokens");

        bool sent = token.transfer(msg.sender, amountToBuy);
        require(sent, "Failed to transfer tokens to user");

        emit BuyTokens(msg.sender, msg.value, amountToBuy);
        return amountToBuy;
    }

    function sellTokens(uint256 tokenAmountToSell) public {
        require(
            tokenAmountToSell > 0,
            "Specify an amount of tokens greater than zero"
        );

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
    }

    function withdraw() public onlyOwner {
        uint256 ownerBalance = address(this).balance;
        require(ownerBalance > 0, "No ETHER present in vendor");
        (bool sent, ) = msg.sender.call{value: address(this).balance}("");
        require(sent, "Failed to withdraw");
    }
}
