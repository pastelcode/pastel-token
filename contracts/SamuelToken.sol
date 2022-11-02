// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PastelToken is ERC20, Ownable {
  uint constant _initial_supply = 100*10**18;
  
  constructor() ERC20("Pastel", "PASTEL") {
    _mint(msg.sender, _initial_supply);
  }

  function issueToken(address to, uint256 amount) public onlyOwner {
    _mint(to, amount*10**18);
  }
}