const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer Address: ${deployer.address}`);

  const CertificatePayment = await ethers.getContractFactory("CertificatePayment"); 
  console.log("Deploying CertificatePayment contract on Local Hardhat Node...");

  const contract = await CertificatePayment.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("Deployed CertificatePayment at:", contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });