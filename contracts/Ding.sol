// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";

contract Ding {
    string public name;
    string public symbol;
    string public version;
    uint256 public constant decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    constructor(string memory _name, string memory _symbol, string memory _version, uint256 _totalSupply){
        name = _name;
        symbol = _symbol;
        version = _version;
        totalSupply = _totalSupply * (10 ** decimals);
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) public payable returns(bool success){
        require(balanceOf[msg.sender]>_value,"ERR12");
        balanceOf[msg.sender] = balanceOf[msg.sender] - _value;
        balanceOf[_to] = balanceOf[_to] + _value;
        emit Transfer(msg.sender,_to,_value);
        return true;
    }
}
