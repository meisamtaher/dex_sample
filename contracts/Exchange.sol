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
    mapping(uint256 => bool) public cancelOrders;
    mapping(uint256 => bool) public fillOrders;

    event Deposit (address indexed _token,address indexed _user, uint256 _amount, uint256 _balance);
   
    event Withdraw (address indexed _token,address indexed _user, uint256 _amount, uint256 _balance);

    event Order (uint256 _id,address indexed _user, address indexed _tokenGet, uint256 _amountGet, address indexed _tokenGive, uint256 _amountGive, uint256 _timestamp);
    event CancelOrder (uint256 _id,address indexed _user, address indexed _tokenGet, uint256 _amountGet, address indexed _tokenGive, uint256 _amountGive, uint256 _timestamp);
    event FillOrder(uint256 _id, address indexed _user1, address indexed _user2, address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive, uint256 _timestamp);
    constructor (address _feeAccount, uint256 _feePercentage){
        feeAccount = _feeAccount;
        feePercentage = _feePercentage;
    }
    struct _Order{
        uint256 id;
        address user;
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

    function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive)public returns (bool success){
        require(balanceOf[msg.sender][_tokenGive]>= _amountGive,"don't have enough balance to make this order");
        balanceOf[msg.sender][_tokenGive] = balanceOf[msg.sender][_tokenGive] - _amountGive;
        orderCount = orderCount + 1;
        orders[orderCount] = _Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);
        emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);
        return true;
    }

    function cancelOrder(uint256 _id)public returns (bool success){
        _Order storage order = orders[_id];
        require(order.id == _id, "no order with this id");
        require(order.user == msg.sender, "only the owner can cancel the order");
        require(!fillOrders[_id], "can't cancel a filled order");
        require(!cancelOrders[_id], "this order is already canceled");
        cancelOrders[_id] = true;
        balanceOf[msg.sender][order.tokenGive] = balanceOf[msg.sender][order.tokenGive] + order.amountGive;
        emit CancelOrder(order.id, order.user, order.tokenGet, order.amountGet, order.tokenGive, order.amountGive, block.timestamp);
        return true;
    }
    function fillOrder(uint256 _id) public returns (bool success){
        _Order storage order = orders[_id];
        require(order.id == _id, "no order with this id");
        require(!cancelOrders[_id], "can't fill a canceled order");
        require(!fillOrders[_id], "can't fill an already filled order");
        uint256 feeAmount = (order.amountGet * feePercentage) / 100;
        require(balanceOf[msg.sender][order.tokenGet]>= (order.amountGet+feeAmount),"don't have enough balance to fill this order");
        
        fillOrders[_id] = true;
        balanceOf[msg.sender][order.tokenGet] = balanceOf[msg.sender][order.tokenGet] - (order.amountGet + feeAmount);
        balanceOf[order.user][order.tokenGet] = balanceOf[order.user][order.tokenGet] + order.amountGet;
        balanceOf[feeAccount][order.tokenGet] = balanceOf[feeAccount][order.tokenGet] + feeAmount;
        
        balanceOf[msg.sender][order.tokenGive] = balanceOf[msg.sender][order.tokenGive] + order.amountGive;

        emit FillOrder(_id, order.user, msg.sender, order.tokenGet, order.amountGet, order.tokenGive, order.amountGive , block.timestamp);
        return true;
    }
}