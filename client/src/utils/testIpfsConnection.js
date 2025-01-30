import ipfsClient from './ipfsClient.js';

const testIpfsConnection = async () => {
  try {
    const id = await ipfsClient.id();
    console.log('IPFS connection successful:', id);
  } catch (error) {
    console.error('IPFS connection failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
  }
};

testIpfsConnection();