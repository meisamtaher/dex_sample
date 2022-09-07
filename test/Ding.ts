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
    
        return {ding, Ding, name, symbol, totalSupply, version}
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

    });

})