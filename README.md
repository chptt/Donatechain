# Donation Platform - Blockchain-Powered Fundraising

A decentralized donation platform built with Next.js 14 and Solidity, featuring NFT-based campaigns with Chainlink price feeds for USD-stabilized donations.

## Features

- **NFT Campaigns**: Each fundraising campaign is represented as an ERC721 NFT
- **USD-Stabilized Donations**: Fixed $10 donations automatically converted to ETH using Chainlink price feeds
- **Multiple Campaign Types**: Housing, Meals, Medical, Education, Equipment, River Cleaning
- **Real-time Price Updates**: ETH/USD conversion updates every 30 seconds
- **Transparent Tracking**: All donations and withdrawals are recorded on-chain
- **Responsive Design**: Beautiful UI with Tailwind CSS and Framer Motion animations
- **MetaMask Integration**: Seamless wallet connection with ethers.js v6

## Tech Stack

### Frontend
- **Next.js 14** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **ethers.js v6** for blockchain interaction
- **Lucide React** for icons

### Smart Contract
- **Solidity ^0.8.20**
- **OpenZeppelin** contracts (ERC721, ReentrancyGuard, Ownable)
- **Chainlink Price Feeds** for ETH/USD conversion
- **Sepolia Testnet** deployment

## Project Structure

```
donation-platform/
├── app/                          # Next.js App Router pages
│   ├── campaign/[id]/           # Individual campaign pages
│   ├── contributions/           # User donation history
│   ├── create/                  # Campaign creation form
│   ├── dashboard/               # Creator dashboard
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/                   # Reusable React components
│   ├── CampaignCard.tsx         # Campaign display card
│   └── Navbar.tsx               # Navigation component
├── contexts/                     # React contexts
│   └── WalletContext.tsx        # Wallet connection state
├── contracts/                    # Solidity smart contracts
│   └── DonationPlatform.sol     # Main contract
├── public/                       # Static assets
└── package.json                 # Dependencies and scripts
```

## Smart Contract Functions

### Core Functions
- `mintMyNFT()` - Create a new fundraising campaign
- `donate()` - Donate $10 worth of ETH to a campaign
- `withdraw()` - Withdraw raised funds (campaign creator only)
- `getCampaignsByCreator()` - Get all campaigns by a specific creator
- `viewRequiredETH()` - Get current ETH amount for $10 donation
- `getLatestPrice()` - Get current ETH/USD price from Chainlink

### Campaign Data Structure
```solidity
struct Campaign {
    uint256 tokenId;
    CharityType charityType;
    uint256 goalAmount;        // in USD (18 decimals)
    uint256 totalDonations;    // in ETH (18 decimals)
    address creator;
    string influencerName;
    string profileImageURL;
    bool active;
    uint256 createdAt;
}
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm/yarn
- MetaMask browser extension
- Sepolia testnet ETH for deployment and testing

### 1. Clone and Install
```bash
git clone <repository-url>
cd donation-platform
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
NEXT_PUBLIC_SEPOLIA_CHAIN_ID=11155111
```

### 3. Smart Contract Deployment

#### Using Remix IDE (Recommended)
1. Open [Remix IDE](https://remix.ethereum.org/)
2. Create new file: `DonationPlatform.sol`
3. Copy contract code from `contracts/DonationPlatform.sol`
4. Compile with Solidity ^0.8.20
5. Deploy to Sepolia testnet:
   - Environment: "Injected Provider - MetaMask"
   - Network: Sepolia
   - Deploy contract
6. Copy deployed contract address to `.env.local`

#### Contract Verification (Optional)
1. Go to [Sepolia Etherscan](https://sepolia.etherscan.io/)
2. Find your contract and click "Verify and Publish"
3. Upload source code and verify

### 4. Frontend Development
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Production Deployment

#### Deploy to Vercel
```bash
npm run build
# Deploy to Vercel or your preferred platform
```

Set environment variables in your deployment platform:
- `NEXT_PUBLIC_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_SEPOLIA_CHAIN_ID`

## Usage Guide

### For Campaign Creators
1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask connection
2. **Create Campaign**: 
   - Go to "Create Campaign"
   - Select charity type
   - Set goal amount in USD
   - Add campaign name and image
   - Submit transaction
3. **Manage Campaigns**: 
   - View dashboard for campaign statistics
   - Withdraw funds when ready
   - Track donation progress

### For Donors
1. **Connect Wallet**: Connect MetaMask to Sepolia testnet
2. **Browse Campaigns**: View active campaigns on home page
3. **Donate**: 
   - Click on campaign to view details
   - Click "Donate $10" button
   - Confirm transaction in MetaMask
4. **Track Contributions**: View donation history in "My Contributions"

## Key Features Explained

### USD-Stabilized Donations
- All donations are fixed at $10 USD
- Chainlink price feed converts USD to current ETH amount
- Price updates every 30 seconds for accuracy
- Protects against ETH price volatility

### NFT Campaign System
- Each campaign is an ERC721 NFT owned by creator
- Allows multiple campaigns per wallet (uses `_mint` not `_safeMint`)
- NFT ownership enables withdrawal permissions
- Transparent on-chain campaign data

### Security Features
- ReentrancyGuard prevents reentrancy attacks
- Ownable contract for admin functions
- Input validation and error handling
- Safe withdrawal patterns

## Chainlink Integration

The contract uses Chainlink's ETH/USD price feed on Sepolia:
- **Address**: `0x694AA1769357215DE4FAC081bf1f309aDC325306`
- **Decimals**: 8
- **Update Frequency**: ~1 minute
- **Deviation Threshold**: 0.5%

## Testing

### Local Testing
```bash
npm run dev
```

### Contract Testing
1. Deploy to Sepolia testnet
2. Test all functions through frontend
3. Verify transactions on Sepolia Etherscan

### Test Scenarios
- Create campaigns with different charity types
- Make donations and verify ETH conversion
- Withdraw funds and check balances
- Test wallet connection/disconnection
- Verify price feed updates

## Troubleshooting

### Common Issues

**MetaMask Connection Issues**
- Ensure MetaMask is installed and unlocked
- Switch to Sepolia testnet
- Check if site is connected in MetaMask

**Transaction Failures**
- Ensure sufficient Sepolia ETH for gas
- Check contract address in environment variables
- Verify network is Sepolia (Chain ID: 11155111)

**Price Feed Issues**
- Chainlink price feeds may have delays
- Check Sepolia network status
- Verify price feed contract address

**Build Errors**
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run build`

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check existing issues for solutions
- Review documentation and code comments

## Roadmap

- [ ] Multi-token support (USDC, DAI)
- [ ] Campaign categories and filtering
- [ ] Social sharing features
- [ ] Mobile app development
- [ ] Mainnet deployment
- [ ] Advanced analytics dashboard