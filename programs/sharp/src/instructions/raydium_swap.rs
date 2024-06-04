use anchor_lang::prelude::*;

use anchor_spl::token::Token;

use crate::constants::*;
use crate::errors::ErrorCodes;

#[derive(Accounts)]
pub struct RaydiumSwap<'info> {
    /// CHECK: Safe. Raydium program id
    pub amm_program: UncheckedAccount<'info>,

    /// CHECK: Safe. amm Account
    #[account(mut)]
    pub amm: UncheckedAccount<'info>,

    /// CHECK: Safe. Amm authority Account
    #[account(
        address = RAYDIUM_AMM_AUTHORITY @ ErrorCodes::InvalidRaydiumAuthority,
    )]
    pub amm_authority: UncheckedAccount<'info>,

    /// CHECK: Safe. amm_open_orders Account
    #[account(mut)]
    pub amm_open_orders: UncheckedAccount<'info>,

    /// CHECK: Safe. amm_target_orders Account
    #[account(mut)]
    pub amm_target_orders: UncheckedAccount<'info>,

    /// CHECK: Safe. amm_coin_vault Amm Account to swap FROM or To,
    #[account(mut)]
    pub amm_coin_vault: UncheckedAccount<'info>,

    /// CHECK: Safe. amm_pc_vault Amm Account to swap FROM or To,
    #[account(mut)]
    pub amm_pc_vault: UncheckedAccount<'info>,

    /// CHECK: Safe. OpenBook program id
    pub market_program: UncheckedAccount<'info>,

    /// CHECK: Safe. OpenBook market Account. OpenBook program is the owner.
    #[account(mut)]
    pub market: UncheckedAccount<'info>,

    /// CHECK: Safe. bids Account
    #[account(mut)]
    pub market_bids: UncheckedAccount<'info>,

    /// CHECK: Safe. asks Account
    #[account(mut)]
    pub market_asks: UncheckedAccount<'info>,

    /// CHECK: Safe. event_q Account
    #[account(mut)]
    pub market_event_queue: UncheckedAccount<'info>,

    /// CHECK: Safe. coin_vault Account
    #[account(mut)]
    pub market_coin_vault: UncheckedAccount<'info>,

    /// CHECK: Safe. pc_vault Account
    #[account(mut)]
    pub market_pc_vault: UncheckedAccount<'info>,

    /// CHECK: Safe. vault_signer Account
    #[account(mut)]
    pub market_vault_signer: UncheckedAccount<'info>,

    /// CHECK: Safe. user source token Account. user Account to swap from.
    #[account(mut)]
    pub user_token_source: UncheckedAccount<'info>,

    /// CHECK: Safe. user destination token Account. user Account to swap to.
    #[account(mut)]
    pub user_token_destination: UncheckedAccount<'info>,

    /// CHECK: Safe. user owner Account
    #[account(mut)]
    pub user_source_owner: Signer<'info>,

    /// CHECK: Safe. The spl token program
    pub token_program: Program<'info, Token>,
}
