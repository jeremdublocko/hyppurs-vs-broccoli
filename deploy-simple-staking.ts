import { ethers } from "ethers"
import * as fs from "fs"
import * as dotenv from "dotenv"

dotenv.config()

// Load contract ABI and bytecode
const simpleStakingABI = JSON.parse(fs.readFileSync("./contracts/abis/SimpleStaking.json", "utf8"))
const simpleStakingBytecode = fs.readFileSync("./contracts/SimpleStaking.bytecode", "utf8").trim()

async function main() {
  // Check if private key is set
  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) {
    throw new Error("Please set your PRIVATE_KEY in a .env file")
  }

  // Check if NFT and HWO addresses are set
  const nftAddress = process.env.NEXT_PUBLIC_NFT_ADDRESS
  const hwoAddress = process.env.NEXT_PUBLIC_HWO_ADDRESS

  if (!nftAddress || !hwoAddress) {
    throw new Error("Please set NEXT_PUBLIC_NFT_ADDRESS and NEXT_PUBLIC_HWO_ADDRESS in your .env file")
  }

  console.log("Deploying SimpleStaking contract...")
  console.log("NFT Address:", nftAddress)
  console.log("HWO Address:", hwoAddress)

  // Connect to the network
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://rpc-amoy.polygon.technology"
  const provider = new ethers.JsonRpcProvider(rpcUrl)

  // Create a wallet
  const wallet = new ethers.Wallet(privateKey, provider)
  console.log("Deploying from address:", wallet.address)

  // Get the current gas price
  const gasPrice = await provider.getFeeData()
  console.log("Current gas price:", ethers.formatUnits(gasPrice.gasPrice || 0, "gwei"), "gwei")

  // Create contract factory
  const factory = new ethers.ContractFactory(simpleStakingABI, simpleStakingBytecode, wallet)

  // Deploy the contract
  console.log("Deploying contract...")
  const contract = await factory.deploy(nftAddress, hwoAddress, {
    gasLimit: 5000000,
    maxFeePerGas: gasPrice.maxFeePerGas,
    maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
  })

  // Wait for deployment to complete
  await contract.waitForDeployment()
  const contractAddress = await contract.getAddress()

  console.log("SimpleStaking contract deployed to:", contractAddress)
  console.log("Set this address as your NEXT_PUBLIC_STAKING_ADDRESS in your .env file")

  // Save the contract address to a file
  fs.writeFileSync(
    "./deployed-contract-address.txt",
    `SimpleStaking Contract Address: ${contractAddress}\nDeployed at: ${new Date().toISOString()}`,
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error)
    process.exit(1)
  })
