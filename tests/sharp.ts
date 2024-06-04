import {
    createAssociatedTokenAccountInstruction,
    createInitializeAccountInstruction,
    createCloseAccountInstruction,
    TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Sharp } from '../target/types/sharp';

import { generateUserAtas } from './util';
import { PROVIDER_KEYPAIR, USER } from './constants';

describe('sharp', async () => {
    anchor.setProvider(anchor.AnchorProvider.env());

    const PROVIDER = anchor.getProvider();
    const PROGRAM = anchor.workspace.Sharp as Program<Sharp>;

    const userWallet = new anchor.Wallet(PROVIDER_KEYPAIR);

    const setCuLimitIx = anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({
        units: 300_000,
    });

    it('can swap base in on raydium', async () => {
        const inMint = new anchor.web3.PublicKey('So11111111111111111111111111111111111111112');
        const outMint = new anchor.web3.PublicKey('nLKhEUbWB3xx3Rr9DJDWGBEUraJY3mUyhgy3axYDqF3');

        const { userTokenDestination } = await generateUserAtas(USER, inMint, outMint);

        const seed = anchor.web3.Keypair.generate().publicKey.toBase58().substring(0, 32);

        const userTokenSource = await anchor.web3.PublicKey.createWithSeed(
            USER,
            seed,
            TOKEN_PROGRAM_ID,
        );

        const createUserTokenSourceAccountIx =
            await anchor.web3.SystemProgram.createAccountWithSeed({
                basePubkey: USER,
                lamports: 1_100_000_000,
                newAccountPubkey: userTokenSource,
                programId: TOKEN_PROGRAM_ID,
                seed: seed,
                fromPubkey: USER,
                space: 165,
            });

        const initializeUserTokenSourceAccountIx = await createInitializeAccountInstruction(
            userTokenSource,
            inMint,
            USER,
        );

        const createUserTokenDestinationAccountIx = await createAssociatedTokenAccountInstruction(
            USER,
            userTokenDestination,
            USER,
            outMint,
        );

        const swapIx = await PROGRAM.methods
            .raydiumSwapBaseIn(new anchor.BN(1_000_000_000), new anchor.BN(100_000))
            .accounts({
                ammProgram: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',

                amm: 'GCCNLvpp6wVPWUaXRguXPCv84g2utWYXXfiqcy6y5zg4',
                ammOpenOrders: 'EsXYKKYuBMxSRgV6d6ExRZeJB9iZiPs4JGamPdsSRMZn',
                ammTargetOrders: 'FFms2iYnwKfXAuTqmP12z7uqD4fRHr4E9bxUtt5hY7yo',
                ammCoinVault: '5UrrK6d4TxnMj5ejTxAcabJfSyn58de4eaYuTnibPgV3',
                ammPcVault: '4YHFVkhULspUPGc8MBsvfaBhXLEzfnoBU6rVyhT2qmSk',

                marketProgram: 'srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX',
                market: '65VnQdkc78GctbqYpXaMPmaTMfUUedp6jp43z5ZLftmC',
                marketBids: '6ksp1MZFoUUAzBJMbW1VcSiLG3iXdxzUXHrB9ZYjetYp',
                marketAsks: '2y3fT7VkhhwC5FD4qpP3RbEbCYRC7wv4mwupDf4FsKKk',
                marketEventQueue: 'BDNPVv8bM5ew7aXWGXNJ4C9HmENJfbA5ZAnbHi7Htssj',
                marketCoinVault: '67wM6L6KHn4Nu72AKQNjWV854sGmgPVvJV3VN8vTHvxx',
                marketPcVault: '4CknBkuczy4tUss7aEoCqV27Bt7oGMem8RtR1dvjkfpz',
                marketVaultSigner: 'Ga8wTh2bWy9oL8mPEUD23sys56HdXwAWt73yGsFCoJSY',

                userTokenSource,
                userTokenDestination,
                userSourceOwner: USER,
            })
            .instruction();

        const closeUserTokenSourceAccountIx = await createCloseAccountInstruction(
            userTokenSource,
            USER,
            USER,
        );

        const tx = new anchor.web3.Transaction();
        tx.add(setCuLimitIx);
        tx.add(createUserTokenSourceAccountIx);
        tx.add(initializeUserTokenSourceAccountIx);
        tx.add(createUserTokenDestinationAccountIx);
        tx.add(swapIx);
        tx.add(closeUserTokenSourceAccountIx);

        const { blockhash, lastValidBlockHeight } = await PROVIDER.connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;
        tx.lastValidBlockHeight = lastValidBlockHeight;
        tx.feePayer = USER;

        const signedTx = await userWallet.signTransaction(tx);
        const signature = await anchor
            .getProvider()
            .connection.sendRawTransaction(signedTx.serialize(), {
                skipPreflight: true,
            });

        await anchor.getProvider().connection.confirmTransaction(signature, 'confirmed');
        const txData = await anchor
            .getProvider()
            .connection.getParsedTransaction(signature, 'confirmed');

        if (txData.meta.err != null) {
            console.log(JSON.stringify(txData.meta.logMessages, null, 2));
            console.log(txData.meta.err);
            throw txData.meta.err;
        }

        /* calculate sol spent */
        const preSolBalance = txData.meta.preBalances[0];
        const postSolBalance = txData.meta.postBalances[0];
        const solSpent = (preSolBalance - postSolBalance) / 1_000_000_000;

        /* calculate tokens received */
        let preTokenBalance = 0;
        for (const tokenBalance of txData.meta.preTokenBalances) {
            if (tokenBalance.mint == outMint.toBase58() && tokenBalance.owner == USER.toBase58()) {
                preTokenBalance = tokenBalance.uiTokenAmount.uiAmount;
                break;
            }
        }
        let postTokenBalance = 0;
        for (const tokenBalance of txData.meta.postTokenBalances) {
            if (tokenBalance.mint == outMint.toBase58() && tokenBalance.owner == USER.toBase58()) {
                postTokenBalance = tokenBalance.uiTokenAmount.uiAmount;
                break;
            }
        }
        const tokensReceived = postTokenBalance - preTokenBalance;

        console.log(`spent ${solSpent} SOL and received ${tokensReceived} tokens`);
    });

    it('can swap base out on raydium', async () => {
        const inMint = new anchor.web3.PublicKey('nLKhEUbWB3xx3Rr9DJDWGBEUraJY3mUyhgy3axYDqF3');
        const outMint = new anchor.web3.PublicKey('So11111111111111111111111111111111111111112');

        const { userTokenSource } = await generateUserAtas(USER, inMint, outMint);

        const seed = anchor.web3.Keypair.generate().publicKey.toBase58().substring(0, 32);

        /* already created from base in swap */
        // const createUserTokenSourceAccountIx = await createAssociatedTokenAccountInstruction(
        //     USER,
        //     userTokenSource,
        //     USER,
        //     inMint,
        // );

        const userTokenDestination = await anchor.web3.PublicKey.createWithSeed(
            USER,
            seed,
            TOKEN_PROGRAM_ID,
        );

        const createUserTokenDestinationAccountIx =
            await anchor.web3.SystemProgram.createAccountWithSeed({
                basePubkey: USER,
                lamports: 1_000_000_000,
                newAccountPubkey: userTokenDestination,
                programId: TOKEN_PROGRAM_ID,
                seed: seed,
                fromPubkey: USER,
                space: 165,
            });

        const initializeUserTokenDestinationAccountIx = await createInitializeAccountInstruction(
            userTokenDestination,
            outMint,
            USER,
        );

        const inMintBalanceRaw = await PROVIDER.connection.getTokenAccountBalance(userTokenSource);
        const inMintBalance = parseInt(inMintBalanceRaw.value.amount);

        const swapIx = await PROGRAM.methods
            .raydiumSwapBaseOut(new anchor.BN(inMintBalance), new anchor.BN(995_000_000))
            .accounts({
                ammProgram: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',

                amm: 'GCCNLvpp6wVPWUaXRguXPCv84g2utWYXXfiqcy6y5zg4',
                ammOpenOrders: 'EsXYKKYuBMxSRgV6d6ExRZeJB9iZiPs4JGamPdsSRMZn',
                ammTargetOrders: 'FFms2iYnwKfXAuTqmP12z7uqD4fRHr4E9bxUtt5hY7yo',
                ammCoinVault: '5UrrK6d4TxnMj5ejTxAcabJfSyn58de4eaYuTnibPgV3',
                ammPcVault: '4YHFVkhULspUPGc8MBsvfaBhXLEzfnoBU6rVyhT2qmSk',

                marketProgram: 'srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX',
                market: '65VnQdkc78GctbqYpXaMPmaTMfUUedp6jp43z5ZLftmC',
                marketBids: '6ksp1MZFoUUAzBJMbW1VcSiLG3iXdxzUXHrB9ZYjetYp',
                marketAsks: '2y3fT7VkhhwC5FD4qpP3RbEbCYRC7wv4mwupDf4FsKKk',
                marketEventQueue: 'BDNPVv8bM5ew7aXWGXNJ4C9HmENJfbA5ZAnbHi7Htssj',
                marketCoinVault: '67wM6L6KHn4Nu72AKQNjWV854sGmgPVvJV3VN8vTHvxx',
                marketPcVault: '4CknBkuczy4tUss7aEoCqV27Bt7oGMem8RtR1dvjkfpz',
                marketVaultSigner: 'Ga8wTh2bWy9oL8mPEUD23sys56HdXwAWt73yGsFCoJSY',

                userTokenSource,
                userTokenDestination,
                userSourceOwner: USER,
            })
            .instruction();

        const closeUserTokenDestinationAccountIx = await createCloseAccountInstruction(
            userTokenDestination,
            USER,
            USER,
        );

        const tx = new anchor.web3.Transaction();
        tx.add(setCuLimitIx);
        // tx.add(createUserTokenSourceAccountIx); /* already created from base in swap */
        tx.add(createUserTokenDestinationAccountIx);
        tx.add(initializeUserTokenDestinationAccountIx);
        tx.add(swapIx);
        tx.add(closeUserTokenDestinationAccountIx);

        const { blockhash, lastValidBlockHeight } = await PROVIDER.connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;
        tx.lastValidBlockHeight = lastValidBlockHeight;
        tx.feePayer = USER;

        const signedTx = await userWallet.signTransaction(tx);
        const signature = await anchor
            .getProvider()
            .connection.sendRawTransaction(signedTx.serialize(), {
                skipPreflight: true,
            });

        await anchor.getProvider().connection.confirmTransaction(signature, 'confirmed');
        const txData = await anchor
            .getProvider()
            .connection.getParsedTransaction(signature, 'confirmed');

        if (txData.meta.err != null) {
            console.log(JSON.stringify(txData.meta.logMessages, null, 2));
            console.log(txData.meta.err);
            throw txData.meta.err;
        }

        /* calculate sol received */
        const preSolBalance = txData.meta.preBalances[0];
        const postSolBalance = txData.meta.postBalances[0];
        const solReceived = (postSolBalance - preSolBalance) / 1_000_000_000;

        /* calculate tokens spent */
        let preTokenBalance = 0;
        for (const tokenBalance of txData.meta.preTokenBalances) {
            if (tokenBalance.mint == inMint.toBase58() && tokenBalance.owner == USER.toBase58()) {
                preTokenBalance = tokenBalance.uiTokenAmount.uiAmount;
                break;
            }
        }
        let postTokenBalance = 0;
        for (const tokenBalance of txData.meta.postTokenBalances) {
            if (tokenBalance.mint == inMint.toBase58() && tokenBalance.owner == USER.toBase58()) {
                postTokenBalance = tokenBalance.uiTokenAmount.uiAmount;
                break;
            }
        }
        const tokensSpent = preTokenBalance - postTokenBalance;

        console.log(`spent ${tokensSpent} tokens and received ${solReceived} SOL`);
    });
});
