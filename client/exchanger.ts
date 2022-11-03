import tokenABI from '../artifacts/contracts/PastelToken.sol/PastelToken.json' assert { type: 'json' }
import vendorABI from '../artifacts/contracts/PastelTokenVendor.sol/Vendor.json' assert { type: 'json' }
import { AbiItem, cmd, conversion, Web3 } from './deps.ts'

const program = new cmd.Command('exchanger')
program.version('0.1.0')

conversion.writeAll(
  Deno.stdout,
  new TextEncoder().encode('Initializing provider... ')
)
const providerUrl =
  Deno.env.get('ALCHEMY_PROJECT_URL') || 'http://127.0.0.1:8545/'
const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl!))
console.log('Done!\n')

const buy = async (pastelString: string) => {
  const pastel = Number(pastelString)
  if (isNaN(pastel)) {
    console.error('ERROR: The PASTEL quantity must be a number')
    return
  }
  const ether = pastel / 100
  console.log(`${pastel} PASTEL = ${ether} ETHER`)

  try {
    const accounts = await web3.eth.getAccounts()
    const vendor = new web3.eth.Contract(
      vendorABI.abi as AbiItem[],
      Deno.env.get('VENDOR_CONTRACT_ADDRESS')
    )

    const request = await vendor.methods.buyTokens().send({
      from: accounts[0],
      value: web3.utils.toWei(`${ether}`, 'ether'),
    })
    console.log('You have successfully bought PASTEL tokens')
    console.log(`Request:`)
    console.log(request)
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
    const accounts = await web3.eth.getAccounts()
    const tokenContract = new web3.eth.Contract(
      tokenABI.abi as AbiItem[],
      Deno.env.get('TOKEN_CONTRACT_ADDRESS')
    )
    // Approve the contract to spend the tokens
    let request = await tokenContract.methods
      .approve(
        Deno.env.get('VENDOR_CONTRACT_ADDRESS'),
        web3.utils.toWei(`${pastel}`, 'ether')
      )
      .send({ from: accounts[0] })
    // Trigger the selling of tokens
    const vendor = new web3.eth.Contract(
      vendorABI.abi as AbiItem[],
      Deno.env.get('VENDOR_CONTRACT_ADDRESS')
    )
    request = await vendor.methods
      .sellTokens(web3.utils.toWei(`${pastel}`, 'ether'))
      .send({ from: accounts[0] })
    console.log('You have successfully sold PASTEL tokens')
    console.log(`Request:`)
    console.log(request)
  } catch (exception) {
    console.error(`Error buying PASTEL: ${exception}`)
  }
}

program
  .command('buy <pastel>')
  .description('buy PASTEL', { pastel: 'the quantity of PASTEL to buy' })
  .action(buy)
program
  .command('sell <pastel>')
  .description('sell PASTEL', { pastel: 'the quantity of PASTEL to sell' })
  .action(sell)

program.parse(Deno.args)
