# $ZUS token smart contract

- Language: Solidity v0.8.20

- Project framework: hardhat (ethers) + typechain

- Nodejs: v16.20.0

## Deployed

coming soon

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

### Deploy token

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