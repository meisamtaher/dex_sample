// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";

contract Ding {
    string public name;
    string public symbol;
    string public version;
    uint256 public constant decimals = 18;
    uint256 public totalSupply;
    constructor(string memory _name, string memory _symbol, string memory _version, uint256 _totalSupply){
        name = _name;
        symbol = _symbol;
        version = _version;
        totalSupply = _totalSupply * (10 ** decimals);
    }
}
