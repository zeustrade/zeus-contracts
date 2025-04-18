import "@typechain/hardhat"
import "@nomiclabs/hardhat-ethers";
import { HardhatUserConfig } from "hardhat/types"
import { task } from "hardhat/config";
import "@nomicfoundation/hardhat-verify";
import { config as dotEnvConfig } from "dotenv";
import "@nomicfoundation/hardhat-chai-matchers"
import "hardhat-gas-reporter"
import "hardhat-storage-layout";
import "hardhat-tracer";
import "hardhat-contract-sizer";
import "solidity-docgen";
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
    aurora:.���`���r��6�<N:�����������gD#7�s�R|����u-�,r,T�2�o���?��f?1?�:��U�����K�K�K�s�t5		]�}�}$i�^�+�f~S���f o c �6e�]���h�my(������؎�Go�o(mPk�ki�e�e`e4��di��W���Pz�b۰mW�w�/�.��m�{�����܎�Q��Wt�}Ez�vE��ޕ�k�*�����~���mE�|����-�+��g��Jk���n5�f�iB��b�wd���ZM{�D�~�{ǳ����ޮ�F��=�0��d�xD���}s��jKy�[�l���t
�;50��Ƥ�42�]!]e�S |���~N�xS.a�f����%��]�<i�U2R)J���@M���Y���Z�ԏ�����Yg���b�Nw��蠱N�4_�vP{(⠣��5�c�3�+6�zi�Y+
���ye"��" :<H�V���dhq��wDY�eR�O�$���`P�C8��A�_ <����s-��L���c׾)f�įW�2�O
�}�v��I!D�$�x�v/����'岜[k��MS�L��&b�z�dӅ�t�_��Ŭ�j��\-F�!�H.r�L�Ak��5��g���=����# ��g(�,�>hy'��r,���� ��&����ܟo��j cG'�H�N���{���o�1�=�ZL�H*`�G�y��eI�D#���g�iyt���mT^y�@�E����H�"8LW@A�p�9�F:����qAZ�=t ��%���T�i�)� �OV��}@ �_|���
���9�41�Z&��S-&*IZ�����{;7h�`�zrv�r\Z���7+�T��K�w�{i��eUQ�f���