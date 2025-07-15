'use client'

import React, { useState } from 'react'
import { Search, TrendingUp, Download, Play, Clock, ThumbsUp, MessageCircle, Globe, Brain, BarChart3, Zap, FlaskConical } from 'lucide-react'

const API_BASE = 'https://youtube-trending-api-kc53.onrender.com'

interface TrendingVideo {
  rank: number;
  title: string;
  channel: string;
  views: number;
  comments: number;
  likes: number;
  trending_score: number;
  normalized_score: number;
  confidence: number;
  age_hours: number;
  duration_formatted: string;
  duration_seconds: number;
  engagement_rate: number;
  url: string;
  algorithm_version: string;
}

interface SearchParams {
  query: string;
  days?: number;
  top_count?: number;
  min_duration?: number;
  region?: string;
  algorithm?: string;
  confidence?: number;
}

interface AlgorithmInfo {
  version: string;
  engagement_factor?: number;
  freshness_exponent?: number;
  features?: string[];
  [key: string]: unknown;
}

interface AnalysisInfo {
  analyzed_videos: number;
  timestamp: string;
  algorithm_used: string;
  algorithm_info: AlgorithmInfo;
}

interface AnalyzeResponse {
  success: boolean;
  query: string;
  algorithm_used: string;
  algorithm_info: AlgorithmInfo;
  analyzed_videos: number;
  top_videos: TrendingVideo[];
  timestamp: string;
}

interface AlgorithmComparison {
  [key: string]: {
    name: string;
    top_videos: Array<{
      rank: number;
      title: string;
      trending_score: number;
      normalized_score: number;
    }>;
    algorithm_info: AlgorithmInfo;
  };
}

// Algorithm Options
const ALGORITHMS = {
  'regional': { 
    name: '🌍 Regional-Optimiert', 
    description: 'Anti-Indien-Filter + Sprach-Boost für bessere regionale Ergebnisse',
    icon: Globe,
    color: 'bg-blue-500'
  },
  'basic': { 
    name: '🔹 Basis-Algorithmus', 
    description: 'Standard Trending-Berechnung ohne spezielle Filter',
    icon: BarChart3,
    color: 'bg-gray-500'
  },
  'anti_spam': { 
    name: '🚫 Anti-Spam', 
    description: 'Reduziert Bot-Traffic und übermäßiges Engagement',
    icon: Zap,
    color: 'bg-orange-500'
  },
  'experimental': { 
    name: '🧪 Experimentell', 
    description: 'Neueste experimentelle Features für Tests',
    icon: FlaskConical,
    color: 'bg-purple-500'
  }
}

// API Functions
const analyzeVideos = async (params: SearchParams): Promise<AnalyzeResponse> => {
  const url = new URL('/analyze', API_BASE);
  
  url.searchParams.append('query', params.query);
  url.searchParams.append('days', (params.days || 2).toString());
  url.searchParams.append('top_count', (params.top_count || 10).toString());
  url.searchParams.append('algorithm', params.algorithm || 'regional');
  
  if (params.min_duration) url.searchParams.append('min_duration', params.min_duration.toString());
  if (params.region) url.searchParams.append('region', params.region);
  if (params.confidence) url.searchParams.append('confidence', params.confidence.toString());

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return await response.json();
};

const compareAlgorithms = async (query: string, region: string) => {
  const url = new URL('/algorithm-test', API_BASE);
  url.searchParams.append('query', query);
  url.searchParams.append('region', region);

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return await response.json();
};

// Utility Functions
const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const getScoreColor = (normalizedScore: number) => {
  if (normalizedScore >= 8) return 'bg-green-500'
  if (normalizedScore >= 6) return 'bg-yellow-500'
  if (normalizedScore >= 4) return 'bg-orange-500'
  return 'bg-red-500'
}

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.8) return 'text-green-600'
  if (confidence >= 0.6) return 'text-yellow-600'
  return 'text-red-600'
}

// UI Components
const Button = ({ children, onClick, disabled = false, variant = 'default', size = 'default', className = '' }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50';
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200'
  };
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-8 px-3 text-sm',
    lg: 'h-12 px-8 text-lg'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
    {children}
  </div>
);

export default function ModularHomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    days: 2,
    top_count: 12,
    min_duration: 4,
    region: 'DE',
    algorithm: 'regional',
    confidence: 0.5
  })
  const [results, setResults] = useState<TrendingVideo[] | null>(null)
  const [algorithmComparison, setAlgorithmComparison] = useState<AlgorithmComparison | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisInfo, setAnalysisInfo] = useState<AnalysisInfo | null>(null)
  const [showComparison, setShowComparison] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setLoading(true)
    setError(null)
    setResults(null)
    setAlgorithmComparison(null)
    
    try {
      const params = { ...searchParams, query: searchQuery }
      const response = await analyzeVideos(params)
      
      if (response.success) {
        setResults(response.top_videos)
        setAnalysisInfo({
          analyzed_videos: response.analyzed_videos,
          timestamp: response.timestamp,
          algorithm_used: response.algorithm_used,
          algorithm_info: response.algorithm_info
        })
      } else {
        setError('Suche fehlgeschlagen. Bitte versuche es erneut.')
      }
    } catch (err) {
      setError(`Fehler bei der Suche: ${err}`)
    }
    
    setLoading(false)
  }

  const handleAlgorithmComparison = async () => {
    if (!searchQuery.trim()) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await compareAlgorithms(searchQuery, searchParams.region || 'DE')
      
      if (response.success) {
        setAlgorithmComparison(response.algorithm_comparison)
        setShowComparison(true)
        setResults(null)
      }
    } catch (err) {
      setError(`Algorithmus-Vergleich fehlgeschlagen: ${err}`)
    }
    
    setLoading(false)
  }

  const getRegionName = (code: string) => {
    const regions: { [key: string]: string } = {
      '': '🌍 Weltweit', 'DE': '🇩🇪 Deutschland', 'AT': '🇦🇹 Österreich', 'CH': '🇨🇭 Schweiz',
      'US': '🇺🇸 USA', 'GB': '🇬🇧 Großbritannien', 'FR': '🇫🇷 Frankreich', 'ES': '🇪🇸 Spanien',
      'IT': '🇮🇹 Italien', 'NL': '🇳🇱 Niederlande', 'PL': '🇵🇱 Polen', 'BR': '🇧🇷 Brasilien',
      'JP': '🇯🇵 Japan', 'KR': '🇰🇷 Südkorea', 'IN': '🇮🇳 Indien'
    };
    return regions[code] || '🌍 Weltweit';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                YouTube Trending Analyzer
                <Badge className="ml-2 bg-purple-100 text-purple-800">Modular V4.0</Badge>
              </h1>
            </div>
            <Button variant="outline" onClick={() => window.open('https://youtube-trending-api-kc53.onrender.com', '_blank')}>
              🔧 System Test
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        {!results && !algorithmComparison && (
          <div className="text-center py-12 mb-12">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              <span className="text-blue-600">Modulare</span> Algorithmus-Engine
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Teste verschiedene Trending-Algorithmen und finde die optimale Strategie für deine Suche.
              Regionale Optimierung, Anti-Spam-Filter und experimentelle Features.
            </p>
            
            <div className="flex justify-center gap-8 text-sm text-gray-500 mb-8">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                4 Algorithmus-Strategien
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                A/B Testing Support
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Anti-Spam-Filterung
              </div>
            </div>
          </div>
        )}

        {/* Algorithm Selection */}
        <Card className="mb-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Algorithmus-Strategie wählen
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {Object.entries(ALGORITHMS).map(([key, alg]) => {
                const IconComponent = alg.icon;
                const isSelected = searchParams.algorithm === key;
                return (
                  <div
                    key={key}
                    onClick={() => setSearchParams(prev => ({ ...prev, algorithm: key }))}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <IconComponent className="h-5 w-5" />
                      <span className="font-medium">{alg.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">{alg.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Search Section */}
        <Card className="mb-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Search className="h-5 w-5" />
              YouTube Trending Suche
            </h3>
            
            <div className="space-y-4">
              {/* Main Search */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="z.B. künstliche intelligenz, gaming, musik..."
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
                  {loading ? 'Analysiere...' : 'Analysieren'}
                </Button>
                <Button 
                  onClick={handleAlgorithmComparison} 
                  disabled={loading || !searchQuery.trim()}
                  variant="secondary"
                  size="lg"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  A/B Test
                </Button>
              </div>

              {/* Advanced Options */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div>
                  <label className="text-sm font-medium">Zeitraum</label>
                  <select 
                    className="w-full mt-1 p-2 border rounded"
                    value={searchParams.days}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, days: Number(e.target.value) }))}
                  >
                    <option value={1}>24h</option>
                    <option value={2}>2 Tage</option>
                    <option value={7}>Woche</option>
                    <option value={30}>Monat</option>
                  </select>
                </div>
                
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
                
                <div>
                  <label className="text-sm font-medium">Min. Dauer</label>
                  <select 
                    className="w-full mt-1 p-2 border rounded"
                    value={searchParams.min_duration}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, min_duration: Number(e.target.value) }))}
                  >
                    <option value={0}>Alle</option>
                    <option value={60}>1+ Min</option>
                    <option value={240}>4+ Min</option>
                    <option value={600}>10+ Min</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Region</label>
                  <select 
                    className="w-full mt-1 p-2 border rounded"
                    value={searchParams.region}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, region: e.target.value }))}
                  >
                    <option value="DE">🇩🇪 Deutschland</option>
                    <option value="US">🇺🇸 USA</option>
                    <option value="GB">🇬🇧 UK</option>
                    <option value="FR">🇫🇷 Frankreich</option>
                    <option value="ES">🇪🇸 Spanien</option>
                    <option value="IT">🇮🇹 Italien</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Confidence</label>
                  <select 
                    className="w-full mt-1 p-2 border rounded"
                    value={searchParams.confidence}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, confidence: Number(e.target.value) }))}
                  >
                    <option value={0.3}>Niedrig (0.3)</option>
                    <option value={0.5}>Medium (0.5)</option>
                    <option value={0.7}>Hoch (0.7)</option>
                    <option value={0.9}>Sehr hoch (0.9)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setSearchParams({
                      query: '',
                      days: 2,
                      top_count: 12,
                      min_duration: 4,
                      region: 'DE',
                      algorithm: 'regional',
                      confidence: 0.5
                    })}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <div className="p-6">
              <p className="text-red-600">{error}</p>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="mb-8">
            <div className="p-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">
                  {showComparison ? 'Vergleiche Algorithmen...' : 'Analysiere YouTube Videos...'}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Algorithm Comparison Results */}
        {algorithmComparison && (
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Algorithmus-Vergleich für &quot;{searchQuery}&quot;
                </h3>
                <p className="text-gray-600 mb-6">
                  Vergleich der Top 3 Ergebnisse verschiedener Algorithmus-Strategien
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(algorithmComparison).map(([algKey, algData]) => (
                    <Card key={algKey} className="border-l-4 border-blue-500">
                      <div className="p-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          {React.createElement(ALGORITHMS[algKey as keyof typeof ALGORITHMS]?.icon || BarChart3, { className: "h-4 w-4" })}
                          {algData.name}
                        </h4>
                        <div className="space-y-2">
                          {algData.top_videos.map((video, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="truncate flex-1 mr-2">
                                #{video.rank} {video.title}
                              </span>
                              <Badge className={`${getScoreColor(video.normalized_score)} text-white`}>
                                {video.normalized_score}/10
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <Button onClick={() => setShowComparison(false)}>
                    Zurück zur Einzelanalyse
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Single Algorithm Results */}
        {results && !showComparison && (
          <div className="space-y-6">
            {/* Results Header */}
            <Card>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Trending Ergebnisse für &quot;{searchQuery}&quot;
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>📊 {analysisInfo?.analyzed_videos} Videos analysiert</span>
                      <span>🎯 {results.length} Top Videos</span>
                      <span>🧠 {ALGORITHMS[analysisInfo?.algorithm_used as keyof typeof ALGORITHMS]?.name}</span>
                      <span>{getRegionName(searchParams.region || '')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      CSV Export
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Video Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((video) => (
                <Card key={video.url} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <div className="p-0">
                    {/* Header with Rank and Score */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                          #{video.rank}
                        </div>
                        <span className="text-sm opacity-90">Platz {video.rank}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={`${getScoreColor(video.normalized_score)} text-white border-none`}>
                          {video.normalized_score.toFixed(1)}/10
                        </Badge>
                        <span className={`text-xs ${getConfidenceColor(video.confidence)}`}>
                          {(video.confidence * 100).toFixed(0)}% Confidence
                        </span>
                      </div>
                    </div>

                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={`https://img.youtube.com/vi/${video.url.split('v=')[1]?.split('&')[0]}/maxresdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/320x180/f3f4f6/9ca3af?text=YouTube+Video';
                        }}
                      />
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm">
                        {video.duration_formatted}
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="p-4 space-y-3">
                      <h4 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                        {video.title}
                      </h4>

                      <p className="text-gray-600 text-sm">📺 {video.channel}</p>

                      {/* Metrics */}
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
                          <span>{video.age_hours}h alt</span>
                        </div>
                      </div>

                      {/* Algorithm Info */}
                      <div className="text-xs text-gray-500 border-t pt-2">
                        <div className="flex justify-between">
                          <span>Algorithm: {video.algorithm_version}</span>
                          <span>Score: {video.trending_score.toFixed(0)}</span>
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

            {/* Algorithm Info Box */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Algorithmus-Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Verwendeter Algorithmus:</span>
                    <div className="text-blue-600">{ALGORITHMS[analysisInfo?.algorithm_used as keyof typeof ALGORITHMS]?.name}</div>
                  </div>
                  <div>
                    <span className="font-medium">Videos analysiert:</span>
                    <div className="text-blue-600">{analysisInfo?.analyzed_videos}</div>
                  </div>
                  <div>
                    <span className="font-medium">Analyse-Zeit:</span>
                    <div className="text-blue-600">{new Date(analysisInfo?.timestamp || '').toLocaleTimeString()}</div>
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
  )
}
