'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ethers } from 'ethers'

interface WalletContextType {
  account: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  contract: ethers.Contract | null
  isConnected: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  ethPrice: number
  requiredETH: string
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ''
const SEPOLIA_CHAIN_ID = process.env.NEXT_PUBLIC_SEPOLIA_CHAIN_ID || '11155111'

const CONTRACT_ABI = [
  "function mintMyNFT(uint8 _charityType, uint256 _goalAmount, string memory _influencerName, string memory _profileImageURL) public returns (uint256)",
  "function donate(uint256 _tokenId) public payable",
  "function withdraw(uint256 _tokenId) public",
  "function getCampaignsByCreator(address _creator) public view returns (uint256[] memory)",
  "function viewRequiredETH() public view returns (uint256)",
  "function getLatestPrice() public view returns (int256)",
  "function getAllCampaigns() public view returns (tuple(uint256 tokenId, uint8 charityType, uint256 goalAmount, uint256 totalDonations, address creator, string influencerName, string profileImageURL, bool active, uint256 createdAt)[] memory)",
  "function getUserContributions(address _user) public view returns (uint256[] memory)",
  "function getUserDonationAmount(address _user, uint256 _tokenId) public view returns (uint256)",
  "function campaigns(uint256) public view returns (uint256 tokenId, uint8 charityType, uint256 goalAmount, uint256 totalDonations, address creator, string influencerName, string profileImageURL, bool active, uint256 createdAt)",
  "event CampaignCreated(uint256 indexed tokenId, address indexed creator, uint8 charityType, uint256 goalAmount)",
  "event DonationMade(uint256 indexed tokenId, address indexed donor, uint256 amount)",
  "event Withdrawal(uint256 indexed tokenId, address indexed creator, uint256 amount)"
]

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [ethPrice, setEthPrice] = useState<number>(0)
  const [requiredETH, setRequiredETH] = useState<string>('0')

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const account = await signer.getAddress()
        
        // Switch to Sepolia if not already
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${parseInt(SEPOLIA_CHAIN_ID).toString(16)}` }],
          })
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${parseInt(SEPOLIA_CHAIN_ID).toString(16)}`,
                chainName: 'Sepolia Test Network',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                blockExplorerUrls: ['https://sepolia.etherscan.io/']
              }]
            })
          }
        }
        
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
        
        setProvider(provider)
        setSigner(signer)
        setAccount(account)
        setContract(contract)
        
        localStorage.setItem('walletConnected', 'true')
      } catch (error) {
        console.error('Error connecting wallet:', error)
      }
    } else {
      alert('Please install MetaMask!')
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setProvider(null)
    setSigner(null)
    setContract(null)
    localStorage.removeItem('walletConnected')
  }

  const fetchETHPrice = async () => {
    if (contract) {
      try {
        const price = await contract.getLatestPrice()
        const priceInUSD = Number(price) / 100000000 // Convert from 8 decimals
        console.log('ETH Price from Chainlink:', priceInUSD)
        setEthPrice(priceInUSD)
        
        // Set fixed ETH amount for $1 donation
        setRequiredETH("0.0003")
      } catch (error) {
        console.error('Error fetching ETH price, using fallbacks:', error)
        // Use fallback values
        setEthPrice(3000) // Approximate ETH price
        setRequiredETH("0.0003") // Fixed $1 worth of ETH
      }
    }
  }

  useEffect(() => {
    if (localStorage.getItem('walletConnected') === 'true') {
      connectWallet()
    }
  }, [])

  useEffect(() => {
    if (contract) {
      fetchETHPrice()
      const interval = setInterval(fetchETHPrice, 30000) // Update every 30 seconds
      return () => clearInterval(interval)
    }
  }, [contract])

  const value = {
    account,
    provider,
    signer,
    contract,
    isConnected: !!account,
    connectWallet,
    disconnectWallet,
    ethPrice,
    requiredETH
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}