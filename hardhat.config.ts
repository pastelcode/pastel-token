import '@nomicfoundation/hardhat-toolbox'
import dotenv from 'dotenv'
import { HardhatUserConfig } from 'hardhat/config'

dotenv.config()

const { PROJECT_URL, PRIVATE_KEY } = process.env

const config: HardhatUserConfig = {
  solidity: '0.8.17',
  networks: {
    goerli: {
      url: PROJECT_URL,
      accounts: [PRIVATE_KEY!],
    },
  },
}

export default config
