import { ethers } from "hardhat";
import configs from "../Configurations/configs.json";
function tokens(n: number){
  return ethers.utils.parseUnits(n.toString(), 'ether')
}
async function main() {

  // get contracts 
  const mDAI = await ethers.getContractAt("Ding", configs.contracts[31337].mDAI.address);
  console.log("mDAI token fetched at address:", mDAI.address);
  const mETH = await ethers.getContractAt("Ding", configs.contracts[31337].mETH.address);
  console.log("mETH token fetched at address:", mETH.address);
  const SC = await ethers.getContractAt("Ding", configs.contracts[31337].SC.address);
  console.log("SC token fetched at address:", SC.address);
  const exchange = await ethers.getContractAt("Exchange", configs.contracts[31337].exchange.address);
  console.log("exchange token fetched at address:", exchange.address);
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  
  // distribute tokens
  const feedAmount = 10000; 
  let transaction = await mDAI.connect(deployer).transfer(user1.address, tokens(feedAmount));
  await transaction.wait();
  console.log('transferred ', feedAmount, ' mDAI tokens from', deployer.address, ' to ', user1.address);  
  transaction = await mETH.connect(deployer).transfer(user1.address, tokens(feedAmount));
  await transaction.wait();
  console.log('transferred ', feedAmount, ' mETH tokens from', deployer.address, ' to ', user1.address);
  transaction = await SC.connect(deployer).transfer(user2.address, tokens(feedAmount));
  await transaction.wait();
  console.log('transferred ', feedAmount, ' SC tokens from', deployer.address, ' to ', user2.address);

  // deposit tokens to exchanges 
  const depositAmount = 5000;
  transaction = await mDAI.connect(user1).approve(exchange.address, tokens(depositAmount));
  await transaction.wait();
  transaction = await exchange.connect(user1).depositToken(mDAI.address, tokens(depositAmount));
  await transaction.wait();
  console.log('deposited ', depositAmount, ' mDAI tokens from address ', user1.address); 

  transaction = await SC.connect(user2).approve(exchange.address, tokens(depositAmount));
  await transaction.wait();
  transaction = await exchange.connect(user2).depositToken(SC.address, tokens(depositAmount));
  await transaction.wait();
  console.log('deposited ', depositAmount, ' SC tokens from address ', user2.address); 
  // make order 
  let amountGet, amountGive;
  let orderId, result;
  for (let index = 0; index < 10; index++) {
    amountGet = (index + 1)/ 10;
    amountGive = 10 * index + 5;
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(amountGet), mDAI.address, tokens(amountGive));
    result = await transaction.wait();
    console.log('order made token get: mETH, amountget: ', amountGet,' tokenGive: mDAI, amount give: ', amountGive); 
  }
  for (let index = 0; index < 10; index++) {
    amountGet = (index + 1)/ 10;
    amountGive = 20*index + 10;
    transaction = await exchange.connect(user2).makeOrder(mETH.address, tokens(amountGet), SC.address, tokens(amountGive));
    result = await transaction.wait();
    console.log('order made token get: mETH, amountget: ', amountGet,' tokenGive: mDAI, amount give: ', amountGive); 
  }
  // cancel order 
  amountGet = 0.11;
  amountGive = 200;
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(amountGet), mDAI.address, tokens(amountGive));
  result = await transaction.wait();
  orderId = result.events![0].args!._id;
  console.log('order made with id ', orderId, ' token get: mETH, amountget: ', amountGet,' tokenGive: mDAI, amount give: ', amountGive); 
  transaction = await exchange.connect(user1).cancelOrder(orderId);
  result = await transaction.wait();
  console.log('order canceled with id ', orderId);

  // fill order
  amountGet = 10, amountGive = 200;
  transaction = await exchange.connect(user1).makeOrder(SC.address, tokens(amountGet), mDAI.address, tokens(amountGive));
  result = await transaction.wait();
  orderId = result.events![0].args!._id;
  console.log('order made with id ', orderId, ' token get: SC amountget: ', amountGet,' tokenGive: mDAI, amount give: ', amountGive); 
  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait();
  console.log('order filled with id ', orderId);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
