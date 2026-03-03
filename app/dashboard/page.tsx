'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@/contexts/WalletContext'
import { ethers } from 'ethers'
import Link from 'next/link'
import Image from 'next/image'
import { BarChart3, DollarSign, TrendingUp, Wallet, Eye, Download } from 'lucide-react'

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

export default function Dashboard() {
  const { contract, account, isConnected, ethPrice } = useWallet()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [withdrawing, setWithdrawing] = useState<number | null>(null)

  useEffect(() => {
    if (isConnected && account) {
      fetchUserCampaigns()
    }
  }, [contract, account, isConnected])

  const fetchUserCampaigns = async () => {
    if (!contract || !account) return
    
    try {
      const campaignIds = await contract.getCampaignsByCreator(account)
      const campaignPromises = campaignIds.map(async (id: bigint) => {
        const campaignData = await contract.campaigns(id)
        return {
          tokenId: Number(campaignData.tokenId),
          charityType: Number(campaignData.charityType),
          goalAmount: campaignData.goalAmount.toString(),
          totalDonations: campaignData.totalDonations.toString(),
          creator: campaignData.creator,
          influencerName: campaignData.influencerName,
          profileImageURL: campaignData.profileImageURL,
          active: campaignData.active,
          createdAt: Number(campaignData.createdAt)
        }
      })
      
      const userCampaigns = await Promise.all(campaignPromises)
      setCampaigns(userCampaigns)
    } catch (error) {
      console.error('Error fetching user campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async (tokenId: number) => {
    if (!contract) return

    setWithdrawing(tokenId)
    try {
      const tx = await contract.withdraw(tokenId)
      await tx.wait()
      
      // Refresh campaigns
      await fetchUserCampaigns()
      alert('Withdrawal successful!')
    } catch (error) {
      console.error('Error withdrawing:', error)
      alert('Error withdrawing funds. Please try again.')
    } finally {
      setWithdrawing(null)
    }
  }

  const calculateStats = () => {
    const totalRaised = campaigns.reduce((sum, campaign) => {
      return sum + (Number(ethers.formatEther(campaign.totalDonations)) * ethPrice)
    }, 0)
    
    const activeCampaigns = campaigns.filter(c => c.active).length
    const totalGoal = campaigns.reduce((sum, campaign) => {
      return sum + Number(ethers.formatEther(campaign.goalAmount))
    }, 0)
    
    return { totalRaised, activeCampaigns, totalGoal }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view your dashboard</p>
        </div>
      </div>
    )
  }

  const stats = calculateStats()

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your campaigns and track your impact</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeCampaigns}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Raised</p>
                <p className="text-2xl font-bold text-blue-600">${stats.totalRaised.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Goal</p>
                <p className="text-2xl font-bold text-purple-600">${stats.totalGoal.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </motion.div>
        </div>

        {/* Campaigns Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Campaigns</h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">You haven't created any campaigns yet</p>
              <Link href="/create">
                <button className="btn-primary">Create Your First Campaign</button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Goal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Raised
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaigns.map((campaign) => {
                    const goalInUSD = Number(ethers.formatEther(campaign.goalAmount))
                    const donationsInETH = Number(ethers.formatEther(campaign.totalDonations))
                    const donationsInUSD = donationsInETH * ethPrice
                    const progressPercentage = goalInUSD > 0 ? Math.min((donationsInUSD / goalInUSD) * 100, 100) : 0

                    return (
                      <tr key={campaign.tokenId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Image
                              src={campaign.profileImageURL || '/placeholder-avatar.png'}
                              alt={campaign.influencerName}
                              width={40}
                              height={40}
                              className="rounded-full mr-3"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {campaign.influencerName}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {campaign.tokenId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {charityTypes[campaign.charityType]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${goalInUSD.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${donationsInUSD.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">{progressPercentage.toFixed(1)}% of goal</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            campaign.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {campaign.active ? 'Active' : 'Completed'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Link href={`/campaign/${campaign.tokenId}`}>
                            <button className="text-primary-600 hover:text-primary-900 inline-flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>View</span>
                            </button>
                          </Link>
                          {campaign.active && donationsInETH > 0 && (
                            <button
                              onClick={() => handleWithdraw(campaign.tokenId)}
                              disabled={withdrawing === campaign.tokenId}
                              className="text-green-600 hover:text-green-900 inline-flex items-center space-x-1 disabled:opacity-50"
                            >
                              {withdrawing === campaign.tokenId ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                              <span>Withdraw</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}