import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
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
        const ding2 = await Ding.deploy("Mock USDT", "mUSDT", "0.1.0", 1000000)
        const transaction = await ding.connect(owner).transfer(user1.address,tokens(100))
        await transaction.wait();
        const transaction2 = await ding2.connect(owner).transfer(user2.address,tokens(100))
        await transaction2.wait();
        return {exchange, Exchange, owner, user1, user2, feeAccount, feePercentage, Ding, ding,ding2}
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
            it("emit deposit event", async()=>{
                const{ding, exchange, user1} = await loadFixture(deployExchange);
                const amount = 10;
                const transaction1 = await ding.connect(user1).approve(exchange.address, tokens(amount));
                await transaction1.wait();
                await expect(exchange.connect(user1).depositToken(ding.address, tokens(amount)))
                .to.emit(exchange,"Deposit")
                .withArgs(ding.address, user1.address, tokens(amount), tokens(amount));
            })
            
        })
        describe("Sad scenario", ()=>{
            it("don't have allowance to deposit",async()=> {
                const{ding, exchange, user1} = await loadFixture(deployExchange);
                await expect(exchange.connect(user1).depositToken(ding.address, tokens(10))).to.be.reverted;
            })
        })
    })
    describe("Withdraw token",()=>{
        describe("Happy scenario",()=>{
            it("withdraw token successfully", async()=>{
                const{ding, exchange, user1} = await loadFixture(deployExchange);
                var transaction = await ding.connect(user1).approve(exchange.address, tokens(10));
                await transaction.wait();
                transaction = await exchange.connect(user1).depositToken(ding.address, tokens(10));
                await transaction.wait();
                transaction = await exchange.connect(user1).withdrawToken(ding.address, tokens(10));
                await transaction.wait();
                expect(await ding.balanceOf(exchange.address)).to.equals(0);
                expect(await exchange.balanceOf(user1.address,ding.address)).to.equals(0);
                expect(await ding.balanceOf(user1.address)).to.equals(tokens(100));
            })
            it("emit withdraw event", async()=>{
                const{ding, exchange, user1} = await loadFixture(deployExchange);
                var transaction = await ding.connect(user1).approve(exchange.address, tokens(10));
                await transaction.wait();
                transaction = await exchange.connect(user1).depositToken(ding.address, tokens(10));
                await transaction.wait();
                await expect(exchange.connect(user1).withdrawToken(ding.address, tokens(10)))
                .to.emit(exchange, "Withdraw")
                .withArgs(ding.address, user1.address, tokens(10), 0)
            })
            
        })
        describe("Sad scenario", ()=>{
            it("don't have balance to withdraw",async()=> {
                const{ding, exchange, user1, user2} = await loadFixture(deployExchange);
                var transaction = await ding.connect(user1).approve(exchange.address, tokens(10));
                await transaction.wait();
                transaction = await exchange.connect(user1).depositToken(ding.address, tokens(10));
                await transaction.wait();
                await expect(exchange.connect(user2).withdrawToken(ding.address, tokens(10))).to.be.reverted;
            })
        })
    })
    describe("Make order",()=>{
        describe("Happy scenario",()=>{
            it("make order successfully", async()=>{
                const{ding, ding2, exchange, user1} = await loadFixture(deployExchange);
                var transaction = await ding.connect(user1).approve(exchange.address, tokens(10));
                await transaction.wait();
                transaction = await exchange.connect(user1).depositToken(ding.address, tokens(10));
                await transaction.wait();
                transaction = await exchange.connect(user1).makeOrder(ding2.address, tokens(100), ding.address, tokens(10));
                await transaction.wait();
                expect(await ding.balanceOf(exchange.address)).to.equals(tokens(10));
                expect(await exchange.balanceOf(user1.address,ding.address)).to.equals(0);
                expect(await exchange.orderCount()).to.equals(1);
            })
            it("emit order event", async()=>{
                const{ding, ding2, exchange, user1} = await loadFixture(deployExchange);
                var transaction = await ding.connect(user1).approve(exchange.address, tokens(10));
                await transaction.wait();
                transaction = await exchange.connect(user1).depositToken(ding.address, tokens(10));
                await transaction.wait();
                await expect(exchange.connect(user1).makeOrder(ding2.address, tokens(100), ding.address, tokens(10)))
                .to.emit(exchange, "Order")
                .withArgs(1,user1.address, ding2.address, tokens(100), ding.address, tokens(10), anyValue)
            })
            
        })
        describe("Sad scenario", ()=>{
            it("don't have balance to make order",async()=> {
                const{ding, ding2, exchange, user1} = await loadFixture(deployExchange);
                await expect(exchange.connect(user1).makeOrder(ding2.address, tokens(100), ding.address, tokens(10))).to.be.reverted;
            })
        })
    })
    describe("Cancel order",()=>{
        describe("Happy scenario",()=>{
            it("cancel order successfully", async()=>{
                const{ding, ding2, exchange, user1} = await loadFixture(deployExchange);
                var transaction = await ding.connect(user1).approve(exchange.address, tokens(10));
                await transaction.wait();
                transaction = await exchange.connect(user1).depositToken(ding.address, tokens(10));
                await transaction.wait();
                transaction = await exchange.connect(user1).makeOrder(ding2.address, tokens(100), ding.address, tokens(10));
                await transaction.wait();
                transaction = await exchange.connect(user1).cancelOrder(1);
                await transaction.wait();
                expect(await exchange.cancelOrders(1)).to.equals(true);
            })
            it("emit cancel order event", async()=>{
                const{ding, ding2, exchange, user1} = await loadFixture(deployExchange);
                var transaction = await ding.connect(user1).approve(exchange.address, tokens(10));
                await transaction.wait();
                transaction = await exchange.connect(user1).depositToken(ding.address, tokens(10));
                await transaction.wait();
                transaction = await exchange.connect(user1).makeOrder(ding2.address, tokens(100), ding.address, tokens(10));
                await transaction.wait();
                await expect(exchange.connect(user1).cancelOrder(1))
                .to.emit(exchange, "CancelOrder")
                .withArgs(1,user1.address, ding2.address, tokens(100), ding.address, tokens(10), anyValue)
            })  
        })
        describe("Sad scenario", ()=>{
            it("no order with this id",async()=> {
                const{ding, ding2, exchange, user1} = await loadFixture(deployExchange);
                await expect(exchange.connect(user1).cancelOrder(1)).to.be.reverted;
            })
            it("only the owner can cancel the order",async()=> {
                const{ding, ding2, exchange, user1, user2} = await loadFixture(deployExchange);
                var transaction = await ding.connect(user1).approve(exchange.address, tokens(10));
                await transaction.wait();
                transaction = await exchange.connect(user1).depositToken(ding.address, tokens(10));
                await transaction.wait();
                transaction = await exchange.connect(user1).makeOrder(ding2.address, tokens(100), ding.address, tokens(10));
                await transaction.wait();
                await expect(exchange.connect(user2).cancelOrder(1)).to.be.reverted;
            })
            it("can't cancel an already canceled order",async()=> {
                const{ding, ding2, exchange, user1, user2} = await loadFixture(deployExchange);
                var transaction = await ding.connect(user1).approve(exchange.address, tokens(10));
                await transaction.wait();
                transaction = await exchange.connect(user1).depositToken(ding.address, tokens(10));
                await transaction.wait();
                transaction = await exchange.connect(user1).makeOrder(ding2.address, tokens(100), ding.address, tokens(10));
                await transaction.wait();
                transaction = await exchange.connect(user1).cancelOrder(1);
                await transaction.wait();
                await expect(exchange.connect(user1).cancelOrder(1)).to.be.reverted;
            })
            it("can't cancel a filled order",async()=> {
                const{ding, ding2, exchange, user1, user2, feeAccount, feePercentage} = await loadFixture(deployExchange);
                const amount1 = 10, amount2 = 50;
                var transaction = await ding.connect(user1).approve(exchange.address, tokens(amount1));
                await transaction.wait();
                transaction = await exchange.connect(user1).depositToken(ding.address, tokens(amount1));
                await transaction.wait();
                var transaction = await ding2.connect(user2).approve(exchange.address, tokens(amount2+(amount2*feePercentage/100)));
                await transaction.wait();
                transaction = await exchange.connect(user2).depositToken(ding2.address, tokens(amount2+(amount2*feePercentage/100)));
                await transaction.wait();
                transaction = await exchange.connect(user1).makeOrder(ding2.address, tokens(amount2), ding.address, tokens(amount1));
                await transaction.wait();
                transaction = await exchange.connect(user2).fillOrder(1);
                await transaction.wait();
                await expect(exchange.connect(user1).cancelOrder(1)).to.be.reverted;
            })
        })
    })
    describe("Fill order",()=>{
        describe("Happy scenario",()=>{
            it("Fill order successfully", async()=>{
                const{ding, ding2, exchange, user1, user2, feeAccount, feePercentage} = await loadFixture(deployExchange);
                const amount1 = 10, amount2 = 50;
                var transaction = await ding.connect(user1).approve(exchange.address, tokens(amount1));
                await transaction.wait();
                transaction = await exchange.connect(user1).depositToken(ding.address, tokens(amount1));
                await transaction.wait();
                var transaction = await ding2.connect(user2).approve(exchange.address, tokens(amount2+(amount2*feePercentage/100)));
                await transaction.wait();
                transaction = await exchange.connect(user2).depositToken(ding2.address, tokens(amount2+(amount2*feePercentage/100)));
                await transaction.wait();
                transaction = await exchange.connect(user1).makeOrder(ding2.address, tokens(amount2), ding.address, tokens(amount1));
                await transaction.wait();
                transaction = await exchange.connect(user2).fillOrder(1);
                await transaction.wait();
                expect(await exchange.fillOrders(1)).to.equals(true);
                expect(await exchange.balanceOf(user1.address,ding.address)).to.be.equals(tokens(0));
                expect(await exchange.balanceOf(user2.address,ding.address)).to.be.equals(tokens(amount1));
                expect(await exchange.balanceOf(user1.address,ding2.address)).to.be.equals(tokens(amount2));
                expect(await exchange.balanceOf(user2.address,ding2.address)).to.be.equals(tokens(0));  
                expect(await exchange.balanceOf(feeAccount.address,ding2.address)).to.be.equals(tokens(amount2*feePercentage/100));  

            })
            it("emit fill order event", async()=>{
                const{ding, ding2, exchange, user1, user2, feeAccount, feePercentage} = await loadFixture(deployExchange);
                const amount1 = 10, amount2 = 50;
                var transaction = await ding.connect(user1).approve(exchange.address, tokens(amount1));
                await transaction.wait();
                transaction = await exchange.connect(user1).depositToken(ding.address, tokens(amount1));
                await transaction.wait();
                var transaction = await ding2.connect(user2).approve(exchange.address, tokens(amount2+(amount2*feePercentage/100)));
                await transaction.wait();
                transaction = await exchange.connect(user2).depositToken(ding2.address, tokens(amount2+(amount2*feePercentage/100)));
                await transaction.wait();
                transaction = await exchange.connect(user1).makeOrder(ding2.address, tokens(amount2), ding.address, tokens(amount1));
                await transaction.wait();
                expect(await exchange.connect(user2).fillOrder(1))
                .to.emit(exchange, "FillOrder")
                .withArgs(1,user1.address, user2.address, ding2.address, tokens(amount2), ding.address, tokens(amount1), anyValue);
            })  
        })
        describe("Sad scenario", ()=>{
            it("no order with this id",async()=> {
                const{ding, ding2, exchange, user1, user2} = await loadFixture(deployExchange);
                await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted;
            })
            it("can't fill a canceled order",async()=> {
                const{ding, ding2, exchange, user1, user2} = await loadFixture(deployExchange);
                var transaction = await ding.connect(user1).approve(exchange.address, tokens(10));
                await transaction.wait();
                transaction = await exchange.connect(user1).depositToken(ding.address, tokens(10));
                await transaction.wait();
                transaction = await exchange.connect(user1).makeOrder(ding2.address, tokens(100), ding.address, tokens(10));
                await transaction.wait();
                transaction = await exchange.connect(user1).cancelOrder(1);
                await transaction.wait();
                await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted;
            })
            it("no enough balance to fill this order",async()=> {
                const{ding, ding2, exchange, user1, user2, feeAccount, feePercentage} = await loadFixture(deployExchange);
                const amount1 = 10, amount2 = 50;
                var transaction = await ding.connect(user1).approve(exchange.address, tokens(amount1));
                await transaction.wait();
                transaction = await exchange.connect(user1).depositToken(ding.address, tokens(amount1));
                await transaction.wait();
                var transaction = await ding2.connect(user2).approve(exchange.address, tokens(amount2+(amount2*feePercentage/100)));
                await transaction.wait();
                transaction = await exchange.connect(user2).depositToken(ding2.address, tokens(amount2));
                await transaction.wait();
                transaction = await exchange.connect(user1).makeOrder(ding2.address, tokens(amount2), ding.address, tokens(amount1));
                await transaction.wait();
                await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted;
            })
            it("can't fill an already filled order",async()=> {
                const{ding, ding2, exchange, user1, user2, feeAccount, feePercentage} = await loadFixture(deployExchange);
                const amount1 = 10, amount2 = 50;
                var transaction = await ding.connect(user1).approve(exchange.address, tokens(amount1));
                await transaction.wait();
                transaction = await exchange.connect(user1).depositToken(ding.address, tokens(amount1));
                await transaction.wait();
                var transaction = await ding2.connect(user2).approve(exchange.address, tokens(amount2+(amount2*feePercentage/100)));
                await transaction.wait();
                transaction = await exchange.connect(user2).depositToken(ding2.address, tokens(amount2+(amount2*feePercentage/100)));
                await transaction.wait();
                transaction = await exchange.connect(user1).makeOrder(ding2.address, tokens(amount2), ding.address, tokens(amount1));
                await transaction.wait();
                transaction = await exchange.connect(user2).fillOrder(1);
                await transaction.wait();
                await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted;
            })
        })
    })
})