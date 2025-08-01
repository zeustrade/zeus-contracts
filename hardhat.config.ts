import "@typechain/hardhat"
import "@nomicfoundation/hardhat-ethers";
import { HardhatUserConfig } from "hardhat/types"
import { task } from "hardhat/config";
import "@nomicfoundation/hardhat-verify";
import { config as dotEnvConfig } from "dotenv";
import "@nomicfoundation/hardhat-chai-matchers"
import "hardhat-gas-reporter"
import "hardhat-storage-layout";
import "hardhat-tracer";
import "hardhat-contract-sizer";
import "solidity-coverage";
import "@openzeppelin/hardhat-upgrades"
// import "@tenderly/hardhat-tenderly"

dotEnvConfig();

const NO_PRIVATE = "0x0000000000000000000000000000000000000000000000000000000000000000";

const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL || "";
const RINKEBY_TESTNET_RPC_URL = process.env.RINKEBY_TESTNET_RPC_URL || "";
const ROPSTEN_TESTNET_RPC_URL = process.env.ROPSTEN_TESTNET_RPC_URL || "";
const GOERLI_TESTNET_RPC_URL = process.env.GOERLI_TESTNET_RPC_URL || "";
const SEPOLIA_TESTNET_RPC_URL = process.env.SEPOLIA_TESTNET_RPC_URL || "";
const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL || "";
const POLYGON_TESTNET_RPC_URL = process.env.POLYGON_TESTNET_RPC_URL || "";
const BSC_RPC_URL = process.env.BSC_RPC_URL || "";
const BSC_TESTNET_RPC_URL = process.env.BSC_TESTNET_RPC_URL || "";
const AVALANCHE_RPC_URL = process.env.AVALANCHE_RPC_URL || "";
const AVALANCHE_TESTNET_RPC_URL = process.env.AVALANCHE_TESTNET_RPC_URL || "";
const GNOSIS_RPC_URL = process.env.GNOSIS_RPC_URL || "";
const GNOSIS_TESTNET_RPC_URL = process.env.GNOSIS_TESTNET_RPC_URL || "";
const OPTIMISM_RPC_URL = process.env.OPTIMISM_RPC_URL || "";
const OPTIMISM_TESTNET_RPC_URL = process.env.AVALANCHE_TESTNET_RPC_URL || "";
const ARBITRUM_RPC_URL = process.env.ARBITRUM_RPC_URL || "";
const ARBITRUM_TESTNET_RPC_URL = process.env.ARBITRUM_TESTNET_RPC_URL || "";
const AURORA_RPC_URL = process.env.AURORA_RPC_URL || "";
const AURORA_TESTNET_RPC_URL = process.env.AURORA_TESTNET_RPC_URL || "";
const FIRECHAIN_RPC_URL = process.env.FIRECHAIN_RPC_URL || "";
const BASE_RPC_URL = process.env.BASE_RPC_URL || "";
const BASE_TESTNET_RPC_URL = process.env.BASE_TESTNET_RPC_URL || "";

const EXPLORER_API_KEY = process.env.EXPLORER_API_KEY || "";

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || NO_PRIVATE;

task(
  "accounts",
  "Prints accounts",
  async (_, { ethers }) => {
    await ethers.getSigners().then((signers) => {
      const accounts = signers.map((elem) => {return elem.address})
      console.log(accounts);
    });
  }
);

const config: HardhatUserConfig = {
  networks: {
    hardhat: {},
    eth: {
      url: ETHEREUM_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY]
    },
    rinkeby: {
      url: RINKEBY_TESTNET_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY]
    },
    ropsten: {
      url: ROPSTEN_TESTNET_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY]
    },
    goerli: {
      url: GOERLI_TESTNET_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY]
    },
    sepolia: {
      url: SEPOLIA_TESTNET_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY]
    },
    polygon: {
      url: POLYGON_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
    polygonTestnet: {
      url: POLYGON_TESTNET_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
      gas: 3000000
    },
    bsc: {
      url: BSC_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY]
    },
    bscTestnet: {
      url: BSC_TESTNET_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY]
    },
    avax: {
      url: AVALANCHE_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY]
    },
    avaxTestnet: {
      url: AVALANCHE_TESTNET_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY]
    },
    gnosis: {
      url: GNOSIS_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY]
    },
    gnosisTestnet: {
      url: GNOSIS_TESTNET_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY]
    },
    optimism: {
      url: OPTIMISM_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY]
    },
    optimismTestnet: {
      url: OPTIMISM_TESTNET_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY]
    },
    arbitrum: {
      url: ARBITRUM_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY]
    },
    arbitrumTestnet: {
      url: ARBITRUM_TESTNET_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY]
    },
    aurora: {
      url: AURORA_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY]
    },
    auroraTestnet: {
      url: AURORA_TESTNET_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY]
    },
    base: {
      url: BASE_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
      chainId: 8453,
    },
    baseTestnet: {
      url: BASE_TESTNET_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
      chainId: 84532,
    },
    firechain: {
      url: FIRECHAIN_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY]
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          },
        },
      },
      {
        version: "0.6.12",
        settings: {
          optimizer: {
          enabled: true,
          runs: 1
        }
      }
    }
  ]},
  etherscan: {
    apiKey: EXPLORER_API_KEY
  },
  typechain: {
    target: 'ethers-v6'
  },
  docgen: {
    outputDir: 'docgen/generated/',
    pages: 'files',
    templates: 'docgen/templates/',
    exclude: ['interface', 'mocks']
  }
};

export default config
