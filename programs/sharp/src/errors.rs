use anchor_lang::error_code;

#[error_code]
pub enum ErrorCodes {
    #[msg("invalid raydium authority")]
    InvalidRaydiumAuthority,
}
