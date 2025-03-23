const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    const balance = await deployer.provider.getBalance(deployer.address);

    console.log(`💰 Balance of ${deployer.address}: ${ethers.formatEther(balance)} ETH`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error fetching balance:", error);
        process.exit(1);
    });