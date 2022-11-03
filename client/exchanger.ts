import json from '../artifacts/contracts/PastelTokenVendor.sol/Vendor.json' assert { type: 'json' }
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
      json.abi as AbiItem[],
      Deno.env.get('VENDOR_CONTRACT_ADDRESS')
    )

    const request = await vendor.methods.buyTokens().send({
      from: accounts[0],
      value: web3.utils.toWei(`${ether}`, 'ether'),
    })
    console.log('You have successfully purchased PASTEL tokens')
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

program.parse(Deno.args)
