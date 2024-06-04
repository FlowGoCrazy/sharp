use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
use instructions::*;

declare_id!("6NLhWY23DxVyReB9m5uPakQbN13yJj7mveZNXsvxtfKy");

#[program]
pub mod sharp {
    use super::*;

    // proxy raydium swap base in for MEV protection
    pub fn raydium_swap_base_in(
        ctx: Context<RaydiumSwap>,
        amount_in: u64,
        minimum_amount_out: u64,
    ) -> Result<()> {
        raydium_swap_base_in::raydium_swap_base_in(ctx, amount_in, minimum_amount_out)
    }

    // proxy raydium swap base out for MEV protection
    pub fn raydium_swap_base_out(
        ctx: Context<RaydiumSwap>,
        max_amount_in: u64,
        amount_out: u64,
    ) -> Result<()> {
        raydium_swap_base_out::raydium_swap_base_out(ctx, max_amount_in, amount_out)
    }
}
