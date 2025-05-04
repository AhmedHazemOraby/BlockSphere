# BlockSphere

BlockSphere is a decentralized certificate and degree verification platform. It leverages blockchain and IPFS to provide immutable and verifiable academic records for users and institutions.

---

## Features

- User & Organization registration and authentication
- Upload and verification of certificates and degrees
- Payment and interaction with smart contracts on Ethereum (via MetaMask)
- Real-time messaging between users
- Notifications for verification actions
- Role-based access for users and organizations

---

## Technologies Used

### Frontend
- React + Vite
- Tailwind CSS
- Context API for state management
- Socket.IO (for real-time features)

### Backend
- Node.js + Express
- MongoDB (via Mongoose)
- Multer (file uploads)
- Ethers.js (blockchain interaction)
- IPFS via Pinata SDK

### Smart Contracts
- Solidity
- Hardhat development environment
- Ethereum local testnet (Hardhat or Ganache)

---

## Project Structure

### Client
components/ - All React components

context/ - Global state management with Context API

images/ - App assets

src/ - Main React app logic

### Server
utils/ - Blockchain, Pinata helpers

---
  
## Getting Started

### 1. Download the repository:

cd blocksphere

2. Install dependencies:

For client:

cd client
npm install

For server:

cd server
npm install

3. Setup Environment Variables:
Create a .env file in the server directory with the following:

MONGODB_URI=your_mongo_connection_string

PORT=5000

PINATA_API_KEY=your_pinata_api_key

PINATA_SECRET_API_KEY=your_pinata_secret

4. Run the app:

IMPORTANT: HOW TO DEPLOY SMART CONTRACT ON LOCAL HARDHAT NODE

1. cd contracts (Open the contracts folder)
   
2. npx hardhat node (To start the hardhat node)
   
3. npx hardhat run scripts/deploy.js --network localhost (Run the deploy.js script in a seperate terminal)
   
4. A contract address will be shown, copy it and paste it in "Network.jsx", "UploadCertificate.jsx" and "UploadDegree.jsx":

const contractAddress = " " # Add your contract address here between quotations

Backend:

cd server
node server.js

Frontend:

cd client
npm run dev

## Important Notes

Use MetaMask on your browser for blockchain interaction.

Uploads are pinned to IPFS via Pinata.

Degrees and certificates are verified through smart contract interaction.

Make sure to have a local hardhat node.
