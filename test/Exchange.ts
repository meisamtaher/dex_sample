import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
function tokens(n: number){
    return ethers.utils.parseUnits(n.toString(), 'ether')
}
describe("Exchange", ()=>{
    async function deployExchange() {
        const [owner, otherAccount, feeAccount] = (await ethers.getSigners());
        const feePercentage = 2;
        const Exchange = await ethers.getContractFactory("Exchange")
        const exchange = await Exchange.deploy(feeAccount.address, feePercentage);
        
        return {exchange, Exchange, owner, otherAccount, feeAccount, feePercentage}
    }
    
    describe("Deployment",()=>{

        it("has correct fee account ",async ()=>{
            const {exchange, feeAccount} = await loadFixture(deployExchange);  
            expect(await exchange.feeAccount()).to.equals(feeAccount.address);
        });    
        
        it("has correct fee percentage ",async ()=>{
            const {exchange, feePercentage} = await loadFixture(deployExchange);  
            expect(await exchange.feePercentage()).to.equals(feePercentage);
        });

    });


})