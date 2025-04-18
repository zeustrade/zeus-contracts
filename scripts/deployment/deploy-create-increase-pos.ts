import hre from "hardhat";
import { ethers, upgrades } from "hardhat";
import { Contract } from "ethers";

import { tryVerify } from "../helper/tryVerify";

// types
import { Vault } from "../../typechain-types/core/Vault";
import { VaultErrorController } from "../../typechain-types/core/VaultErrorController";
import { VaultUtils } from "../../typechain-types/core/VaultUtils";
import { VaultReader } from "../../typechain-types/peripherals/VaultReader";
import { Router } from "../../typechain-types/core/Router";
import { OrderBook } from "../../typechain-types/core/OrderBook";
import { ShortsTracker } from "../../typechain-types/core/ShortsTracker";
import { ReferralStorage } from "../../typechain-types/referrals/ReferralStorage";
import { ReferralReader } from "../../typechain-types/referrals/ReferralReader";
import { PositionUtils } from "../../typechain-types/core/PositionUtils";
import { PositionRouter } from "../../typechain-types/core/PositionRouter";
import { PositionManager } from "../../typechain-types/core/PositionManager";
import { TokenManager } from "../../typechain-types/access/TokenManager";
import { VaultPriceFeed } from "../../typechain-types/core/VaultPriceFeed";
import { FastPriceEvents } from "../../typechain-types/oracle/FastPriceEvents";
import { FastPriceFeed } from "../../typechain-types/oracle/FastPriceFeed";
import { Reader } from "../../typechain-types/peripherals/Reader";
import { Timelock } from "../../typechain-types/peripherals/Timelock";

// 0x0Bab83B8FCf004ab7181186a9eA216C86AbC4Daf
// hre.run("verify:verify", {
//   // other args
//   libraries: {
//     SomeLibrary: "0x...",
//   }
// }

// await hre.run("verify:verify", {
//   address: contractAddress,
//   constructorArguments: [
//     50,
//     "a string argument",
//     {
//       x: 10,
//       y: 5,
//     },
//     "0xabcdef",
//   ],
// });

async function main() {

  // setup signer
  const signer = (await hre.ethers.getSigners())[0];

  // need timelock

  const WETH_ADDRESS = "0xbEFAF4b622Ad81D8e74be1d73cd76768B53A8eE5";
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  const WTBC_TEST_ADDRESS = "0xca1736Ff8CDD85f5688d4D6f386e9518C2944572";  // decimals = 8
  const WETH_TEST_ADDRESS = "0xbEFAF4b622Ad81D8e74be1d73cd76768B53A8eE5";  // decimals = 18
  const ARB_TEST_ADDRESS = "0xdc85f962558671366d0e18178fabe78293a41a52";   // decimals = 18
  const USDT_TEST_ADDRESS = "0x5ca6ee80817a663dA3DE8B417b1588E43E2754CB";  // decimals = 6
  const USDC_TEST_ADDRESS = "0x345BDEd86D238e8A0619e2042C89Be702bFe4891";  // decimals = 6

  const WTBC_FEED_ADDRESS = "0x6550bc2301936011c1334555e62A87705A81C12C";  // decimals = 8
  const WETH_FEED_ADDRESS = "0x62CAe0FA2da220f43a51F86Db2EDb36DcA9A5A08";  // decimals = 18
  const ARB_FEED_ADDRESS = "0x2eE9BFB2D319B31A573EA15774B755715988E99D";   // decimals = 18
  const USDT_FEED_ADDRESS = "0x0a023a3423D9b27A0BE48c768CCF2dD7877fEf5E";  // decimals = 6
  const USDC_FEED_ADDRESS = "0x1692Bdd32F31b831caAc1b0c9fAF68613682813b";  // decimals = 6

  const POSITION_ROUTER_ADDRESS = "0xAbaED596f1B563dE7449EBB0562C51E9f130547A";
  const POSITION_ROUTER_UTILS_ADDRESS = "0x57E5598c1Dac95eA731E7eD719c6465C929f006B";
  const FAST_PRICE_FEED_ADDRESS = "0xae06Bde2AD9ee43E0FbC3635132EcDbCA6507f6a";
  const VAULT_PRICE_FEED_ADDRESS = "0xDfD5eC78090d9f8DBf13120c23c7961fBbd6AE91";

  const PositionRouterFactory = await ethers.getContractFactory("PositionRouter", {libraries: {PositionUtils: POSITION_ROUTER_UTILS_ADDRESS}});
  const positionRouter = await PositionRouterFactory.attach(POSITION_ROUTER_ADDRESS) as PositionRouter;
  const FastPriceFeedFactory = await ethers.getContractFactory("FastPriceFeed");
  const fastPriceFeed = await FastPriceFeedFactory.attach(FAST_PRICE_FEED_ADDRESS) as FastPriceFeed;
  const VaultPriceFeedFactory = await ethers.getContractFactory("VaultPriceFeed");
  const vaultPriceFeed = await VaultPriceFeedFactory.attach(VAULT_PRICE_FEED_ADDRESS) as VaultPriceFeed;
  
  // console.log(positionRouter);
  // console.log(await positionRouter.admin());
  console.log(await posiR�6�
�
ߧ�.�`�T��e�<]7Ө�f��B4��4|�Ҥ��{��䦞��'aG�h��<��N���^˘h���6�S�-
����W1��ۙyQ�iכRp�C;���uE۴o椗��N΂)k:��޸ב� 흘@���A�_��二�7MHAw��{�_���ބ���"����}79���))e�����N�w����2�Dn�E;�ݕ���� h��H9%�/��I��Yg�d�����V��r)b~Y[���VsD䏥,1�,��a��K<�ߚp�טJ�ş7Ew�
��<AkY��Y՘p��4h���i@hF����c(��[y��8^�`���fN���R.��)ô.E����n�dH�ӣ���7sSj�Ү9��Hz�am�s�N�{A�jKG��z�\g��C��`p`���r��J�=�h,rc����*����#f�c'��DI �� W�?EO�|>�B�67kP�b�g�t�ie� ���b�z>t�,�8��O8:���(�?��3Q0�bF���d��V\�IԸ �>0�ۥ���~�;���Ik�x#j�!h�����Ɯ<Vc�������go$��,j��Z�����/}����H����t���*�4��x�Q��W����c[�f�{�����u�X���pY��T��vb�0��p4��4_v��(��t�^��ӊ&�1x"gu+��L����ȃ{X:��F������oX	��K�Qj4bȴ�e)|�S��Z!���O�C�(�Y�� �ߴ��G�� �=`�d3���,��8���a�p}m�n��67�)0w�4{�#�O��SQ1�>O≘bu�A��|i�G/הww��|�%�8EU)��Q��h��ĥͦcX
��|ܲ���`J%�(�R'yR^��eH�� ���i������+���vf�8�T�8<�֥᳠�S��[���| ���Ã����K6�?CqX�:����w�R��S�N�V�ZsJ�=�5~�!��,�%t�p�A�ۼb�)��C�������-4@�HW�i���x�/��誑3�y�U��֖�E�d6�p��i�cu�ڡ��H)�g|�\����R�s���uNv�]A���`��Ɂ��&��5�\ �K�l��6�sjd !���2�����7߽8��-��m��G��d���w�ZaLH��
�d�+��O�揄�o�+���6�*�a�q͟��;���fY[(��t�̓�3��eꨨ�Ywȯ���ż�"O���P ��4 ��%��Ys˵��	r�T������kx<R��ӊ�LU����Z��.�ݞ��'�ۍ)&� ��I۠��Ý �즻+a)�Fi8jcy����G���w��$��k�+�Ub�e� ���+YR [���!�Y�1pF��m7�ƺ+������^�����MP�\����󠔸Om�Q������ćk4��J�[�,��}�P�h��B^8���+��z�:&��H#�q�c�͉��u��!��(3Հ��bG�僨�M�ڳ�G-�`���i�wO��L�L[MK�����^fw�o�l�L}7@n٪7��-���4Q�ie���j�1S�ۻ�R��:��pSs.]=�u�$+�����T��_�*�O����џUf�{�"d���'7-;��]q9�i����F�1fPip;�d��MM)�}�kWx�����t�'���Yx�����~�T�=���K=��ĊU���<z/D��o�5E���d���{��qx�Tۄ�4F�
��8{��ڥ�(8��"����?"��x���ђH�b�H�Ԇ�Δ.gM���v����%7��{�WK�/���E�5��������4�0PS:](���}K"ĭ���MO�TY��3�Ձx9�|��`�E���4��b�Ow��i/�@�p}r��Pg���q�:Og�M�A��U����H]�6�#.o�C��F����0�56�ei���֝$��֭?��h�g��x�$膊Yf۲�|�ՐI �	���G$�A����E*�d��!�[��R�w���7���0��"����jq���e6��ŀpux��C�Q�����DF����Wz2�FU,	�!��Ӈ~p`0.��y����E8�W��[�g�( ��"�i#�/6@-�+��˔v�����PZ-н�$�1�������e���� ���&)�9�G���h�is���|�Z欠� r�#�af
e�G��^ ʚW1<��� th��'mP�S�0J�|ih���;=V��.7���E'{�%�UoЃ�ܮb�����%�V��O��/|*mBT1�2j���[o{�K�����c�[fq*i�Omũ�W�0�TK�0'��,�y�������*�k�z!
�p�����F���(T�����w ��r~E	1X���s��A�R��-�