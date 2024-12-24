import ipfsClient from './ipfsClient';

const testIpfsConnection = async () => {
  try {
    const { version } = await ipfsClient.id();
    console.log('IPFS connection successful, version:', version);
  } catch (error) {
    console.error('IPFS connection error:', error);
  }
};

testIpfsConnection();