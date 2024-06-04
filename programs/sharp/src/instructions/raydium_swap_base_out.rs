use anchor_lang::prelude::*;
use solana_program::{instruction::Instruction, program::invoke};

use crate::instructions::raydium_swap::RaydiumSwap;

pub fn raydium_swap_base_out(
    ctx: Context<RaydiumSwap>,
    max_amount_in: u64,
    amount_out: u64,
) -> Result<()> {
    let amm_program = ctx.accounts.amm_program.to_account_info();
    let amm = ctx.accounts.amm.to_account_info();
    let amm_authority = ctx.accounts.amm_authority.to_account_info();
    let amm_open_orders = ctx.accounts.amm_open_orders.to_account_info();
    let amm_target_orders = ctx.accounts.amm_target_orders.to_account_info();
    let amm_coin_vault = ctx.accounts.amm_coin_vault.to_account_info();
    let amm_pc_vault = ctx.accounts.amm_pc_vault.to_account_info();
    let market_program = ctx.accounts.market_program.to_account_info();
    let market = ctx.accounts.market.to_account_info();
    let market_bids = ctx.accounts.market_bids.to_account_info();
    let market_asks = ctx.accounts.market_asks.to_account_info();
    let market_event_queue = ctx.accounts.market_event_queue.to_account_info();
    let market_coin_vault = ctx.accounts.market_coin_vault.to_account_info();
    let market_pc_vault = ctx.accounts.market_pc_vault.to_account_info();
    let market_vault_signer = ctx.accounts.market_vault_signer.to_account_info();
    let user_token_source = ctx.accounts.user_token_source.to_account_info();
    let user_token_destination = ctx.accounts.user_token_destination.to_account_info();
    let user_source_owner = ctx.accounts.user_source_owner.to_account_info();
    let token_program = ctx.accounts.token_program.to_account_info();

    let instruction_index: u8 = 11;
    let data = SwapBaseOutAmounts {
        max_amount_in,
        amount_out,
    };

    let instruction = Instruction {
        program_id: amm_program.key(),
        accounts: vec![
            // spl token
            AccountMeta::new_readonly(token_program.key(), false),
            // amm
            AccountMeta::new(amm.key(), false),
            AccountMeta::new_readonly(amm_authority.key(), false),
            AccountMeta::new(amm_open_orders.key(), false),
            AccountMeta::new(amm_target_orders.key(), false),
            // vaults
            AccountMeta::new(amm_coin_vault.key(), false),
            AccountMeta::new(amm_pc_vault.key(), false),
            // serum
            AccountMeta::new_readonly(market_program.key(), false),
            AccountMeta::new(market.key(), false),
            AccountMeta::new(market_bids.key(), false),
            AccountMeta::new(market_asks.key(), false),
            AccountMeta::new(market_event_queue.key(), false),
            AccountMeta::new(market_coin_vault.key(), false),
            AccountMeta::new(market_pc_vault.key(), false),
            AccountMeta::new_readonly(market_vault_signer.key(), false),
            // user
            AccountMeta::new(user_token_source.key(), false),
            AccountMeta::new(user_token_destination.key(), false),
            AccountMeta::new_readonly(user_source_owner.key(), true),
        ],
        data: (instruction_index, data).try_to_vec()?,
    };

    let accounts = [
        // spl token
        token_program.clone(),
        // amm
        amm.clone(),
        amm_authority.clone(),
        amm_open_orders.clone(),
        amm_target_orders.clone(),
        // vaults
        amm_coin_vault.clone(),
        amm_pc_vault.clone(),
        // serum
        market_program.clone(),
        market.clone(),
        market_bids.clone(),
        market_asks.clone(),
        market_event_queue.clone(),
        market_coin_vault.clone(),
        market_pc_vault.clone(),
        market_vault_signer.clone(),
        // user
        user_token_source.clone(),
        user_token_destination.clone(),
        user_source_owner.to_account_info().clone(),
    ];

    invoke(&instruction, &accounts)?;

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct SwapBaseOutAmounts {
    pub max_amount_in: u64,
    pub amount_out: u64,
}
