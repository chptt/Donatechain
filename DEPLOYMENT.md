# Deployment Guide

This guide covers deploying the Donation Platform smart contract and frontend application.

## Smart Contract Deployment

### Prerequisites
- MetaMask with Sepolia testnet configured
- Sepolia ETH for deployment (get from [Sepolia Faucet](https://sepoliafaucet.com/))
- Access to [Remix IDE](https://remix.ethereum.org/)

### Step 1: Prepare Contract for Deployment

1. Open Remix IDE in your browser
2. Create a new file called `DonationPlatform.sol`
3. Copy the entire contract code from `contracts/DonationPlatform.sol`
4. Paste it into the Remix editor

### Step 2: Compile Contract

1. Go to the "Solidity Compiler" tab (second icon in sidebar)
2. Select compiler version: `0.8.20` or higher
3. Click "Compile DonationPlatform.sol"
4. Ensure compilation succeeds without errors

### Step 3: Deploy to Sepolia

1. Go to "Deploy & Run Transactions" tab (third icon)
2. Set Environment to "Injected Provider - MetaMask"
3. Ensure MetaMask is connected to Sepolia testnet
4. Select "DonationPlatform" from the contract dropdown
5. Click "Deploy"
6. Confirm transaction in MetaMask
7. Wait for deployment confirmation
8. **Copy the deployed contract address** - you'll need this for the frontend

### Step 4: Verify Contract (Optional but Recommended)

1. Go to [Sepolia Etherscan](https://sepolia.etherscan.io/)
2. Search for your contract address
3. Click "Contract" tab, then "Verify and Publish"
4. Select:
   - Compiler Type: Solidity (Single file)
   - Compiler Version: v0.8.20+commit.a1b79de6
   - License: MIT
5. Paste your contract source code
6. Click "Verify and Publish"

## Frontend Deployment

### Step 1: Environment Configuration

Create `.env.local` file in project root:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0x... # Your deployed contract address
NEXT_PUBLIC_SEPOLIA_CHAIN_ID=11155111
```

### Step 2: Build and Test Locally

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Test the build locally
npm start
```

### Step 3: Deploy to Vercel (Recommended)

#### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set environment variables when prompted
```

#### Option B: Deploy via GitHub Integration

1. Push your code to GitHub repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables:
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`: Your contract address
   - `NEXT_PUBLIC_SEPOLIA_CHAIN_ID`: `11155111`
6. Click "Deploy"

### Step 4: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Configure DNS records as instructed

## Alternative Deployment Platforms

### Netlify

1. Build the application: `npm run build`
2. Upload `out` folder to Netlify
3. Set environment variables in Netlify dashboard

### AWS Amplify

1. Connect GitHub repository
2. Configure build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
   ```
3. Set environment variables in Amplify console

## Post-Deployment Checklist

### Smart Contract Verification

- [ ] Contract deployed successfully
- [ ] Contract verified on Etherscan
- [ ] All functions working in Remix
- [ ] Price feed returning valid data
- [ ] Test mint, donate, and withdraw functions

### Frontend Verification

- [ ] Application loads without errors
- [ ] Wallet connection works
- [ ] Contract interaction functions properly
- [ ] All pages render correctly
- [ ] Responsive design works on mobile
- [ ] Environment variables configured correctly

### End-to-End Testing

1. **Connect Wallet**
   - Connect MetaMask to Sepolia
   - Verify wallet address displays correctly

2. **Create Campaign**
   - Fill out campaign creation form
   - Submit transaction and wait for confirmation
   - Verify campaign appears in dashboard

3. **Make Donation**
   - Navigate to campaign page
   - Click donate button
   - Confirm transaction
   - Verify donation amount updates

4. **Withdraw Funds**
   - Go to dashboard as campaign creator
   - Click withdraw button
   - Confirm transaction
   - Verify ETH received in wallet

## Monitoring and Maintenance

### Contract Monitoring

- Monitor contract on [Sepolia Etherscan](https://sepolia.etherscan.io/)
- Set up alerts for large transactions
- Track gas usage and optimization opportunities

### Frontend Monitoring

- Set up error tracking (Sentry, LogRocket)
- Monitor performance metrics
- Track user interactions and conversions

### Regular Updates

- Keep dependencies updated
- Monitor Chainlink price feed status
- Update contract address if redeploying
- Backup important data and configurations

## Troubleshooting Common Issues

### Contract Deployment Fails

**Issue**: Transaction reverts during deployment
**Solution**: 
- Ensure sufficient Sepolia ETH for gas
- Check compiler version matches
- Verify all imports are accessible

### Frontend Can't Connect to Contract

**Issue**: "Contract not found" or connection errors
**Solution**:
- Verify contract address in environment variables
- Ensure MetaMask is on Sepolia network
- Check if contract is verified and accessible

### Price Feed Returns Zero

**Issue**: ETH price shows as $0
**Solution**:
- Verify Chainlink price feed address
- Check Sepolia network connectivity
- Ensure price feed contract is active

### Transactions Fail

**Issue**: MetaMask transactions fail or revert
**Solution**:
- Increase gas limit
- Check contract function parameters
- Verify wallet has sufficient ETH
- Ensure contract is not paused

## Security Considerations

### Smart Contract Security

- Contract uses OpenZeppelin audited libraries
- ReentrancyGuard prevents reentrancy attacks
- Access controls limit sensitive functions
- Input validation prevents invalid data

### Frontend Security

- Environment variables properly configured
- No private keys in client-side code
- HTTPS enforced in production
- Content Security Policy headers set

### Operational Security

- Keep deployment keys secure
- Use hardware wallets for mainnet
- Regular security audits
- Monitor for unusual activity

## Mainnet Deployment Considerations

When ready for mainnet deployment:

1. **Audit Contract**: Get professional security audit
2. **Update Price Feed**: Use mainnet Chainlink address
3. **Gas Optimization**: Optimize for mainnet gas costs
4. **Insurance**: Consider smart contract insurance
5. **Gradual Rollout**: Start with limited functionality
6. **Emergency Procedures**: Plan for emergency stops/upgrades

## Support and Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [OpenZeppelin Documentation](https://docs.openzeppelin.com/)
- [Chainlink Documentation](https://docs.chain.link/)
- [Vercel Documentation](https://vercel.com/docs)

For deployment issues, check:
1. GitHub Issues in this repository
2. Stack Overflow with relevant tags
3. Discord/Telegram community channels
4. Official documentation for each technology