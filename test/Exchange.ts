import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
function tokens(n: number){
    return ethers.utils.parseUnits(n.toString(), 'ether')
}
describe("Exchange", ()=>{
    async function deployExchange() {
        const [owner, user1, user2, feeAccount] = (await ethers.getSigners());
        const feePercentage = 2;
        const Exchange = await ethers.getContractFactory("Exchange");
        const exchange = await Exchange.deploy(feeAccount.address, feePercentage);
        const Ding = await ethers.getContractFactory("Ding");
        const ding = await Ding.deploy("Ding Token", "DNG", "0.1.0", 1000000)
        const transaction = await ding.connect(owner).transfer(user1.address,tokens(100))
        await transaction.wait();
        const transaction2 = await ding.connect(owner).transfer(user2.address,tokens(100))
        await transaction2.wait();
        return {exchange, Exchange, owner, user1, user2, feeAccount, feePercentage, Ding, ding}
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
    describe("Deposit token",()=>{
        describe("Happy scenario",()=>{
            it("deposit token successfully", async()=>{
                const{ding, exchange, user1} = await loadFixture(deployExchange);
                const transaction1 = await ding.connect(user1).approve(exchange.address, tokens(10));
                await transaction1.wait();
                const transaction2 = await exchange.connect(user1).depositToken(ding.address, tokens(10));
                await transaction2.wait();
                expect(await ding.balanceOf(exchange.address)).to.equals(tokens(10));
                expect(await exchange.balanceOf(user1.address,ding.address)).to.equals(tokens(10));
            })
        })
        describe("Sad scenario", ()=>{
            it("don't have allowance to deposit",async()=> {
                const{ding, exchange, user1} = await loadFixture(deployExchange);
                await expect(exchange.connect(user1).depositToken(ding.address, tokens(10))).to.be.reverted;
            })
        })
    })

})