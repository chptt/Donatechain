'use client'

import Link from 'next/link'
import { useWallet } from '@/contexts/WalletContext'
import { motion } from 'framer-motion'
import { Wallet, Heart, Plus, BarChart3, History } from 'lucide-react'

export default function Navbar() {
  const { account, isConnected, connectWallet, disconnectWallet } = useWallet()

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white shadow-lg border-b border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">DonateChain</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary-600 transition-colors">
              Home
            </Link>
            <Link href="/create" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
              <Plus className="h-4 w-4" />
              <span>Create Campaign</span>
            </Link>
            <Link href="/dashboard" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link href="/contributions" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
              <History className="h-4 w-4" />
              <span>My Contributions</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  {formatAddress(account!)}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="btn-secondary text-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="btn-primary flex items-center space-x-2"
              >
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}