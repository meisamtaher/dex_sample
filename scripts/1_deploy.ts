import { ethers } from "hardhat";

async function main() {
    const Ding = await ethers.getContractFactory("Ding")
    const ding = await Ding.deploy()
    await ding.deployed()
    console.log("Ding Token is deployed to", ding.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
