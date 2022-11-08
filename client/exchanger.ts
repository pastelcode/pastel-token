import tokenABI from '../artifacts/contracts/PastelToken.sol/PastelToken.json' assert { type: 'json' }
import vendorABI from '../artifacts/contracts/PastelTokenVendor.sol/Vendor.json' assert { type: 'json' }
import { AbiItem, cmd, Web3 } from './deps.ts'

console.log('Initializing...')

const providerUrl =
  Deno.env.get('ALCHEMY_PROJECT_URL') || 'http://127.0.0.1:8545/'
const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl!))

const vendorContractAddress = Deno.env.get('VENDOR_CONTRACT_ADDRESS')

const tokenContractAddress = Deno.env.get('TOKEN_CONTRACT_ADDRESS')

const vendorContract = new web3.eth.Contract(
  vendorABI.abi as AbiItem[],
  vendorContractAddress
)

const tokenContract = new web3.eth.Contract(
  tokenABI.abi as AbiItem[],
  tokenContractAddress
)

const tokensPerEther = 100

const accounts = await web3.eth.getAccounts()

console.log('Done!')

const buy = async (amountToBuy: string) => {
  const amountToBuyInPastel = Number(amountToBuy)
  if (isNaN(amountToBuyInPastel)) {
    console.error('ERROR: The PASTEL quantity must be a number')
    return
  }

  const amountToBuyInEther = amountToBuyInPastel / tokensPerEther
  console.log(`${amountToBuyInPastel} PASTEL = ${amountToBuyInEther} ETHER`)

  try {
    const amountToBuyInWei = web3.utils.toWei(`${amountToBuyInEther}`, 'ether')

    // Trigger the buying of tokens
    await vendorContract.methods.buyTokens().send({
      from: accounts[1],
      value: amountToBuyInWei,
    })

    console.log(`You have successfully bought ${amountToBuyInPastel} PASTEL`)
  } catch (exception) {
    console.error(`Error buying PASTEL: ${exception}`)
  }
}

const sell = async (pastelString: string) => {
  const pastel = Number(pastelString)
  if (isNaN(pastel)) {
    console.error('ERROR: The PASTEL quantity must be a number')
    return
  }

  try {
    const amountToSellInWei = web3.utils.toWei(`${pastel}`, 'ether')

    // Approve the vendor address as spender
    // and how many of your tokens it is allowed to spend
    await tokenContract.methods
      .approve(vendorContractAddress, amountToSellInWei)
      .send({ from: accounts[1] })

    // Trigger the selling of tokens
    await vendorContract.methods
      .sellTokens(amountToSellInWei)
      .send({ from: accounts[1] })

    console.log(`You have successfully sold ${pastel} PASTEL`)
  } catch (exception) {
    console.error(`Error buying PASTEL: ${exception}`)
  }
}

const program = new cmd.Command('exchanger')
program.version('0.1.0')

program
  .command('buy <pastel>')
  .description('buy PASTEL', { pastel: 'the quantity of PASTEL to buy' })
  .action(buy)
program
  .command('sell <pastel>')
  .description('sell PASTEL', { pastel: 'the quantity of PASTEL to sell' })
  .action(sell)

program.parse(Deno.args)
