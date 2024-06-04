import * as anchor from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

import * as dotenv from 'dotenv';
dotenv.config();

const loadPrivateKey = (base58PrivateKey: string) => {
    if (!base58PrivateKey) {
        throw new Error('env var for pk is not set');
    }
    const privateKeyUint8Array = bs58.decode(base58PrivateKey);
    return Keypair.fromSecretKey(privateKeyUint8Array);
};

export const PROVIDER_KEYPAIR = loadPrivateKey(process.env.PROVIDER_PRIVATE_KEY);
export const USER = PROVIDER_KEYPAIR.publicKey;
