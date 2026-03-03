'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ethers } from 'ethers'
import { Home, Utensils, Heart, GraduationCap, Wrench, Waves } from 'lucide-react'

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

interface CampaignCardProps {
  campaign: Campaign
  ethPrice: number
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

export default function CampaignCard({ campaign, ethPrice }: CampaignCardProps) {
  const Icon = charityIcons[campaign.charityType]
  const colorClass = charityColors[campaign.charityType]
  
  const goalInUSD = Number(ethers.formatEther(campaign.goalAmount))
  const donationsInETH = Number(ethers.formatEther(campaign.totalDonations))
  
  // Calculate number of $1 donations (0.0003 ETH each)
  const numberOfDonations = Math.round(donationsInETH / 0.0003)
  const donationsInUSD = numberOfDonations * 1.00
  
  // Adjust goal for $1 donation model
  const adjustedGoalInUSD = goalInUSD / 10
  const progressPercentage = adjustedGoalInUSD > 0 ? Math.min((donationsInUSD / adjustedGoalInUSD) * 100, 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="card hover:shadow-xl transition-all duration-300"
    >
      <div className={`h-32 ${colorClass} flex items-center justify-center`}>
        <Icon className="h-16 w-16 text-white" />
      </div>
      
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <Heart className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{campaign.influencerName}</h3>
            <p className="text-sm text-gray-600">{charityTypes[campaign.charityType]}</p>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm font-medium text-gray-900">
              ${donationsInUSD.toFixed(2)} / ${adjustedGoalInUSD.toFixed(2)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {progressPercentage.toFixed(1)}% funded
          </p>
        </div>
        
        <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
          <span>{donationsInETH.toFixed(4)} ETH raised</span>
          <span className={`px-2 py-1 rounded-full text-xs ${
            campaign.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {campaign.active ? 'Active' : 'Completed'}
          </span>
        </div>
        
        <Link href={`/campaign/${campaign.tokenId}`}>
          <button className="w-full btn-primary">
            View Campaign
          </button>
        </Link>
      </div>
    </motion.div>
  )
}