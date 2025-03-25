// const { ethers } = require("hardhat");

// async function main() {
//   const CertificatePayment = await ethers.getContractFactory("CertificateManager");
//   console.log("🚀 Deploying CertificatePayment contract...");
  
//   const contract = await CertificatePayment.deploy();
//   await contract.waitForDeployment();

//   const contractAddress = await contract.getAddress();
//   console.log("✅ Deployed CertificatePayment at:", contractAddress);
// }

// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error("❌ Deployment failed:", error);
//     process.exit(1);
//   });

const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners(); // 👈 Use Hardhat's pre-funded account
  console.log(`💰 Deployer Address: ${deployer.address}`);

  const CertificateManager = await ethers.getContractFactory("CertificateManager");
  console.log("🚀 Deploying CertificateManager contract on Local Hardhat Node...");

  const contract = await CertificateManager.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("✅ Deployed CertificateManager at:", contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
