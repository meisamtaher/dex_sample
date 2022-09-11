import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
function tokens(n: number){
    return ethers.utils.parseUnits(n.toString(), 'ether')
}
describe("Ding Token", ()=>{
    async function deployDing() {

        const name = "Ding coin";
        const symbol = "DNG";
        const totalSupply = 100000;
        const version = "0.1.0";

        const Ding = await ethers.getContractFactory("Ding")
        const ding = await Ding.deploy(name,symbol,version, totalSupply);
        const [owner, otherAccount] = (await ethers.getSigners());

        return {ding, Ding, name, symbol, totalSupply, version, owner, otherAccount}
    }
    
    describe("Deployment",()=>{

        it("has correct name ",async ()=>{
            const {ding, name} = await loadFixture(deployDing);  
            expect(await ding.name()).to.equals(name);
        });    
        
        it("has correct symbol ",async ()=>{
            const {ding, symbol} = await loadFixture(deployDing);  
            expect(await ding.symbol()).to.equals(symbol);
        });

        it("has correct total supply ",async ()=>{
            const {ding, totalSupply} = await loadFixture(deployDing);  
            expect(await ding.totalSupply()).to.equals(tokens(totalSupply));
        });

        it("has correct version ",async ()=>{
            const {ding, version} = await loadFixture(deployDing);  
            expect(await ding.version()).to.equals(version);
        });

        it("owner has all tokens", async()=>{
            const {ding, owner, totalSupply} = await loadFixture(deployDing); 
            expect(await ding.balanceOf(owner.address)).to.equal(tokens(totalSupply))
        })

    });
    describe("Sending Token",()=>{
        describe("Happy scenario",()=>{
            it("token transfer correctly",async()=>{
                const amount =10;
                const {ding,owner,otherAccount,totalSupply} = await loadFixture(deployDing);
                let transaction = await ding.connect(owner).transfer(otherAccount.address,tokens(amount));
                let result = await transaction.wait();
                expect(await ding.balanceOf(owner.address)).to.equal(tokens(totalSupply-amount));
                expect(await ding.balanceOf(otherAccount.address)).to.equal(tokens(amount));
            })
            it("token emit transfer event",async ()=>{
                const amount = 10;
                const {ding,owner,otherAccount,totalSupply} = await loadFixture(deployDing);
                await expect(ding.connect(owner).transfer(otherAccount.address, tokens(amount)))
                .to.emit(ding,"Transfer")
                .withArgs(owner.address, otherAccount.address, tokens(amount));
            })
        })
        describe("Sad scenario",()=>{
            it("not enough balance",async()=>{
                const amount =10;
                const {ding,owner,otherAccount,totalSupply} = await loadFixture(deployDing);
                await expect(ding.connect(owner).transfer(otherAccount.address, tokens(totalSupply +amount))).to.be.reverted
            })
        })

    })

})