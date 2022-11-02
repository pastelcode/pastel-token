// This is an example test file. Hardhat will run every *.ts file in `test/`,
// so feel free to add new ones.

// Hardhat tests are normally written with Mocha and Chai.

// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage of Hardhat Network's snapshot functionality.
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
// We import Chai to use its asserting functions here.
import { expect } from 'chai'
import { ethers } from 'hardhat'

// `describe` is a Mocha function that allows you to organize your tests.
// Having your tests organized makes debugging them easier. All Mocha
// functions are available in the global scope.
//
// `describe` receives the name of a section of your test suite, and a
// callback. The callback must define the tests of that section. This callback
// can't be an async function.
describe('PastelToken contract', () => {
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat
  // Network to that snapshot in every test.
  const deployPastelTokenFixture = async () => {
    // Get the ContractFactory and Signers here.
    const PastelToken = await ethers.getContractFactory('PastelToken')
    const [owner, addr1, addr2] = await ethers.getSigners()

    // To deploy our contract, we just have to call PastelToken.deploy() and await
    // its deployed() method, which happens onces its transaction has been
    // mined.
    const pastelToken = await PastelToken.deploy()

    await pastelToken.deployed()

    // Fixtures can return anything you consider useful for your tests
    return { PastelToken, pastelToken, owner, addr1, addr2 }
  }

  // You can nest describe calls to create subsections.
  describe('Deployment', () => {
    // `it` is another Mocha function. This is the one you use to define each
    // of your tests. It receives the test name, and a callback function.
    //
    // If the callback function is async, Mocha will `await` it.
    it('Should set the right owner', async () => {
      // We use loadFixture to setup our environment, and then assert that
      // things went well
      const { pastelToken, owner } = await loadFixture(deployPastelTokenFixture)

      // `expect` receives a value and wraps it in an assertion object. These
      // objects have a lot of utility methods to assert values.

      // This test expects the owner variable stored in the contract to be
      // equal to our Signer's owner.
      expect(await pastelToken.owner()).to.equal(owner.address)
    })

    it('Should assign the total supply of tokens to the owner', async () => {
      const { pastelToken, owner } = await loadFixture(deployPastelTokenFixture)
      const ownerBalance = await pastelToken.balanceOf(owner.address)
      expect(await pastelToken.totalSupply()).to.equal(ownerBalance)
    })
  })

  describe('Transactions', () => {
    it('Should transfer tokens between accounts', async () => {
      const { pastelToken, owner, addr1, addr2 } = await loadFixture(
        deployPastelTokenFixture
      )
      // Transfer 50 PastelTokens from owner to addr1
      await expect(
        pastelToken.transfer(addr1.address, 50)
      ).to.changeTokenBalances(pastelToken, [owner, addr1], [-50, 50])

      // Transfer 50 PastelTokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await expect(
        pastelToken.connect(addr1).transfer(addr2.address, 50)
      ).to.changeTokenBalances(pastelToken, [addr1, addr2], [-50, 50])
    })

    it('should emit Transfer events', async () => {
      const { pastelToken, owner, addr1, addr2 } = await loadFixture(
        deployPastelTokenFixture
      )

      // Transfer 50 PastelTokens from owner to addr1
      await expect(pastelToken.transfer(addr1.address, 50))
        .to.emit(pastelToken, 'Transfer')
        .withArgs(owner.address, addr1.address, 50)

      // Transfer 50 PastelTokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await expect(pastelToken.connect(addr1).transfer(addr2.address, 50))
        .to.emit(pastelToken, 'Transfer')
        .withArgs(addr1.address, addr2.address, 50)
    })

    it("Should fail if sender doesn't have enough tokens", async () => {
      const { pastelToken, owner, addr1 } = await loadFixture(
        deployPastelTokenFixture
      )
      const initialOwnerBalance = await pastelToken.balanceOf(owner.address)

      // Try to send 1 PastelToken from addr1 (0 PastelTokens) to owner (1000 PastelTokens).
      // `require` will evaluate false and revert the transaction.
      await expect(
        pastelToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith('Not enough tokens')

      // Owner balance shouldn't have changed.
      expect(await pastelToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      )
    })
  })
})
