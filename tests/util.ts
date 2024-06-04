import { getAssociatedTokenAddress } from '@solana/spl-token';
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { web3 } from '@coral-xyz/anchor';

export const generateUserAtas = async (
    user: web3.PublicKey,
    inMint: web3.PublicKey,
    outMint: web3.PublicKey,
) => {
    const userTokenSource = await getAssociatedTokenAddress(inMint, user);
    const userTokenDestination = await getAssociatedTokenAddress(outMint, user);
    return { userTokenSource, userTokenDestination };
};
