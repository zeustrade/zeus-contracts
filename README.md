# Zeus Exchange smart contracts

- Language: Solidity v0.8.20, v0.6.12

- Project framework: hardhat (ethers) + typechain

- Nodejs: v16.20.0

## Deployed

[Arbitrun 0x11111111111e6a0e96332F2bdb9A2b27701998c9](https://arbiscan.io/token/0x11111111111e6a0e96332F2bdb9A2b27701998c9)

## Installation & Usage

1. Install packages
```
yarn
```

2. Build project
```
yarn build
```

### Testing

```
yarn test
```

### Run linter

For .sol files
```
yarn lint:sol
```

For .ts files
```
yarn lint:ts
```

### Run prettier

For .sol files
```
yarn prettier:sol
```

For .ts files
```
yarn prettier:ts
```

### Deploy $ZUS token

1. Check network in ```hardhat.config.ts``` ([docs](https://hardhat.org/config/))

2. Setup environment variables:
```
cp .env.example .env
```

then edit EXPLORER_API_KEY and SIGNER_PRIVATE_KEY

3. Deploy token smart contract:
```
yarn hardhat run scripts/deploy-bcg-token.ts --network <network name>
```

4. Verify in the explorer (optional)
```
yarn hardhat verify <token contract address> --network <network name>
```


## License

[MIT License](./LICENSE)