import { ethers } from 'hardhat'

const main = async () => {
  const [deployer] = await ethers.getSigners()
  console.log(`Deploying contracts with the account: ${deployer.address}`)

  const PastelToken = await ethers.getContractFactory('PastelToken')
  const pastelToken = await PastelToken.deploy(1000)
  const Vendor = await ethers.getContractFactory('Vendor')
  const vendor = await Vendor.deploy(pastelToken.address)
  console.log(`Token address: ${pastelToken.address}`)
  console.log(`Vendor contract address: ${vendor.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
