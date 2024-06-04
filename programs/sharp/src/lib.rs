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
        params: RaydiumSwapBaseInParams,
    ) -> Result<()> {
        raydium_swap_base_in::raydium_swap_base_in(ctx, params)
    }
}
