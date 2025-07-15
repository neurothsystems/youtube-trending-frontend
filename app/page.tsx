'use client'

import React, { useState } from 'react'
import { Search, TrendingUp, Download, Play, Clock, ThumbsUp, MessageCircle, Globe, Brain, BarChart3, Zap, FlaskConical, Filter } from 'lucide-react'

// API Configuration
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.topmetric.ai';

fetch(`${API_BASE}/analyze`, ...)

// Interfaces
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
}

interface AlgorithmInfo {
  version: string;
  engagement_factor?: number;
  freshness_exponent?: number;
  features?: string[];
  [key: string]: unknown;
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

interface AnalysisInfo {
  analyzed_videos: number;
  timestamp: string;
  algorithm_used: string;
  algorithm_info: AlgorithmInfo;
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

// KORRIGIERT: Qualitätsfilter statt verwirrenden Confidence-Parameter
const QUALITY_FILTERS = {
  'alle': { min_confidence: 0.0, label: '🌍 Alle Videos', description: 'Zeige alle gefundenen Videos' },
  'wenig_spam': { min_confidence: 0.4, label: '🛡️ Weniger Spam (40%+)', description: 'Filtere offensichtlichen Spam heraus' },
  'gute_qualitaet': { min_confidence: 0.6, label: '👍 Gute Qualität (60%+)', description: 'Nur vertrauenswürdige Videos' },
  'premium': { min_confidence: 0.8, label: '💎 Premium (80%+)', description: 'Nur hochwertigste Videos' }
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
  // ENTFERNT: confidence parameter (machte keinen Sinn als Suchparameter)

  console.log('🔍 API Request URL:', url.toString());

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  
  const data = await response.json();
  console.log('📊 API Response:', data);
  
  return data;
};

const compareAlgorithms = async (query: string, region: string) => {
  const url = new URL('/algorithm-test', API_BASE);
  url.searchParams.append('query', query);
  url.searchParams.append('region', region);

  console.log('🧪 A/B Test URL:', url.toString());

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`A/B Test Error: ${response.status}`);
  
  const data = await response.json();
  console.log('📈 A/B Test Response:', data);
  
  return data;
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

// KORRIGIERT: Filter-Funktion für Confidence
const filterVideosByQuality = (videos: TrendingVideo[], qualityLevel: string): TrendingVideo[] => {
  const filter = QUALITY_FILTERS[qualityLevel as keyof typeof QUALITY_FILTERS];
  if (!filter) return videos;
  
  return videos.filter(video => video.confidence >= filter.min_confidence);
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

export default function CorrectedFrontend() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    days: 2,
    top_count: 12,
    min_duration: 4,
    region: 'DE',
    algorithm: 'regional'
  })
  
  // NEU: Separate State für Qualitätsfilter (NACH der Suche)
  const [qualityFilter, setQualityFilter] = useState<string>('alle')
  const [rawResults, setRawResults] = useState<TrendingVideo[] | null>(null) // Alle Ergebnisse
  const [filteredResults, setFilteredResults] = useState<TrendingVideo[] | null>(null) // Gefilterte Ergebnisse
  
  const [algorithmComparison, setAlgorithmComparison] = useState<AlgorithmComparison | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisInfo, setAnalysisInfo] = useState<AnalysisInfo | null>(null)
  const [showComparison, setShowComparison] = useState(false)

  // KORRIGIERT: Normale Suche ohne verwirrenden Confidence-Parameter
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setLoading(true)
    setError(null)
    setRawResults(null)
    setFilteredResults(null)
    setAlgorithmComparison(null)
    setShowComparison(false)
    
    try {
      const params = { ...searchParams, query: searchQuery }
      const response = await analyzeVideos(params)
      
      if (response.success) {
        const processedVideos = (response.top_videos || []).map((video, index) => ({
          ...video,
          rank: video.rank || (index + 1),
          normalized_score: video.normalized_score || ((video.trending_score / (response.top_videos[0]?.trending_score || 1)) * 10),
          confidence: video.confidence || 0.5,
          algorithm_version: video.algorithm_version || response.algorithm_used || 'unknown'
        }));

        setRawResults(processedVideos)
        // Sofort filtern basierend auf aktueller Qualitätsauswahl
        setFilteredResults(filterVideosByQuality(processedVideos, qualityFilter))
        
        setAnalysisInfo({
          analyzed_videos: response.analyzed_videos || 0,
          timestamp: response.timestamp || new Date().toISOString(),
          algorithm_used: response.algorithm_used || searchParams.algorithm || 'unknown',
          algorithm_info: response.algorithm_info || { version: 'unknown' }
        })
      } else {
        throw new Error('API returned success: false')
      }
    } catch (err) {
      console.error('🚨 Search Error:', err);
      setError(`Fehler bei der Suche: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`)
    }
    
    setLoading(false)
  }

  // NEU: Qualitätsfilter ändern (NACH der Suche)
  const handleQualityFilterChange = (newQualityLevel: string) => {
    setQualityFilter(newQualityLevel)
    if (rawResults) {
      setFilteredResults(filterVideosByQuality(rawResults, newQualityLevel))
    }
  }

  // A/B Testing bleibt gleich
  const handleAlgorithmComparison = async () => {
    if (!searchQuery.trim()) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await compareAlgorithms(searchQuery, searchParams.region || 'DE')
      
      if (response.success) {
        setAlgorithmComparison(response.algorithm_comparison)
        setShowComparison(true)
        setRawResults(null)
        setFilteredResults(null)
      } else {
        throw new Error('Algorithm comparison failed')
      }
    } catch (err) {
      console.error('🚨 A/B Test Error:', err);
      setError(`Algorithmus-Vergleich fehlgeschlagen: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`)
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
                <Badge className="ml-2 bg-green-100 text-green-800">Korrigiert V4.1</Badge>
              </h1>
            </div>
            <Button variant="outline" onClick={() => window.open(API_BASE, '_blank')}>
              🔧 Backend Test
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        {!filteredResults && !algorithmComparison && (
          <div className="text-center py-12 mb-12">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              <span className="text-blue-600">Korrigierte</span> Algorithmus-Engine
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Jetzt ohne verwirrenden Confidence-Parameter! Qualitätsfilter funktioniert NACH der Suche.
            </p>
            
            <div className="flex justify-center gap-8 text-sm text-gray-500 mb-8">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                4 Algorithmus-Strategien
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Qualitätsfilter NACH Suche
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Logische Parameter
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

              {/* KORRIGIERT: Suchparameter ohne verwirrenden Confidence */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                      algorithm: 'regional'
                    })}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* NEU: Qualitätsfilter NACH der Suche */}
        {rawResults && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                ✅ Qualitätsfilter (funktioniert NACH der Suche)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Object.entries(QUALITY_FILTERS).map(([key, filter]) => {
                  const isSelected = qualityFilter === key;
                  return (
                    <div
                      key={key}
                      onClick={() => handleQualityFilterChange(key)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-green-500 bg-green-100' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="font-medium text-sm">{filter.label}</div>
                      <div className="text-xs text-gray-600 mt-1">{filter.description}</div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 text-sm text-green-700">
                <strong>Zeige:</strong> {filteredResults?.length || 0} von {rawResults?.length || 0} Videos 
                (Filter: {QUALITY_FILTERS[qualityFilter as keyof typeof QUALITY_FILTERS]?.label})
              </div>
            </div>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <div className="p-6">
              <p className="text-red-600 font-semibold">🚨 {error}</p>
              <div className="mt-2 text-sm text-red-500">
                <strong>Debug-Hilfe:</strong>
                <ul className="list-disc list-inside mt-1">
                  <li>Backend-Status: <a href={API_BASE + '/test'} target="_blank" className="underline">{API_BASE}/test</a></li>
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
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">
                  {showComparison ? 'Vergleiche Algorithmen...' : 'Analysiere YouTube Videos...'}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* A/B Testing Results */}
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
                                {video.normalized_score.toFixed(1)}/10
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
        {filteredResults && !showComparison && (
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
                      <span>🎯 {filteredResults.length} Videos nach Filter</span>
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
              {filteredResults.map((video) => (
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

            {/* Info Box */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  ✅ Korrigierte V4.1 - Logische Parameter
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Algorithmus:</span>
                    <div className="text-blue-600">{ALGORITHMS[analysisInfo?.algorithm_used as keyof typeof ALGORITHMS]?.name}</div>
                  </div>
                  <div>
                    <span className="font-medium">Qualitätsfilter:</span>
                    <div className="text-green-600">{QUALITY_FILTERS[qualityFilter as keyof typeof QUALITY_FILTERS]?.label}</div>
                  </div>
                  <div>
                    <span className="font-medium">Gefilterte Videos:</span>
                    <div className="text-blue-600">{filteredResults.length} von {rawResults?.length || 0}</div>
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
