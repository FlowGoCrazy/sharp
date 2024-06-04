use anchor_lang::prelude::*;

use crate::instructions::raydium_swap::RaydiumSwap;

pub fn raydium_swap_base_in(
    _ctx: Context<RaydiumSwap>,
    _params: RaydiumSwapBaseInParams,
) -> Result<()> {
    todo!()
}

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct RaydiumSwapBaseInParams {}
