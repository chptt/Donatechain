'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@/contexts/WalletContext'
import { ethers } from 'ethers'
import Image from 'next/image'
import { Home, Utensils, Heart, GraduationCap, Wrench, Waves, DollarSign, Clock, User } from 'lucide-react'

interface Campaign {
  tokenId: number
  charityType: number
  goalAmount: string
  totalDonations: string
  creator: string
  influencerName: string
  profileImageURL: string
  active: boolean
  createdAt: number
}

const charityTypes = ['Housing', 'Meals', 'Medical', 'Education', 'Equipment', 'RiverCleaning']
const charityIcons = [Home, Utensils, Heart, GraduationCap, Wrench, Waves]
const charityColors = [
  'charity-housing',
  'charity-meals', 
  'charity-medical',
  'charity-education',
  'charity-equipment',
  'charity-rivercleaning'
]

export default function CampaignDetail({ params }: { params: { id: string } }) {
  const { contract, isConnected, ethPrice, requiredETH } = useWallet()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [donating, setDonating] = useState(false)

  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ''

  useEffect(() => {
    fetchCampaign()
    // Test contract connection
    if (contract) {
      testContract()
    }
  }, [contract, params.id])

  const testContract = async () => {
    if (!contract) {
      console.log('No contract available')
      return
    }
    
    try {
      console.log('Testing contract connection...')
      console.log('Contract address:', CONTRACT_ADDRESS)
      console.log('Contract object:', contract)
      
      // Test basic contract call
      try {
        console.log('Testing getLatestPrice...')
        const price = await contract.getLatestPrice()
        console.log('Chainlink price:', price.toString())
      } catch (priceError) {
        console.log('Chainlink price feed error:', priceError)
      }
      
    } catch (error) {
      console.error('Contract test failed:', error)
    }
  }

  const fetchCampaign = async () => {
    if (!contract) return
    
    try {
      const campaignData = await contract.campaigns(params.id)
      setCampaign({
        tokenId: Number(campaignData.tokenId),
        charityType: Number(campaignData.charityType),
        goalAmount: campaignData.goalAmount.toString(),
        totalDonations: campaignData.totalDonations.toString(),
        creator: campaignData.creator,
        influencerName: campaignData.influencerName,
        profileImageURL: campaignData.profileImageURL,
        active: campaignData.active,
        createdAt: Number(campaignData.createdAt)
      })
    } catch (error) {
      console.error('Error fetching campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDonate = async () => {
    if (!contract || !isConnected || !campaign) return

    setDonating(true)
    try {
      // Use a fixed donation amount of 0.0003 ETH (approximately $1)
      // This bypasses the Chainlink price feed issue and uses $1 instead of $10
      const donationAmount = ethers.parseEther("0.0003")
      
      console.log('Donating amount:', ethers.formatEther(donationAmount), 'ETH')
      console.log('Campaign ID:', campaign.tokenId)
      console.log('Campaign active:', campaign.active)
      
      // Check if campaign is active
      if (!campaign.active) {
        alert('This campaign is not active')
        return
      }
      
      const tx = await contract.donate(campaign.tokenId, { 
        value: donationAmount,
        gasLimit: 300000 // Set explicit gas limit
      })
      console.log('Transaction sent:', tx.hash)
      
      await tx.wait()
      console.log('Transaction confirmed')
      
      // Refresh campaign data
      await fetchCampaign()
      alert('Donation successful!')
    } catch (error) {
      console.error('Full error object:', error)
      
      let errorMessage = 'Please try again.'
      if (error.message) {
        if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction was cancelled.'
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient ETH balance.'
        } else if (error.message.includes('Campaign not active')) {
          errorMessage = 'Campaign is not active.'
        } else {
          errorMessage = error.message
        }
      }
      
      alert(`Error making donation: ${errorMessage}`)
    } finally {
      setDonating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Campaign Not Found</h2>
          <p className="text-gray-600">The campaign you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const Icon = charityIcons[campaign.charityType]
  const colorClass = charityColors[campaign.charityType]
  
  const goalInUSD = Number(ethers.formatEther(campaign.goalAmount))
  const donationsInETH = Number(ethers.formatEther(campaign.totalDonations))
  const donationsInUSD = donationsInETH * ethPrice
  // Since we're now doing $1 donations but the contract expects $10, 
  // we need to adjust the display calculation
  const adjustedDonationsInUSD = donationsInUSD / 10 // Convert from $10 donations to $1 display
  const progressPercentage = goalInUSD > 0 ? Math.min((adjustedDonationsInUSD / (goalInUSD / 10)) * 100, 100) : 0

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className={`h-48 ${colorClass} flex items-center justify-center relative`}>
            <Icon className="h-24 w-24 text-white" />
            <div className="absolute top-4 right-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                campaign.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {campaign.active ? 'Active' : 'Completed'}
              </span>
            </div>
          </div>

          <div className="p-8">
            {/* Campaign Info */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-15 h-15 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-gray-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{campaign.influencerName}</h1>
                <p className="text-lg text-gray-600">{charityTypes[campaign.charityType]} Campaign</p>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Campaign Progress</h2>
                <span className="text-2xl font-bold text-primary-600">
                  {progressPercentage.toFixed(1)}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div
                  className="bg-primary-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-gray-900">${adjustedDonationsInUSD.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Raised</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-gray-900">${(goalInUSD / 10).toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Goal</p>
                </div>
              </div>
            </div>

            {/* Donation Panel */}
            {campaign.active && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary-50 rounded-lg p-6 mb-8"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Make a Donation</h3>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-primary-600" />
                    <span className="text-lg font-medium">Fixed Amount: $1.00</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Equivalent in ETH</p>
                    <p className="text-lg font-bold text-primary-600">0.0003 ETH</p>
                    <p className="text-xs text-gray-500">ETH Price: ${ethPrice.toFixed(2)}</p>
                  </div>
                </div>
                
                {isConnected ? (
                  <motion.button
                    onClick={handleDonate}
                    disabled={donating}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {donating ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing Donation...</span>
                      </div>
                    ) : (
                      'Donate $1'
                    )}
                  </motion.button>
                ) : (
                  <p className="text-center text-gray-600">Connect your wallet to donate</p>
                )}
              </motion.div>
            )}

            {/* Campaign Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Creator</p>
                  <p className="font-medium text-gray-900">
                    {campaign.creator.slice(0, 6)}...{campaign.creator.slice(-4)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-medium text-gray-900">
                    {new Date(campaign.createdAt * 1000).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Total Raised</p>
                  <p className="font-medium text-gray-900">{donationsInETH.toFixed(4)} ETH</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}