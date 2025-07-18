'use client'

import React, { useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { 
  Search, TrendingUp, Download, Play, Clock, ThumbsUp, MessageCircle, 
  Zap, Settings, Activity, Flame, Target, Brain, AlertCircle, Loader2
} from 'lucide-react'

// V6.0 API Configuration - FIXED: Use your actual Render URL
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://youtube-trending-api-kc53.onrender.com'

// V6.0 Interfaces - FIXED: Proper typing
interface V6VideoData {
  rank: number
  video_id: string
  title: string
  channel: string
  views: number
  comments: number
  likes: number
  trending_score: number
  normalized_score: number
  confidence: number
  age_hours: number
  duration_seconds: number
  duration_formatted: string
  engagement_rate: number
  url: string
  thumbnail: string
  is_truly_trending: boolean
  source: 'api' | 'trending_page' | 'api_trending'
  regional_relevance_score: number
  algorithm_version: string
}

interface V6AnalysisResponse {
  success: boolean
  query: string
  region: string
  algorithm_used: string
  analysis_mode: string
  analyzed_videos: number
  filtered_videos: number
  top_videos: V6VideoData[]
  v6_statistics: {
    trending_page_videos: number
    api_videos: number
    truly_trending_in_results: number
    analysis_time_seconds: number
    deduplication_removed: number
    filter_removed: number
  }
  scraper_stats: Record<string, unknown>
  filter_stats: Record<string, unknown>
  algorithm_info: Record<string, unknown>
  timestamp: string
}

interface SearchParams {
  query: string
  region: string
  top_count: number
  trending_pages: boolean
  trending_limit: number
  api_limit: number
}

// V6.0 Configuration
const V6_REGIONS = [
  { code: 'DE', name: '🇩🇪 Deutschland', flag: '🇩🇪' },
  { code: 'US', name: '🇺🇸 USA', flag: '🇺🇸' },
  { code: 'GB', name: '🇬🇧 Großbritannien', flag: '🇬🇧' },
  { code: 'FR', name: '🇫🇷 Frankreich', flag: '🇫🇷' },
  { code: 'ES', name: '🇪🇸 Spanien', flag: '🇪🇸' },
  { code: 'IT', name: '🇮🇹 Italien', flag: '🇮🇹' },
  { code: 'AT', name: '🇦🇹 Österreich', flag: '🇦🇹' },
  { code: 'CH', name: '🇨🇭 Schweiz', flag: '🇨🇭' },
  { code: 'NL', name: '🇳🇱 Niederlande', flag: '🇳🇱' }
]

// V6.0 API Functions
const analyzeV6 = async (params: SearchParams): Promise<V6AnalysisResponse> => {
  const url = new URL('/analyze', API_BASE)
  
  // V6.0 Parameters
  url.searchParams.append('query', params.query)
  url.searchParams.append('region', params.region)
  url.searchParams.append('top_count', params.top_count.toString())
  url.searchParams.append('trending_pages', params.trending_pages.toString())
  url.searchParams.append('trending_limit', params.trending_limit.toString())
  url.searchParams.append('api_limit', params.api_limit.toString())

  console.log('🚀 V6.0 API Request:', url.toString())

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error(`V6.0 API Error: ${response.status}`)
  }

  const data = await response.json()
  console.log('📊 V6.0 Response:', data)

  if (!data.success) {
    throw new Error(data.error || 'V6.0 Analysis failed')
  }

  return data as V6AnalysisResponse
}

// Utility Functions
const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const getScoreColor = (score: number) => {
  if (score >= 8) return 'bg-green-500'
  if (score >= 6) return 'bg-yellow-500'
  if (score >= 4) return 'bg-orange-500'
  return 'bg-red-500'
}

const getSourceIcon = (source: string) => {
  switch (source) {
    case 'trending_page': return '🔥'
    case 'api_trending': return '📈'
    case 'api': return '🔍'
    default: return '📺'
  }
}

// UI Components
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'default' | 'outline' | 'secondary' | 'danger'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'default', 
  size = 'default', 
  className = '' 
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50'
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  }
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-8 px-3 text-sm',
    lg: 'h-12 px-8 text-lg'
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>
    {children}
  </div>
)

const Badge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
    {children}
  </div>
)

export default function V6TrendingAnalyzer() {
  // V6.0 State Management
  const [searchQuery, setSearchQuery] = useState('')
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    region: 'DE',
    top_count: 12,
    trending_pages: true,
    trending_limit: 20,
    api_limit: 30
  })
  
  const [results, setResults] = useState<V6VideoData[] | null>(null)
  const [analysisData, setAnalysisData] = useState<V6AnalysisResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // V6.0 Enhanced Search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Bitte geben Sie einen Suchbegriff ein')
      return
    }
    
    setLoading(true)
    setError(null)
    setResults(null)
    setAnalysisData(null)
    
    try {
      const params = { ...searchParams, query: searchQuery }
      const response = await analyzeV6(params)
      
      setResults(response.top_videos)
      setAnalysisData(response)
      
    } catch (err) {
      console.error('🚨 V6.0 Analysis Error:', err)
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    }
    
    setLoading(false)
  }

  return (
    <>
      <Head>
        <title>TopMetric AI - V6.0 MOMENTUM Trending Analyzer</title>
        <meta name="description" content="V6.0 MOMENTUM Algorithm + Echte Trending-Seiten" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* V6.0 Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    TopMetric AI
                    <Badge className="ml-2 bg-blue-100 text-blue-800">V6.0</Badge>
                  </h1>
                  <p className="text-sm text-gray-600">MOMENTUM Trending Intelligence</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-green-100 text-green-800">
                  <Activity className="h-3 w-3 mr-1" />
                  Live V6.0
                </Badge>
                <Button variant="outline" onClick={() => window.open(`${API_BASE}/health`, '_blank')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Status
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* V6.0 Hero Section */}
          {!results && (
            <div className="text-center py-16 mb-12">
              <h2 className="text-5xl font-bold text-gray-900 mb-6">
                <span className="text-blue-600">MOMENTUM</span> Trending-Analyse
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                V6.0 mit MOMENTUM Algorithm + Echte Trending-Seiten + Anti-Bias Filter
              </p>
              
              <div className="flex justify-center gap-8 text-sm text-gray-500 mb-12">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Echte Trending-Seiten
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  MOMENTUM Algorithm
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" />
                  Anti-Bias Filter
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  +50% Trending Bonus
                </div>
              </div>
            </div>
          )}

          {/* V6.0 Search Section */}
          <Card className="mb-8">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Search className="h-5 w-5" />
                V6.0 MOMENTUM Trending Suche
              </h3>
              
              <div className="space-y-6">
                {/* Main Search */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="z.B. gaming, musik, tech, sport..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 px-4 py-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button 
                    onClick={handleSearch} 
                    disabled={loading || !searchQuery.trim()}
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analysiere...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        V6.0 Analyse
                      </>
                    )}
                  </Button>
                </div>

                {/* V6.0 Settings Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {/* Region */}
                  <div>
                    <label className="text-sm font-medium">Region</label>
                    <select 
                      className="w-full mt-1 p-2 border rounded"
                      value={searchParams.region}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, region: e.target.value }))}
                    >
                      {V6_REGIONS.map(region => (
                        <option key={region.code} value={region.code}>
                          {region.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Top Count */}
                  <div>
                    <label className="text-sm font-medium">Anzahl</label>
                    <select 
                      className="w-full mt-1 p-2 border rounded"
                      value={searchParams.top_count}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, top_count: Number(e.target.value) }))}
                    >
                      <option value={6}>Top 6</option>
                      <option value={12}>Top 12</option>
                      <option value={18}>Top 18</option>
                      <option value={24}>Top 24</option>
                    </select>
                  </div>
                  
                  {/* Trending Pages Toggle */}
                  <div>
                    <label className="text-sm font-medium">Modus</label>
                    <select 
                      className="w-full mt-1 p-2 border rounded"
                      value={searchParams.trending_pages.toString()}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, trending_pages: e.target.value === 'true' }))}
                    >
                      <option value="true">🔥 Trending Pages</option>
                      <option value="false">📡 API Only</option>
                    </select>
                  </div>
                  
                  {/* Trending Limit */}
                  <div>
                    <label className="text-sm font-medium">Trending Limit</label>
                    <select 
                      className="w-full mt-1 p-2 border rounded"
                      value={searchParams.trending_limit}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, trending_limit: Number(e.target.value) }))}
                    >
                      <option value={10}>10 Videos</option>
                      <option value={20}>20 Videos</option>
                      <option value={30}>30 Videos</option>
                    </select>
                  </div>
                  
                  {/* API Limit */}
                  <div>
                    <label className="text-sm font-medium">API Limit</label>
                    <select 
                      className="w-full mt-1 p-2 border rounded"
                      value={searchParams.api_limit}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, api_limit: Number(e.target.value) }))}
                    >
                      <option value={20}>20 Videos</option>
                      <option value={30}>30 Videos</option>
                      <option value={50}>50 Videos</option>
                    </select>
                  </div>
                </div>

                {/* V6.0 Feature Toggle */}
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="trending-pages"
                      checked={searchParams.trending_pages}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, trending_pages: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="trending-pages" className="font-medium text-blue-800">
                      🔥 Echte Trending-Seiten scrapen (V6.0 Feature)
                    </label>
                  </div>
                  <Badge className={searchParams.trending_pages ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}>
                    {searchParams.trending_pages ? 'V6.0 Enhanced Mode' : 'API-Only Mode'}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="mb-8 border-red-200 bg-red-50">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-red-600 font-semibold">🚨 {error}</p>
                </div>
                <div className="mt-2 text-sm text-red-500">
                  <strong>V6.0 Debug-Hilfe:</strong>
                  <ul className="list-disc list-inside mt-1">
                    <li>Backend-Status: <a href={`${API_BASE}/health`} target="_blank" className="underline">{API_BASE}/health</a></li>
                    <li>API-Info: <a href={`${API_BASE}/api/info`} target="_blank" className="underline">{API_BASE}/api/info</a></li>
                    <li>Browser-Konsole (F12) für Details öffnen</li>
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <Card className="mb-8">
              <div className="p-6">
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin mr-3" />
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-900">V6.0 MOMENTUM Analyse läuft...</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {searchParams.trending_pages ? 
                        'Trending-Seiten scrapen + API-Daten + MOMENTUM-Berechnung' : 
                        'API-Daten holen + MOMENTUM-Berechnung'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* V6.0 Results */}
          {results && analysisData && (
            <div className="space-y-6">
              {/* Results Header */}
              <Card>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        V6.0 MOMENTUM Ergebnisse für &quot;{searchQuery}&quot;
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span>📊 {analysisData.analyzed_videos} Videos analysiert</span>
                        <span>🎯 {results.length} Top-Ergebnisse</span>
                        <span>🔥 {analysisData.v6_statistics.truly_trending_in_results} echte Trending-Videos</span>
                        <span>⏱️ {analysisData.v6_statistics.analysis_time_seconds.toFixed(2)}s</span>
                        <span>{analysisData.analysis_mode}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      CSV Export
                    </Button>
                  </div>
                  
                  {/* V6.0 Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {analysisData.v6_statistics.trending_page_videos}
                      </div>
                      <div className="text-sm text-gray-600">Trending-Seiten Videos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {analysisData.v6_statistics.api_videos}
                      </div>
                      <div className="text-sm text-gray-600">API-Videos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {analysisData.v6_statistics.truly_trending_in_results}
                      </div>
                      <div className="text-sm text-gray-600">Echte Trends</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {analysisData.v6_statistics.filter_removed}
                      </div>
                      <div className="text-sm text-gray-600">Gefilterte Videos</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Video Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((video) => (
                  <Card key={video.video_id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <div className="p-0">
                      {/* Header with Rank, Score, and Source */}
                      <div className={`${
                        video.is_truly_trending 
                          ? 'bg-gradient-to-r from-orange-600 to-red-600' 
                          : 'bg-gradient-to-r from-blue-600 to-purple-600'
                      } text-white p-3 flex justify-between items-center`}>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                            #{video.rank}
                          </div>
                          <span className="text-sm opacity-90">
                            {getSourceIcon(video.source)} {video.is_truly_trending ? 'TRENDING' : 'Standard'}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className={`${getScoreColor(video.normalized_score)} text-white border-none`}>
                            {video.normalized_score.toFixed(1)}/10
                          </Badge>
                          <span className="text-xs opacity-75">
                            MOMENTUM: {formatNumber(video.trending_score)}
                          </span>
                        </div>
                      </div>

                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-gray-200">
                        <Image 
                          src={video.thumbnail || `https://img.youtube.com/vi/${video.video_id}/maxresdefault.jpg`}
                          alt={video.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/320x180/f3f4f6/9ca3af?text=YouTube+Video';
                          }}
                        />
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm">
                          {video.duration_formatted}
                        </div>
                        {video.is_truly_trending && (
                          <div className="absolute top-2 left-2 bg-orange-600 text-white px-2 py-1 rounded text-xs font-bold">
                            🔥 TRENDING
                          </div>
                        )}
                      </div>

                      {/* Video Info */}
                      <div className="p-4 space-y-3">
                        <h4 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                          {video.title}
                        </h4>

                        <p className="text-gray-600 text-sm">📺 {video.channel}</p>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <Play className="h-3 w-3 text-gray-400" />
                            <span>{formatNumber(video.views)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3 text-gray-400" />
                            <span>{formatNumber(video.likes)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3 text-gray-400" />
                            <span>{formatNumber(video.comments)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span>{Math.round(video.age_hours)}h alt</span>
                          </div>
                        </div>

                        {/* V6.0 Enhanced Info */}
                        <div className="bg-gray-50 p-2 rounded text-xs space-y-1">
                          <div className="flex justify-between">
                            <span>Confidence:</span>
                            <span className={`font-medium ${video.confidence > 0.7 ? 'text-green-600' : video.confidence > 0.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {(video.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Regional Relevance:</span>
                            <span className={`font-medium ${video.regional_relevance_score > 0.6 ? 'text-green-600' : 'text-gray-600'}`}>
                              {(video.regional_relevance_score * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Source:</span>
                            <span className="font-medium text-blue-600">
                              {video.source === 'trending_page' ? '🔥 Trending Page' : '🔍 API'}
                            </span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <Button 
                          className="w-full" 
                          size="sm"
                          onClick={() => window.open(video.url, '_blank')}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Video ansehen
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* V6.0 Algorithm Info */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    V6.0 MOMENTUM Algorithm
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div>
                      <span className="font-medium">Formel:</span>
                      <div className="text-blue-600 mt-1">
                        (Views/h × 0.6) + (Engagement×Views × 0.3) + (Views×Decay × 0.1)
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Features:</span>
                      <div className="text-green-600 mt-1">
                        {searchParams.trending_pages ? '🔥 Trending Pages + ' : ''}📡 API + 🚫 Anti-Bias + 🎯 Regional Boost
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Performance:</span>
                      <div className="text-purple-600 mt-1">
                        {analysisData.v6_statistics.analysis_time_seconds.toFixed(2)}s | {analysisData.analyzed_videos} Videos | V6.0 Clean
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </main>

        {/* CSS for line clamping */}
        <style jsx global>{`
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
      </div>
    </>
  )
}
