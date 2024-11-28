# Sharp Program

Sharp is a solana program built to avoid MEV on pump.fun and raydium swaps.

By deploying a custom program and making new methods that use CPI to actually execute swaps it is very difficult for MEV bots to read inputs / outputs of trades. By making it harder to decode your inputs ( specifically max slippage ) MEV bots have a much harder time sandwiching your transaction between a buy meant to put you right under your max slippage and a sell to take those extra funds.
