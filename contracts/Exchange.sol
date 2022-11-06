// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "./Ding.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feePercentage;

    mapping(address => mapping(address => uint256)) public balanceOf;

    constructor (address _feeAccount, uint256 _feePercentage){
        feeAccount = _feeAccount;
        feePercentage = _feePercentage;
    }

    function depositToken(address _token, uint256 _value) public  returns (bool success){
        require(Ding(_token).transferFrom(msg.sender,address(this), _value));
        balanceOf[msg.sender][_token] = balanceOf[msg.sender][_token] + _value;
        return true;
    }
}