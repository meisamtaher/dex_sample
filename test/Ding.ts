import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
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
        const [owner, otherAccount, exchange] = (await ethers.getSigners());

        return {ding, Ding, name, symbol, totalSupply, version, owner, otherAccount, exchange}
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
            it("emit transfer event correctly",async ()=>{
                const amount = 10;
                const {ding,owner,otherAccount} = await loadFixture(deployDing);
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
            it("reciever address can't be 0x0",async()=>{
                const amount =10;
                const {ding,owner} = await loadFixture(deployDing);
                await expect(ding.connect(owner).transfer('0x0000000000000000000000000000000000000000', tokens(amount))).to.be.reverted
            })
        })

    })
    describe("Approve token", ()=>{
        describe("Happy scenario", ()=>{
            it("token spending approve", async()=>{
                const amount =10;
                const {ding,owner,otherAccount} = await loadFixture(deployDing);
                let transaction = await ding.connect(owner).approve(otherAccount.address,tokens(amount));
                let result = await transaction.wait();
                expect(await ding.allowance(owner.address, otherAccount.address)).to.equal(tokens(amount));
            })
            it("emit approve event correctly", async()=>{
                const amount = 10;
                const {ding,owner,otherAccount} = await loadFixture(deployDing);
                await expect(ding.connect(owner).approve(otherAccount.address, tokens(amount)))
                .to.emit(ding,"Approval")
                .withArgs(owner.address, otherAccount.address, tokens(amount));
            })
            
            
        })
        describe("Sad scenario",()=>{
            it("spender address can't be 0x0",async()=>{
                const amount =10;
                const {ding,owner} = await loadFixture(deployDing);
                await expect(ding.connect(owner).approve('0x0000000000000000000000000000000000000000', tokens(amount))).to.be.reverted
            })
        })
    })
    describe("Delegate transfer", ()=>{
        describe("Happy scenario",()=>{
            it("transfer on behalf of somebody", async()=>{
                const amount =10;
                const {ding,owner,otherAccount,exchange,totalSupply} = await loadFixture(deployDing);
                let transaction = await ding.connect(owner).approve(exchange.address,tokens(amount));
                let result = await transaction.wait();
                transaction = await ding.connect(exchange).transferFrom(owner.address,otherAccount.address,tokens(amount));
                result = await transaction.wait();
                expect(await ding.balanceOf(owner.address)).to.equal(tokens(totalSupply-amount));
                expect(await ding.balanceOf(otherAccount.address)).to.equal(tokens(amount));
                expect(await ding.allowance(owner.address, exchange.address)).to.equal(tokens(0));
            })
        })
        describe("Happy scenario",()=>{
            it("transfer on behalf of somebody", async()=>{
                const amount = 10;
                const {ding,owner,otherAccount,exchange,totalSupply} = await loadFixture(deployDing);
                let transaction = await ding.connect(owner).approve(exchange.address,tokens(amount));
                let result = await transaction.wait();
                transaction = await ding.connect(exchange).transferFrom(owner.address,otherAccount.address,tokens(amount));
                result = await transaction.wait();
                expect(await ding.balanceOf(owner.address)).to.equal(tokens(totalSupply-amount));
                expect(await ding.balanceOf(otherAccount.address)).to.equal(tokens(amount));
                expect(await ding.allowance(owner.address, exchange.address)).to.equal(tokens(0));
            })
        })
        describe("Sad scenario",()=>{
            it("transfer is not allowed", async()=>{
                const amount = 10;
                const {ding,owner,otherAccount,exchange,totalSupply} = await loadFixture(deployDing);
                await expect(ding.connect(exchange).transferFrom(owner.address,otherAccount.address, tokens(amount))).to.be.reverted;
            })
            it("reciever address can't be 0x0", async()=>{
                const amount = 10;
                const {ding,owner,otherAccount,exchange,totalSupply} = await loadFixture(deployDing);
                let transaction = await ding.connect(owner).approve(exchange.address,tokens(amount));
                let result = await transaction.wait();
                await expect(ding.connect(exchange).transferFrom(owner.address,'0x0000000000000000000000000000000000000000', tokens(amount))).to.be.reverted;
            })
        })
    })

})