import { ethers } from 'hardhat'

const main = async () => {
  const [deployer] = await ethers.getSigners()
  console.log(`Deploying contracts with the account: ${deployer.address}`)

  const Vendor = await ethers.getContractFactory('Vendor')
  const vendor = await Vendor.deploy()
  console.log(`Vendor contract address: ${vendor.address}`)
  console.log(`Token contract address: ${await vendor.token()}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
