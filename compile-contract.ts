import * as fs from "fs"
import * as path from "path"
import solc from "solc"

function findImports(importPath: string) {
  // Handle OpenZeppelin imports
  if (importPath.startsWith("@openzeppelin/")) {
    const npmPath = path.resolve("./node_modules", importPath)
    try {
      return { contents: fs.readFileSync(npmPath, "utf8") }
    } catch (e) {
      console.error(`Error reading import file ${npmPath}:`, e)
      return { error: `File not found: ${importPath}` }
    }
  }

  // Handle local imports
  try {
    const localPath = path.resolve("./contracts", importPath)
    return { contents: fs.readFileSync(localPath, "utf8") }
  } catch (e) {
    return { error: `File not found: ${importPath}` }
  }
}

async function main() {
  // Read the contract source
  const contractPath = "./contracts/SimpleStaking.sol"
  const source = fs.readFileSync(contractPath, "utf8")

  // Prepare compiler input
  const input = {
    language: "Solidity",
    sources: {
      "SimpleStaking.sol": {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode"],
        },
      },
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  }

  console.log("Compiling contract...")

  // Compile the contract
  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }))

  // Check for errors
  if (output.errors) {
    output.errors.forEach((error: any) => {
      console.error(error.formattedMessage)
    })

    // Only exit if there are severe errors
    if (output.errors.some((error: any) => error.severity === "error")) {
      throw new Error("Compilation failed")
    }
  }

  // Extract ABI and bytecode
  const contractOutput = output.contracts["SimpleStaking.sol"]["SimpleStaking"]
  const abi = contractOutput.abi
  const bytecode = "0x" + contractOutput.evm.bytecode.object

  // Save ABI and bytecode to files
  fs.writeFileSync("./contracts/SimpleStaking.bytecode", bytecode)
  console.log("Bytecode saved to ./contracts/SimpleStaking.bytecode")

  // Also update the ABI file
  fs.writeFileSync("./contracts/abis/SimpleStaking.json", JSON.stringify(abi, null, 2))
  console.log("ABI saved to ./contracts/abis/SimpleStaking.json")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Compilation failed:", error)
    process.exit(1)
  })
