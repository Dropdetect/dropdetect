"use client"

import React, { useState, useEffect } from "react"
import { Search, Twitter, Coffee, Copy, Check, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Sample data
const sampleDrops = {
  unclaimed: [
    {
      id: 1,
      name: "Starknet",
      symbol: "STRK",
      logo: "/starknet-logo.png",
      status: "Eligible",
      amount: "$450",
    },
    {
      id: 2,
      name: "ZKSync",
      symbol: "ZK",
      logo: "/zksync-logo.png",
      status: "Not Eligible",
      amount: "$0",
    },
    {
      id: 3,
      name: "LayerZero",
      symbol: "ZRO",
      logo: "/layerzero-logo.jpg",
      status: "Eligible",
      amount: "$320",
    },
    {
      id: 7,
      name: "Blast",
      symbol: "BLAST",
      logo: "/placeholder.svg",
      status: "Eligible",
      amount: "$350",
    },
    {
      id: 8,
      name: "Base",
      symbol: "BASE",
      logo: "/placeholder.svg",
      status: "Eligible",
      amount: "$280",
    },
    {
      id: 9,
      name: "Linea",
      symbol: "LINEA",
      logo: "/placeholder.svg",
      status: "Eligible",
      amount: "$250",
    },
    {
      id: 10,
      name: "Mantle",
      symbol: "MNT",
      logo: "/placeholder.svg",
      status: "Eligible",
      amount: "$180",
    },
    {
      id: 11,
      name: "zkSync Era",
      symbol: "ZK",
      logo: "/placeholder.svg",
      status: "Eligible",
      amount: "$320",
    },
    {
      id: 12,
      name: "Celestia",
      symbol: "TIA",
      logo: "/placeholder.svg",
      status: "Eligible",
      amount: "$150",
    },
    {
      id: 13,
      name: "Dymension",
      symbol: "DYM",
      logo: "/placeholder.svg",
      status: "Eligible",
      amount: "$120",
    },
    {
      id: 14,
      name: "AltLayer",
      symbol: "ALT",
      logo: "/placeholder.svg",
      status: "Eligible",
      amount: "$100",
    },
    {
      id: 15,
      name: "Jupiter",
      symbol: "JUP",
      logo: "/placeholder.svg",
      status: "Eligible",
      amount: "$80",
    },
    {
      id: 16,
      name: "Polygon",
      symbol: "MATIC",
      logo: "/placeholder.svg",
      status: "Eligible",
      amount: "$200",
    },
    {
      id: 17,
      name: "EigenLayer",
      symbol: "EIGEN",
      logo: "/placeholder.svg",
      status: "Eligible",
      amount: "$400",
    },
    {
      id: 18,
      name: "Taiko",
      symbol: "TAIKO",
      logo: "/placeholder.svg",
      status: "Eligible",
      amount: "$300",
    },
    {
      id: 19,
      name: "Hyperliquid",
      symbol: "HL",
      logo: "/placeholder.svg",
      status: "Eligible",
      amount: "$250",
    },
    {
      id: 20,
      name: "Polygon zkEVM",
      symbol: "POL",
      logo: "/placeholder.svg",
      status: "Eligible",
      amount: "$180",
    },
  ],
  upcoming: [
    {
      id: 4,
      name: "Scroll",
      symbol: "SCR",
      logo: "/scroll-logo.jpg",
      status: "TBA",
      amount: "TBA",
    },
    {
      id: 21,
      name: "Polygon zkEVM",
      symbol: "POL",
      logo: "/placeholder.svg",
      status: "TBA",
      amount: "TBA",
    },
    {
      id: 22,
      name: "Taiko",
      symbol: "TAIKO",
      logo: "/placeholder.svg",
      status: "TBA",
      amount: "TBA",
    },
    {
      id: 23,
      name: "EigenLayer",
      symbol: "EIGEN",
      logo: "/placeholder.svg",
      status: "TBA",
      amount: "TBA",
    },
    {
      id: 24,
      name: "Hyperliquid",
      symbol: "HL",
      logo: "/placeholder.svg",
      status: "TBA",
      amount: "TBA",
    },
    {
      id: 25,
      name: "Base",
      symbol: "BASE",
      logo: "/placeholder.svg",
      status: "TBA",
      amount: "TBA",
    },
    {
      id: 26,
      name: "Blast",
      symbol: "BLAST",
      logo: "/placeholder.svg",
      status: "TBA",
      amount: "TBA",
    },
    {
      id: 27,
      name: "Linea",
      symbol: "LINEA",
      logo: "/placeholder.svg",
      status: "TBA",
      amount: "TBA",
    },
    {
      id: 28,
      name: "Mantle",
      symbol: "MNT",
      logo: "/placeholder.svg",
      status: "TBA",
      amount: "TBA",
    },
    {
      id: 29,
      name: "zkSync Era",
      symbol: "ZK",
      logo: "/placeholder.svg",
      status: "TBA",
      amount: "TBA",
    },
    {
      id: 30,
      name: "Celestia",
      symbol: "TIA",
      logo: "/placeholder.svg",
      status: "TBA",
      amount: "TBA",
    },
    {
      id: 31,
      name: "Dymension",
      symbol: "DYM",
      logo: "/placeholder.svg",
      status: "TBA",
      amount: "TBA",
    },
    {
      id: 32,
      name: "AltLayer",
      symbol: "ALT",
      logo: "/placeholder.svg",
      status: "TBA",
      amount: "TBA",
    },
    {
      id: 33,
      name: "Jupiter",
      symbol: "JUP",
      logo: "/placeholder.svg",
      status: "TBA",
      amount: "TBA",
    },
    {
      id: 34,
      name: "Polygon",
      symbol: "MATIC",
      logo: "/placeholder.svg",
      status: "TBA",
      amount: "TBA",
    },
    {
      id: 35,
      name: "Starknet",
      symbol: "STRK",
      logo: "/starknet-logo.png",
      status: "TBA",
      amount: "TBA",
    },
  ],
  claimed: [
    {
      id: 5,
      name: "Arbitrum",
      symbol: "ARB",
      logo: "/arbitrum-logo-abstract.png",
      status: "Claimed",
      amount: "$1,200",
    },
    {
      id: 36,
      name: "Optimism",
      symbol: "OP",
      logo: "/optimism-logo-abstract.png",
      status: "Claimed",
      amount: "$800",
    },
    {
      id: 37,
      name: "Polygon",
      symbol: "MATIC",
      logo: "/placeholder.svg",
      status: "Claimed",
      amount: "$600",
    },
    {
      id: 38,
      name: "Base",
      symbol: "BASE",
      logo: "/placeholder.svg",
      status: "Claimed",
      amount: "$450",
    },
    {
      id: 39,
      name: "Blast",
      symbol: "BLAST",
      logo: "/placeholder.svg",
      status: "Claimed",
      amount: "$350",
    },
    {
      id: 40,
      name: "Linea",
      symbol: "LINEA",
      logo: "/placeholder.svg",
      status: "Claimed",
      amount: "$280",
    },
    {
      id: 41,
      name: "Mantle",
      symbol: "MNT",
      logo: "/placeholder.svg",
      status: "Claimed",
      amount: "$200",
    },
    {
      id: 42,
      name: "zkSync Era",
      symbol: "ZK",
      logo: "/placeholder.svg",
      status: "Claimed",
      amount: "$320",
    },
    {
      id: 43,
      name: "Celestia",
      symbol: "TIA",
      logo: "/placeholder.svg",
      status: "Claimed",
      amount: "$150",
    },
    {
      id: 44,
      name: "Dymension",
      symbol: "DYM",
      logo: "/placeholder.svg",
      status: "Claimed",
      amount: "$120",
    },
    {
      id: 45,
      name: "AltLayer",
      symbol: "ALT",
      logo: "/placeholder.svg",
      status: "Claimed",
      amount: "$100",
    },
    {
      id: 46,
      name: "Jupiter",
      symbol: "JUP",
      logo: "/placeholder.svg",
      status: "Claimed",
      amount: "$80",
    },
    {
      id: 47,
      name: "EigenLayer",
      symbol: "EIGEN",
      logo: "/placeholder.svg",
      status: "Claimed",
      amount: "$400",
    },
    {
      id: 48,
      name: "Taiko",
      symbol: "TAIKO",
      logo: "/placeholder.svg",
      status: "Claimed",
      amount: "$300",
    },
    {
      id: 49,
      name: "Hyperliquid",
      symbol: "HL",
      logo: "/placeholder.svg",
      status: "Claimed",
      amount: "$250",
    },
    {
      id: 50,
      name: "Polygon zkEVM",
      symbol: "POL",
      logo: "/placeholder.svg",
      status: "Claimed",
      amount: "$180",
    },
  ],
  expired: [
    {
      id: 6,
      name: "Optimism",
      symbol: "OP",
      logo: "/optimism-logo-abstract.png",
      status: "Expired",
      amount: "$800",
    },
    {
      id: 51,
      name: "Polygon",
      symbol: "MATIC",
      logo: "/placeholder.svg",
      status: "Expired",
      amount: "$600",
    },
    {
      id: 52,
      name: "Base",
      symbol: "BASE",
      logo: "/placeholder.svg",
      status: "Expired",
      amount: "$450",
    },
    {
      id: 53,
      name: "Blast",
      symbol: "BLAST",
      logo: "/placeholder.svg",
      status: "Expired",
      amount: "$350",
    },
    {
      id: 54,
      name: "Linea",
      symbol: "LINEA",
      logo: "/placeholder.svg",
      status: "Expired",
      amount: "$280",
    },
    {
      id: 55,
      name: "Mantle",
      symbol: "MNT",
      logo: "/placeholder.svg",
      status: "Expired",
      amount: "$200",
    },
    {
      id: 56,
      name: "zkSync Era",
      symbol: "ZK",
      logo: "/placeholder.svg",
      status: "Expired",
      amount: "$320",
    },
    {
      id: 57,
      name: "Celestia",
      symbol: "TIA",
      logo: "/placeholder.svg",
      status: "Expired",
      amount: "$150",
    },
    {
      id: 58,
      name: "Dymension",
      symbol: "DYM",
      logo: "/placeholder.svg",
      status: "Expired",
      amount: "$120",
    },
    {
      id: 59,
      name: "AltLayer",
      symbol: "ALT",
      logo: "/placeholder.svg",
      status: "Expired",
      amount: "$100",
    },
    {
      id: 60,
      name: "Jupiter",
      symbol: "JUP",
      logo: "/placeholder.svg",
      status: "Expired",
      amount: "$80",
    },
    {
      id: 61,
      name: "EigenLayer",
      symbol: "EIGEN",
      logo: "/placeholder.svg",
      status: "Expired",
      amount: "$400",
    },
    {
      id: 62,
      name: "Taiko",
      symbol: "TAIKO",
      logo: "/placeholder.svg",
      status: "Expired",
      amount: "$300",
    },
    {
      id: 63,
      name: "Hyperliquid",
      symbol: "HL",
      logo: "/placeholder.svg",
      status: "Expired",
      amount: "$250",
    },
    {
      id: 64,
      name: "Polygon zkEVM",
      symbol: "POL",
      logo: "/placeholder.svg",
      status: "Expired",
      amount: "$180",
    },
    {
      id: 65,
      name: "Starknet",
      symbol: "STRK",
      logo: "/starknet-logo.png",
      status: "Expired",
      amount: "$500",
    },
  ],
}

const newsItems = [
  {
    id: 1,
    title: "New Ethereum Layer 2 Airdrop Announced",
    snippet: "A major L2 solution hints at upcoming token distribution for early users...",
    link: "#",
  },
  {
    id: 2,
    title: "DeFi Protocol Launches Retroactive Rewards",
    snippet: "Users who provided liquidity before snapshot date eligible for rewards...",
    link: "#",
  },
  {
    id: 3,
    title: "Cross-Chain Bridge Airdrop Criteria Released",
    snippet: "Bridge users with over $1000 volume qualify for upcoming token drop...",
    link: "#",
  },
]

const liveFeedItems = [
  "0x123...abc claimed $450 from Starknet",
  "0xdef...789 missed $200 ZKSync airdrop (expired)",
  "0x456...ghi claimed $1,200 from Arbitrum",
  "0xjkl...012 eligible for $320 LayerZero airdrop",
]

const cryptoAddresses = {
  ethereum: "0xc715701ffec93d31a60ee9aef30ab49b3d9c02de",
  bitcoin: "1Pqo23jSC94F5mas3vtpDtH3DiVMghEF5j",
  solana: "BWZbCLs8sZ3jXjyMUSigitJ8V8iwSw4f65s2zGo4p3aD",
  tron: "TT7cDjaFJXp1YTYHNGRf8wdYyBAUDCdEYL",
}

function CopyableAddress({ label, address }: { label: string; address: string }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <Input value={address} readOnly className="font-mono text-sm" />
        <Button size="sm" variant="outline" onClick={copyToClipboard} className="shrink-0 bg-transparent">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}

const featuredDrops = [
  {
    id: 1,
    name: "Starknet",
    symbol: "STRK",
    logo: "/starknet-logo.png",
    status: "Active",
    amount: "Up to $500",
    description: "Layer 2 scaling solution for Ethereum",
  },
  {
    id: 2,
    name: "ZKSync",
    symbol: "ZK",
    logo: "/zksync-logo.png",
    status: "Active",
    amount: "Up to $300",
    description: "Zero-knowledge rollup technology",
  },
  {
    id: 3,
    name: "LayerZero",
    symbol: "ZRO",
    logo: "/layerzero-logo.jpg",
    status: "Active",
    amount: "Up to $400",
    description: "Omnichain interoperability protocol",
  },
  {
    id: 4,
    name: "Scroll",
    symbol: "SCR",
    logo: "/scroll-logo.jpg",
    status: "Upcoming",
    amount: "TBA",
    description: "Native zkEVM Layer 2 for Ethereum",
  },
  {
    id: 5,
    name: "Arbitrum",
    symbol: "ARB",
    logo: "/arbitrum-logo-abstract.png",
    status: "Active",
    amount: "Up to $600",
    description: "Optimistic rollup for Ethereum",
  },
  {
    id: 6,
    name: "Optimism",
    symbol: "OP",
    logo: "/optimism-logo-abstract.png",
    status: "Active",
    amount: "Up to $450",
    description: "Layer 2 scaling solution",
  },
  {
    id: 7,
    name: "Polygon",
    symbol: "MATIC",
    logo: "/placeholder.svg",
    status: "Active",
    amount: "Up to $200",
    description: "Ethereum scaling platform",
  },
  {
    id: 8,
    name: "Base",
    symbol: "BASE",
    logo: "/placeholder.svg",
    status: "Upcoming",
    amount: "TBA",
    description: "Coinbase's Layer 2 network",
  },
  {
    id: 9,
    name: "Blast",
    symbol: "BLAST",
    logo: "/placeholder.svg",
    status: "Active",
    amount: "Up to $350",
    description: "Native yield for ETH and stablecoins",
  },
  {
    id: 10,
    name: "Linea",
    symbol: "LINEA",
    logo: "/placeholder.svg",
    status: "Active",
    amount: "Up to $250",
    description: "ConsenSys zkEVM rollup",
  },
  {
    id: 11,
    name: "Mantle",
    symbol: "MNT",
    logo: "/placeholder.svg",
    status: "Active",
    amount: "Up to $180",
    description: "Modular Layer 2 network",
  },
  {
    id: 12,
    name: "zkSync Era",
    symbol: "ZK",
    logo: "/placeholder.svg",
    status: "Active",
    amount: "Up to $320",
    description: "Zero-knowledge rollup",
  },
  {
    id: 13,
    name: "Polygon zkEVM",
    symbol: "POL",
    logo: "/placeholder.svg",
    status: "Upcoming",
    amount: "TBA",
    description: "Zero-knowledge Ethereum Virtual Machine",
  },
  {
    id: 14,
    name: "Taiko",
    symbol: "TAIKO",
    logo: "/placeholder.svg",
    status: "Upcoming",
    amount: "TBA",
    description: "Type-1 zkEVM",
  },
  {
    id: 15,
    name: "EigenLayer",
    symbol: "EIGEN",
    logo: "/placeholder.svg",
    status: "Upcoming",
    amount: "TBA",
    description: "Restaking protocol",
  },
  {
    id: 16,
    name: "Celestia",
    symbol: "TIA",
    logo: "/placeholder.svg",
    status: "Active",
    amount: "Up to $150",
    description: "Modular blockchain network",
  },
  {
    id: 17,
    name: "Dymension",
    symbol: "DYM",
    logo: "/placeholder.svg",
    status: "Active",
    amount: "Up to $120",
    description: "Modular blockchain platform",
  },
  {
    id: 18,
    name: "AltLayer",
    symbol: "ALT",
    logo: "/placeholder.svg",
    status: "Active",
    amount: "Up to $100",
    description: "Decentralized rollup protocol",
  },
  {
    id: 19,
    name: "Hyperliquid",
    symbol: "HL",
    logo: "/placeholder.svg",
    status: "Upcoming",
    amount: "TBA",
    description: "Decentralized derivatives exchange",
  },
  {
    id: 20,
    name: "Jupiter",
    symbol: "JUP",
    logo: "/placeholder.svg",
    status: "Active",
    amount: "Up to $80",
    description: "Solana DEX aggregator",
  },
]

function DropCard({ drop, showClaimButton = true }: { drop: any; showClaimButton?: boolean }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Eligible":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Not Eligible":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "Claimed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "Expired":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Upcoming":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={drop.logo || "/placeholder.svg"}
            alt={`${drop.name} logo`}
            className="w-12 h-12 rounded-full border-2 border-border"
          />
          <div className="flex-1">
            <h3 className="font-bold text-lg">{drop.name}</h3>
            <p className="text-sm text-muted-foreground font-medium">{drop.symbol}</p>
            {drop.description && <p className="text-xs text-muted-foreground mt-1">{drop.description}</p>}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor(drop.status)}>{drop.status}</Badge>
          <div className="text-right">
            <p className="font-bold text-lg">{drop.amount}</p>
            {showClaimButton && (drop.status === "Eligible" || drop.status === "Active") && (
              <Button
                size="sm"
                className="mt-2 hover:scale-105 transition-transform"
                onClick={() => window.open("#", "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                {drop.status === "Eligible" ? "Claim" : "Check"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DropDetectDashboard() {
  const [searchValue, setSearchValue] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [visibleDrops, setVisibleDrops] = useState(16)
  const [visibleUnclaimed, setVisibleUnclaimed] = useState(16)
  const [visibleUpcoming, setVisibleUpcoming] = useState(16)
  const [visibleClaimed, setVisibleClaimed] = useState(16)
  const [visibleExpired, setVisibleExpired] = useState(16)
  const [dropsData, setDropsData] = useState<{
    unclaimed: any[]
    claimed: any[]
    expired: any[]
    upcoming: any[]
  }>({
    unclaimed: [],
    claimed: [],
    expired: [],
    upcoming: []
  })
  const [newsData, setNewsData] = useState<any[]>([])
  const [feedData, setFeedData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const handleSearch = (e?: React.KeyboardEvent) => {
    if (e && e.key !== "Enter") return

    if (searchValue.trim()) {
      console.log("Searching for wallet:", searchValue)
      // Basic validation for wallet address format
      const isValidAddress = /^(0x[a-fA-F0-9]{40}|[1-9A-HJ-NP-Za-km-z]{25,62}|[A-Za-z0-9]{32,44})$/.test(
        searchValue.trim(),
      )
      if (isValidAddress) {
        setHasSearched(true)
        // Placeholder API call would go here
        console.log("[v0] Valid address format detected, triggering search")
      } else {
        console.log("[v0] Invalid address format")
        alert("Please enter a valid wallet address")
      }
    }
  }

  const handleViewMore = () => {
    setVisibleDrops(prev => Math.min(prev + 16, featuredDrops.length))
  }

  const handleViewMoreUnclaimed = () => {
    setVisibleUnclaimed(prev => Math.min(prev + 16, dropsData.unclaimed.length))
  }

  const handleViewMoreUpcoming = () => {
    setVisibleUpcoming(prev => Math.min(prev + 16, dropsData.upcoming.length))
  }

  const handleViewMoreClaimed = () => {
    setVisibleClaimed(prev => Math.min(prev + 16, dropsData.claimed.length))
  }

  const handleViewMoreExpired = () => {
    setVisibleExpired(prev => Math.min(prev + 16, dropsData.expired.length))
  }

  // Fetch data from API
  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch drops data
      const dropsResponse = await fetch('/api/drops')
      const drops = await dropsResponse.json()
      setDropsData(drops)
      
      // Fetch news data
      const newsResponse = await fetch('/api/news')
      const news = await newsResponse.json()
      setNewsData(news)
      
      // Fetch live feed data
      const feedResponse = await fetch('/api/live-feed')
      const feed = await feedResponse.json()
      setFeedData(feed)
      
    } catch (error) {
      console.error('Error fetching data:', error)
      // Fallback to sample data if API fails
      setDropsData(sampleDrops)
      setNewsData(newsItems)
      setFeedData(sampleFeedEvents)
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 relative overflow-hidden rounded-xl shadow-lg">
                <img 
                  src="/logo.jpg" 
                  alt="DropDetect Logo" 
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <span className="font-bold text-2xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                DropDetect
              </span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-4 min-w-0">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 transition-colors group-focus-within:text-green-600" />
                <Input
                  placeholder="Paste any EVM or non-EVM wallet address..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={handleSearch}
                  className="pl-12 w-full h-12 rounded-xl shadow-sm border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:shadow-lg transition-all duration-300 ease-in-out hover:border-green-300 hover:shadow-md"
                />
                <Button
                  size="sm"
                  onClick={() => handleSearch()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-3 bg-green-600 hover:bg-green-700 transition-all duration-200 hover:scale-105 hover:shadow-md"
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-green-50 dark:hover:bg-green-950 hover:border-green-300 bg-transparent"
                onClick={() => window.open("https://x.com/drop_detect", "_blank")}
              >
                <Twitter className="h-4 w-4 mr-2" />
                Follow Us
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-orange-50 dark:hover:bg-orange-950 hover:border-orange-300 bg-transparent"
                  >
                    <Coffee className="h-4 w-4 mr-2" />
                    Buy Me a Coffee
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Support DropDetect</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <CopyableAddress label="Ethereum" address={cryptoAddresses.ethereum} />
                    <CopyableAddress label="Bitcoin" address={cryptoAddresses.bitcoin} />
                    <CopyableAddress label="Solana" address={cryptoAddresses.solana} />
                    <CopyableAddress label="Tron" address={cryptoAddresses.tron} />
                  </div>
                </DialogContent>
              </Dialog>
            </nav>
          </div>
        </div>
      </header>

      {/* Live Feed Ticker */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-b overflow-hidden">
        <div className="relative h-12 flex items-center">
          <div className="animate-scroll flex items-center gap-8 whitespace-nowrap">
            {[...liveFeedItems, ...liveFeedItems, ...liveFeedItems].map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-mono text-green-700 dark:text-green-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ad Banner */}
      <div className="container mx-auto px-4 py-6">
        <div className="w-full h-32 md:h-40 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl flex items-center justify-center border-2 border-dashed border-border shadow-sm">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">Advertisement Space</p>
            <p className="text-sm">1600x400 - Future ads or custom promotions</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-8">
        {!hasSearched ? (
          // Featured Airdrops Section (when no address entered)
          <div className="space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Featured Airdrops</CardTitle>
                <p className="text-muted-foreground">Popular airdrops you might be eligible for</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {featuredDrops.slice(0, visibleDrops).map((drop) => (
                    <DropCard key={drop.id} drop={drop} showClaimButton={true} />
                  ))}
                </div>
                {visibleDrops < featuredDrops.length && (
                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={handleViewMore}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    >
                      View More ({featuredDrops.length - visibleDrops} remaining)
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>


          </div>
        ) : (
          // Wallet-specific results (when address entered)
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Wallet Analysis</h2>
                <p className="text-muted-foreground font-mono text-sm">
                  {searchValue.slice(0, 6)}...{searchValue.slice(-4)}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setHasSearched(false)
                  setSearchValue("")
                }}
              >
                Clear Search
              </Button>
            </div>

            <Tabs defaultValue="unclaimed" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8 h-14 bg-muted/30 rounded-xl p-1">
                <TabsTrigger 
                  value="unclaimed" 
                  className="rounded-lg font-semibold text-sm transition-all duration-200 data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-green-100 dark:hover:bg-green-900"
                >
                  Unclaimed
                </TabsTrigger>
                <TabsTrigger 
                  value="upcoming" 
                  className="rounded-lg font-semibold text-sm transition-all duration-200 data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-emerald-100 dark:hover:bg-emerald-900"
                >
                  Upcoming
                </TabsTrigger>
                <TabsTrigger 
                  value="claimed" 
                  className="rounded-lg font-semibold text-sm transition-all duration-200 data-[state=active]:bg-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-teal-100 dark:hover:bg-teal-900"
                >
                  Claimed
                </TabsTrigger>
                <TabsTrigger 
                  value="expired" 
                  className="rounded-lg font-semibold text-sm transition-all duration-200 data-[state=active]:bg-slate-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Expired
                </TabsTrigger>
              </TabsList>

              <TabsContent value="unclaimed">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {dropsData.unclaimed.slice(0, visibleUnclaimed).map((drop) => (
                        <DropCard key={drop.id} drop={drop} />
                      ))}
                    </div>
                    {visibleUnclaimed < dropsData.unclaimed.length && (
                      <div className="flex justify-center mt-8">
                        <Button
                          onClick={handleViewMoreUnclaimed}
                          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
                        >
                          View More ({dropsData.unclaimed.length - visibleUnclaimed} remaining)
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="upcoming">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {dropsData.upcoming.slice(0, visibleUpcoming).map((drop) => (
                        <DropCard key={drop.id} drop={drop} />
                      ))}
                    </div>
                    {visibleUpcoming < dropsData.upcoming.length && (
                      <div className="flex justify-center mt-8">
                        <Button
                          onClick={handleViewMoreUpcoming}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
                        >
                          View More ({dropsData.upcoming.length - visibleUpcoming} remaining)
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="claimed">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {dropsData.claimed.slice(0, visibleClaimed).map((drop) => (
                        <DropCard key={drop.id} drop={drop} />
                      ))}
                    </div>
                    {visibleClaimed < dropsData.claimed.length && (
                      <div className="flex justify-center mt-8">
                        <Button
                          onClick={handleViewMoreClaimed}
                          className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
                        >
                          View More ({dropsData.claimed.length - visibleClaimed} remaining)
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="expired">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {dropsData.expired.slice(0, visibleExpired).map((drop) => (
                        <DropCard key={drop.id} drop={drop} />
                      ))}
                    </div>
                    {visibleExpired < dropsData.expired.length && (
                      <div className="flex justify-center mt-8">
                        <Button
                          onClick={handleViewMoreExpired}
                          className="bg-slate-600 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
                        >
                          View More ({dropsData.expired.length - visibleExpired} remaining)
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* News Section */}
        <div className="mt-16">
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold">Latest Airdrop News</CardTitle>
              <p className="text-muted-foreground">Stay updated with the latest airdrop announcements and opportunities</p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {newsData.map((item) => (
                    <Card
                      key={item.id}
                      className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-green-500 hover:border-l-green-600 hover:scale-[1.02]"
                    >
                      <CardContent className="p-6 h-full flex flex-col">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-3 text-balance hover:text-green-600 transition-colors line-clamp-2">
                            {item.title}
                          </h3>
                          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">{item.content}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full hover:bg-green-50 dark:hover:bg-green-950 bg-transparent border-green-200 hover:border-green-300"
                          onClick={() => item.url && window.open(item.url, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Read More
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-16 shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-sm text-muted-foreground text-center font-medium">
              DropDetect only aggregates official sources. No fake checkers.
            </p>
            <p className="text-xs text-muted-foreground text-center">
              © 2024 DropDetect. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
