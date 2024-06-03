use anchor_lang::prelude::*;

declare_id!("6NLhWY23DxVyReB9m5uPakQbN13yJj7mveZNXsvxtfKy");

#[program]
pub mod sharp {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
