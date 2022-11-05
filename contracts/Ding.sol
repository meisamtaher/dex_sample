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
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    constructor(string memory _name, string memory _symbol, string memory _version, uint256 _totalSupply){
        name = _name;
        symbol = _symbol;
        version = _version;
        totalSupply = _totalSupply * (10 ** decimals);
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) public payable returns(bool success){
        require(balanceOf[msg.sender]>_value,"ERR12");
        require(_to != address(0));
        balanceOf[msg.sender] = balanceOf[msg.sender] - _value;
        balanceOf[_to] = balanceOf[_to] + _value;
        emit Transfer(msg.sender,_to,_value);
        return true;
    }
    
    function approve(address _spender, uint256 _value) public returns (bool success){
        require(_spender != address(0));
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

}
