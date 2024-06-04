use anchor_lang::prelude::*;

use crate::pump::pump_idl;
use crate::pump::pump_idl::program::Pump;

pub fn pump_buy(ctx: Context<PumpBuy>, amount: u64, max_sol_cost: u64) -> Result<()> {
    let cpi_ctx = CpiContext::new(
        ctx.accounts.pump_program.to_account_info(),
        pump_idl::cpi::accounts::Buy {
            global: ctx.accounts.global.to_account_info(),
            fee_recipient: ctx.accounts.fee_recipient.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            bonding_curve: ctx.accounts.bonding_curve.to_account_info(),
            associated_bonding_curve: ctx.accounts.associated_bonding_curve.to_account_info(),
            associated_user: ctx.accounts.associated_user.to_account_info(),
            user: ctx.accounts.user.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
            event_authority: ctx.accounts.event_authority.to_account_info(),
            program: ctx.accounts.pump_program.to_account_info(),
        },
    );
    pump_idl::cpi::buy(cpi_ctx, amount, max_sol_cost)?;

    Ok(())
}

#[derive(Accounts)]
pub struct PumpBuy<'info> {
    pub global: Account<'info, pump_idl::accounts::Global>,
    #[account(mut)]
    /// CHECK: This is safe.
    pub fee_recipient: AccountInfo<'info>,
    /// CHECK: This is safe.
    pub mint: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK: This is safe.
    pub bonding_curve: Account<'info, pump_idl::accounts::BondingCurve>,
    #[account(mut)]
    /// CHECK: This is safe.
    pub associated_bonding_curve: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK: This is safe.
    pub associated_user: AccountInfo<'info>,
    #[account(mut)]
    pub user: Signer<'info>,
    /// CHECK: This is safe.
    pub system_program: AccountInfo<'info>,
    /// CHECK: This is safe.
    pub token_program: AccountInfo<'info>,
    /// CHECK: This is safe.
    pub rent: Sysvar<'info, Rent>,
    /// CHECK: This is safe.
    pub event_authority: AccountInfo<'info>,
    /// CHECK: This is safe.
    pub pump_program: Program<'info, Pump>,
}
