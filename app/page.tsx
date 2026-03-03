'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@/contexts/WalletContext'
import CampaignCard from '@/components/CampaignCard'
import { Heart, TrendingUp, Users, DollarSign } from 'lucide-react'

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

export default function Home() {
  const { contract, ethPrice } = useWallet()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalRaised: 0,
    activeCampaigns: 0
  })

  useEffect(() => {
    fetchCampaigns()
  }, [contract])

  const fetchCampaigns = async () => {
    if (!contract) return
    
    try {
      const allCampaigns = await contract.getAllCampaigns()
      const formattedCampaigns = allCampaigns.map((campaign: any) => ({
        tokenId: Number(campaign.tokenId),
        charityType: Number(campaign.charityType),
        goalAmount: campaign.goalAmount.toString(),
        totalDonations: campaign.totalDonations.toString(),
        creator: campaign.creator,
        influencerName: campaign.influencerName,
        profileImageURL: campaign.profileImageURL,
        active: campaign.active,
        createdAt: Number(campaign.createdAt)
      }))
      
      setCampaigns(formattedCampaigns)
      
      // Calculate stats
      const totalRaised = formattedCampaigns.reduce((sum, campaign) => {
        return sum + (Number(campaign.totalDonations) / 1e18 * ethPrice)
      }, 0)
      
      setStats({
        totalCampaigns: formattedCampaigns.length,
        totalRaised,
        activeCampaigns: formattedCampaigns.filter(c => c.active).length
      })
      
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Donate with <span className="text-primary-600">Transparency</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Support meaningful causes through blockchain-powered campaigns. Every donation is tracked, 
              transparent, and directly impacts the communities that need it most.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#campaigns">
                <button className="btn-primary text-lg px-8 py-3">
                  Explore Campaigns
                </button>
              </a>
              <a href="/create">
                <button className="btn-secondary text-lg px-8 py-3">
                  Start a Campaign
                </button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{stats.totalCampaigns}</h3>
              <p className="text-gray-600">Total Campaigns</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">${stats.totalRaised.toFixed(0)}</h3>
              <p className="text-gray-600">Total Raised</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{stats.activeCampaigns}</h3>
              <p className="text-gray-600">Active Campaigns</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">1000+</h3>
              <p className="text-gray-600">Donors</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Campaigns Section */}
      <section id="campaigns" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Active Campaigns</h2>
            <p className="text-xl text-gray-600">
              Support these amazing causes and make a real difference
            </p>
          </motion.div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">No campaigns found. Be the first to create one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {campaigns.filter(campaign => campaign.active).map((campaign) => (
                <CampaignCard
                  key={campaign.tokenId}
                  campaign={campaign}
                  ethPrice={ethPrice}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}