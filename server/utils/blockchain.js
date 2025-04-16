const { ethers } = require("ethers");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const certificateRegistryAddress = process.env.CONTRACT_REGISTRY_ADDRESS;
const certificateVerificationAddress = process.env.CONTRACT_VERIFICATION_ADDRESS;

const certificateRegistryAbi = require("../abis/CertificateRegistry.json");
const certificateVerificationAbi = require("../abis/CertificateVerification.json");

const certificateRegistry = new ethers.Contract(certificateRegistryAddress, certificateRegistryAbi, wallet);
const certificateVerification = new ethers.Contract(certificateVerificationAddress, certificateVerificationAbi, wallet);

module.exports = { certificateRegistry, certificateVerification };