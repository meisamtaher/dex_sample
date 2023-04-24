// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "./Ding.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feePercentage;
    uint256 public orderCount;
    mapping(address => mapping(address => uint256)) public balanceOf;
    mapping(uint256 => _Order) public orders;

    event Deposit (address indexed _token,address indexed _user, uint256 _amount, uint256 _balance);
   
    event Withdraw (address indexed _token,address indexed _user, uint256 _amount, uint256 _balance);

    event Order (uint256 indexed id, address indexed tokenGet, uint256 getAmount, address indexed tokenGive, uint256 giveAmount, uint256 timestamp);

    constructor (address _feeAccount, uint256 _feePercentage){
        feeAccount = _feeAccount;
        feePercentage = _feePercentage;
    }
    struct _Order{
        uint256 id;
        address tokenGet;
        uint256 amountGet;
        address tokenGive;
        uint256 amountGive;
        uint256 timestamp;
    }

    function depositToken(address _token, uint256 _value) public  returns (bool success){
        require(Ding(_token).transferFrom(msg.sender,address(this), _value));
        balanceOf[msg.sender][_token] = balanceOf[msg.sender][_token] + _value;
        emit Deposit(_token, msg.sender, _value, balanceOf[msg.sender][_token]);
        return true;
    }

    function withdrawToken(address _token, uint256 _value) public returns (bool success){
        require(balanceOf[msg.sender][_token] >= _value, "don't have enough balance to whithdraw");
        Ding(_token).transfer(msg.sender, _value); 
        balanceOf[msg.sender][_token] = balanceOf[msg.sender][_token] - _value; 
        emit Withdraw(_token, msg.sender, _value, balanceOf[msg.sender][_token]);
        return true; 
    }

    function makeOrder(address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive)public returns (bool success){
        require(balanceOf[msg.sender][tokenGive]>= amountGive,"don't have enough balance to make this order");
        balanceOf[msg.sender][tokenGive] = balanceOf[msg.sender][tokenGive] - amountGive;
        orderCount = orderCount + 1;
        orders[orderCount] = _Order(orderCount, tokenGet, amountGet, tokenGive, amountGive, block.timestamp);
        emit Order(orderCount, tokenGet, amountGet, tokenGive, amountGive, block.timestamp);
        return true;
    }
}