'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@/contexts/WalletContext'
import { ethers } from 'ethers'
import { useRouter } from 'next/navigation'
import { Home, Utensils, Heart, GraduationCap, Wrench, Waves, Plus } from 'lucide-react'

const charityTypes = [
  { name: 'Housing', icon: Home, color: 'charity-housing' },
  { name: 'Meals', icon: Utensils, color: 'charity-meals' },
  { name: 'Medical', icon: Heart, color: 'charity-medical' },
  { name: 'Education', icon: GraduationCap, color: 'charity-education' },
  { name: 'Equipment', icon: Wrench, color: 'charity-equipment' },
  { name: 'River Cleaning', icon: Waves, color: 'charity-rivercleaning' }
]

export default function CreateCampaign() {
  const { contract, isConnected } = useWallet()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    charityType: 0,
    goalAmount: '',
    influencerName: '',
    profileImageURL: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contract || !isConnected) return

    setLoading(true)
    try {
      const goalAmountWei = ethers.parseEther(formData.goalAmount)
      
      const tx = await contract.mintMyNFT(
        formData.charityType,
        goalAmountWei,
        formData.influencerName,
        formData.profileImageURL || 'https://via.placeholder.com/150'
      )
      
      await tx.wait()
      
      router.push('/dashboard')
    } catch (error) {
      console.error('Error creating campaign:', error)
      alert('Error creating campaign. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'charityType' ? parseInt(value) : value
    }))
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to create a campaign</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <div className="text-center mb-8">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Campaign</h1>
            <p className="text-gray-600">Start your fundraising journey and make a difference</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Charity Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {charityTypes.map((type, index) => {
                  const Icon = type.icon
                  return (
                    <motion.button
                      key={index}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFormData(prev => ({ ...prev, charityType: index }))}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.charityType === index
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-lg ${type.color} flex items-center justify-center mx-auto mb-2`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{type.name}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            <div>
              <label htmlFor="influencerName" className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name / Influencer Name
              </label>
              <input
                type="text"
                id="influencerName"
                name="influencerName"
                value={formData.influencerName}
                onChange={handleInputChange}
                required
                className="input-field"
                placeholder="Enter campaign or influencer name"
              />
            </div>

            <div>
              <label htmlFor="goalAmount" className="block text-sm font-medium text-gray-700 mb-2">
                Goal Amount (USD)
              </label>
              <input
                type="number"
                id="goalAmount"
                name="goalAmount"
                value={formData.goalAmount}
                onChange={handleInputChange}
                required
                min="1"
                step="0.01"
                className="input-field"
                placeholder="Enter goal amount in USD"
              />
            </div>

            <div>
              <label htmlFor="profileImageURL" className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image URL (Optional)
              </label>
              <input
                type="url"
                id="profileImageURL"
                name="profileImageURL"
                value={formData.profileImageURL}
                onChange={handleInputChange}
                className="input-field"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating Campaign...</span>
                </div>
              ) : (
                'Create Campaign'
              )}
            </motion.button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">How it works:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your campaign will be minted as an NFT on the blockchain</li>
              <li>• Donors can contribute $1 worth of ETH to your campaign</li>
              <li>• You can withdraw funds at any time</li>
              <li>• All transactions are transparent and verifiable</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  )
}