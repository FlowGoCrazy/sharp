import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Sharp } from '../target/types/sharp';

describe('sharp', () => {
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.Sharp as Program<Sharp>;

    it('initializes', async () => {
        const tx = await program.methods.initialize().rpc();
        console.log('sig:', tx);
    });
});
