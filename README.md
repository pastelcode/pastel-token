# Pastel token (PASTEL)

This projects creates a platform to buy and sell PASTEL using an Ethereum Smart Contract written in Solidity.

PASTEL is a simple ERC20 token written in Solidity as well.

## Try it out!

The project is developed using Hardhat as the framework for Ethereum development (https://hardhat.org/).

You must have Deno installed to run the client (https://deno.land/#installation).

1. `yarn` (to install all dependencies)
2. In other terminal window/tab `npx hardhat node` to start a JSON-RCP server with a test blockchain
3. Go back to the first terminal
4. `npx hardhat run --network localhost scripts/deploy.ts` (to deploy the token and the vendor smart contract)
5. `cd ./client`
6. Paste the vendor and token contract addresses to a `.env` file in the `client` folder as in `.env.example` (ignore commented fields)
7. Start buying and selling PASTEL:
   ```shell
   deno run --allow-read --allow-env --allow-net exchanger.ts buy 100
   deno run --allow-read --allow-env --allow-net exchanger.ts sell 50
   ```
