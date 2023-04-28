import { ethers } from "hardhat";
import configs from "../Configurations/configs.json";

async function main() {
    const Ding = await ethers.getContractFactory("Ding")
    const exchange_factory = await ethers.getContractFactory("Exchange");
    
    const ding1 = await Ding.deploy("mock DAI", "mDAI", "0.0.1", 1000000);
    const ding2 = await Ding.deploy("mock Etheruem", "mETH", "0.0.1", 1000000);
    const ding3 = await Ding.deploy("sam coin", "SC","0.0.1", 1000000);

    const exchange = await exchange_factory.deploy(configs.accounts.feeAccount, configs.configs.feePercent);

    await ding1.deployed();
    console.log("mDAI Token is deployed to: ", ding1.address)
    await ding2.deployed();
    console.log("mETH Token is deployed to: ", ding2.address)
    await ding3.deployed();
    console.log("SC Token is deployed to: ", ding3.address)

    await exchange.deployed();
    console.log("exchange contract is deployed to: ", exchange.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
