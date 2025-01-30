import { uploadToPinata } from '../../../server/utils/pinataClient.js';

const testPinataConnection = async () => {
  try {
    const sampleFileBuffer = Buffer.from('Hello, Pinata!');
    const sampleFileName = 'test.txt';

    const pinataUrl = await uploadToPinata(sampleFileBuffer, sampleFileName);
    console.log('Pinata upload successful:', pinataUrl);
  } catch (error) {
    console.error('Pinata connection failed:', error.message);
    console.error('Error details:', error.response?.data || error);
  }
};

testPinataConnection();