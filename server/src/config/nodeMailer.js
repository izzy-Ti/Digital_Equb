import sib from 'sib-api-v3-sdk';
import dotenv from 'dotenv';

dotenv.config();

const client = sib.ApiClient.instance;

const apiKey = client.authentications['api-key'];

if (!apiKey) {
    throw new Error('API key authentication object not found.');
}

apiKey.apiKey = process.env.API_BERVO;

const transporter = new sib.TransactionalEmailsApi();

export default transporter;