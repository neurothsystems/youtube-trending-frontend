'use client'

import React, { useState } from 'react'
import Head from 'next/head'
import { Search, TrendingUp, Download, Play, Clock, ThumbsUp, MessageCircle, Globe, BarChart3, Zap, FlaskConical, Filter, AlertCircle } from 'lucide-react'

// API Configuration
const API_BASE = 'https://youtube-trending-api-kc53.onrender.com'

// FIXED: Interfaces für korrekte Backend-Response
interface RegionalRelevance {
  score: number;
  confidence: number;
  explanation: string;
  breakdown: {
    channel_geography: number;
    content_match: number;
    query_boost: number;
    anti_bias_adjustment: number;
  };
  region_detected?: string;
  blacklisted: boolean;
}

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
  regional_relevance: RegionalRelevance;
  blacklisted?: boolean;
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
  target_region?: string;
  fixes_applied?: string[];
  features?: string[];
  [key: string]: unknown;
}

interface AnalyzeResponse {
  success: boolean;
  query: string;
  algorithm_used: string;
  algorithm_info?: AlgorithmInfo;
  analyzed_videos?: number;
  top_videos: TrendingVideo[];
  timestamp: string;
  regional_insights: {
    high_relevance_videos: number;
    medium_relevance_videos: number;
    low_relevance_videos: number;
    spam_videos_filtered: number;
    average_regional_score: number;
  };
  performance: {
    processing_time_ms: number;
    api_quota_used: number;
  };
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
    name: '🌍 Regional-Optimiert V6.1', 
    description: 'FIXED: Anti-Asien-Filter + Regional-Boost + Korrekte Sortierung',
    icon: Globe,
    color: 'bg-red-500'
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

// FIXED: Quality Filters basierend auf regional_relevance.score
const QUALITY_FILTERS = {
  'alle': { 
    min_confidence: 0.0, 
    min_regional_score: 0.0,
    label: '🌍 Alle Videos', 
    description: 'Zeige alle gefundenen Videos' 
  },
  'wenig_spam': { 
    min_confidence: 0.3, 
    min_regional_score: 0.2,
    label: '🛡️ Weniger Spam (30%+ Conf)', 
    description: 'Filtere offensichtlichen Spam heraus' 
  },
  'gute_qualitaet': { 
    min_confidence: 0.5, 
    min_regional_score: 0.4,
    label: '👍 Gute Qualität (50%+ Conf)', 
    description: 'Nur vertrauenswürdige Videos' 
  },
  'regional_relevant': { 
    min_confidence: 0.6, 
    min_regional_score: 0.6,
    label: '🎯 Regional Relevant (60%+)', 
    description: 'Nur regional relevante Videos' 
  },
  'premium': { 
    min_confidence: 0.8, 
    min_regional_score: 0.8,
    label: '💎 Premium (80%+)', 
    description: 'Nur hochwertigste Videos' 
  }
}

// FIXED: API Functions mit besserer Error-Handling
const analyzeVideos = async (params: SearchParams): Promise<AnalyzeResponse> => {
  const url = new URL('/analyze', API_BASE);
  
  url.searchParams.append('query', params.query);
  url.searchParams.append('days', (params.days || 2).toString());
  url.searchParams.append('top_count', (params.top_count || 10).toString());
  url.searchParams.append('algorithm', params.algorithm || 'regional');
  
  // FIXED: min_duration in Minuten senden (nicht Sekunden)
  if (params.min_duration) {
    url.searchParams.append('min_duration', params.min_duration.toString());
  }
  if (params.region) {
    url.searchParams.append('region', params.region);
  }

  console.log('🔍 API Request URL:', url.toString());

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📊 API Response:', data);
    
    // FIXED: Validate response structure
    if (!data.success) {
      throw new Error(data.error || 'API returned success: false');
    }
    
    return data;
    
  } catch (error) {
    console.error('🚨 API Error:', error);
    throw error;
  }
};

const compareAlgorithms = async (query: string, region: string) => {
  const url = new URL('/algorithm-test', API_BASE);
  url.searchParams.append('query', query);
  url.searchParams.append('region', region);

  console.log('🧪 A/B Test URL:', url.toString());

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`A/B Test HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📈 A/B Test Response:', data);
    
    if (!data.success) {
      throw new Error(data.error || 'A/B Test failed');
    }
    
    return data;
    
  } catch (error) {
    console.error('🚨 A/B Test Error:', error);
    throw error;
  }
};

// Utility Functions
const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

// FIXED: Score-Color basierend auf normalized_score (sollte ≤10 sein)
const getScoreColor = (normalizedScore: number) => {
  if (normalizedScore >= 8) return 'bg-green-500'
  if (normalizedScore >= 6) return 'bg-yellow-500'
  if (normalizedScore >= 4) return 'bg-orange-500'
  return 'bg-red-500'
}

// FIXED: Regional-Relevance-Color
const getRegionalRelevanceColor = (score: number) => {
  if (score >= 0.8) return 'bg-green-500'
  if (score >= 0.6) return 'bg-yellow-500'
  if (score >= 0.4) return 'bg-orange-500'
  if (score >= 0.2) return 'bg-red-400'
  return 'bg-gray-500'
}

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.8) return 'text-green-600'
  if (confidence >= 0.6) return 'text-yellow-600'
  return 'text-red-600'
}

// FIXED: Filter videos by quality (basierend auf regional_relevance)
const filterVideosByQuality = (videos: TrendingVideo[], qualityLevel: string): TrendingVideo[] => {
  const filter = QUALITY_FILTERS[qualityLevel as keyof typeof QUALITY_FILTERS];
  if (!filter) return videos;
  
  return videos.filter(video => {
    const confidence = video.regional_relevance?.confidence || 0;
    const regionalScore = video.regional_relevance?.score || 0;
    const isBlacklisted = video.regional_relevance?.blacklisted || false;
    
    return !isBlacklisted && 
           confidence >= filter.min_confidence && 
           regionalScore >= filter.min_regional_score;
  });
}

// FIXED: Fallback-Sortierung für Frontend
const sortVideosByTrendingScore = (videos: TrendingVideo[]): TrendingVideo[] => {
  return [...videos].sort((a, b) => {
    // Primär nach trending_score
    if (b.trending_score !== a.trending_score) {
      return b.trending_score - a.trending_score;
    }
    // Sekundär nach regional_relevance bei Gleichstand
    const aRegional = a.regional_relevance?.score || 0;
    const bRegional = b.regional_relevance?.score || 0;
    return bRegional - aRegional;
  });
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
    default: 'bg-red-600 text-white hover:bg-red-700',
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

export default function TopMetricFrontend() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    days: 2,
    top_count: 12,
    min_duration: 4,
    region: 'DE',
    algorithm: 'regional'
  })
  
  // FIXED: State für bessere Error-Handling
  const [qualityFilter, setQualityFilter] = useState<string>('alle')
  const [rawResults, setRawResults] = useState<TrendingVideo[] | null>(null)
  const [filteredResults, setFilteredResults] = useState<TrendingVideo[] | null>(null)
  const [algorithmComparison, setAlgorithmComparison] = useState<AlgorithmComparison | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisInfo, setAnalysisInfo] = useState<AnalysisInfo | null>(null)
  const [showComparison, setShowComparison] = useState(false)
  const [apiCallsMade, setApiCallsMade] = useState(0)

  // FIXED: Main search function mit besserem Error-Handling
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Bitte geben Sie einen Suchbegriff ein');
      return;
    }
    
    setLoading(true)
    setError(null)
    setRawResults(null)
    setFilteredResults(null)
    setAlgorithmComparison(null)
    setShowComparison(false)
    
    try {
      const params = { ...searchParams, query: searchQuery }
      console.log('🔍 Search Params:', params);
      
      const response = await analyzeVideos(params)
      console.log('📊 Full Response:', response);
      
      if (response.success && response.top_videos) {
        // FIXED: Prozessiere Videos mit korrekten Datenstrukturen
        const processedVideos = response.top_videos.map((video, index) => ({
          ...video,
          rank: video.rank || (index + 1),
          // FIXED: Fallback für fehlende regional_relevance
          regional_relevance: video.regional_relevance || {
            score: 0.3,
            confidence: 0.5,
            explanation: 'Nicht analysiert',
            breakdown: {
              channel_geography: 0,
              content_match: 0,
              query_boost: 0,
              anti_bias_adjustment: 0
            },
            blacklisted: false
          },
          // FIXED: Fallback für normalized_score
          normalized_score: video.normalized_score || 
            Math.min(((video.trending_score || 0) / Math.max(response.top_videos[0]?.trending_score || 1, 1)) * 10, 10),
          confidence: video.regional_relevance?.confidence || 0.5,
          algorithm_version: video.algorithm_version || response.algorithm_used || 'unknown'
        }));

        // FIXED: Fallback-Sortierung falls Backend falsch sortiert
        const sortedVideos = sortVideosByTrendingScore(processedVideos);
        
        setRawResults(sortedVideos)
        setFilteredResults(filterVideosByQuality(sortedVideos, qualityFilter))
        setApiCallsMade(response.performance?.api_quota_used || 0)
        
        setAnalysisInfo({
          analyzed_videos: response.analyzed_videos || sortedVideos.length,
          timestamp: response.timestamp || new Date().toISOString(),
          algorithm_used: response.algorithm_used || searchParams.algorithm || 'unknown',
          algorithm_info: response.algorithm_info || { version: 'unknown' }
        })
        
        console.log('✅ Processed Videos:', sortedVideos.length);
        console.log('🔍 First video score:', sortedVideos[0]?.trending_score);
        
      } else {
        throw new Error(response.error || 'Keine Videos gefunden');
      }
    } catch (err) {
      console.error('🚨 Search Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler';
      setError(`Fehler bei der Suche: ${errorMessage}`);
    }
    
    setLoading(false)
  }

  // FIXED: Quality filter change mit besserer Logic
  const handleQualityFilterChange = (newQualityLevel: string) => {
    setQualityFilter(newQualityLevel)
    if (rawResults) {
      const filtered = filterVideosByQuality(rawResults, newQualityLevel)
      setFilteredResults(filtered)
      console.log(`🔍 Quality Filter: ${newQualityLevel} → ${filtered.length} videos`);
    }
  }

  // Algorithm comparison
  const handleAlgorithmComparison = async () => {
    if (!searchQuery.trim()) {
      setError('Bitte geben Sie einen Suchbegriff ein');
      return;
    }
    
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
        throw new Error(response.error || 'Algorithm comparison failed')
      }
    } catch (err) {
      console.error('🚨 A/B Test Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler';
      setError(`Algorithmus-Vergleich fehlgeschlagen: ${errorMessage}`);
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
    <>
      <Head>
        <title>TopMetric AI - YouTube Trending Intelligence V6.1 FIXED</title>
        <meta name="description" content="AI-powered YouTube trending analysis - FIXED Version" />
        
        <link rel="icon" href="/favicons/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicons/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/favicons/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-orange-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="/topmetric-logo.svg" 
                  alt="TopMetric AI" 
                  className="h-10 w-auto text-gray-800"
                />
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold text-gray-900">
                    TopMetric AI
                    <Badge className="ml-2 bg-green-100 text-green-800">V6.1 FIXED</Badge>
                  </h1>
                  <p className="text-sm text-gray-600">YouTube Trending Intelligence - Bugs Fixed</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-500">
                  API-Aufrufe: {apiCallsMade}
                </div>
                <Button variant="outline" onClick={() => window.open(API_BASE, '_blank')}>
                  🔧 Backend Test
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* FIXED: Hero Section mit Fix-Hinweisen */}
          {!filteredResults && !algorithmComparison && (
            <div className="text-center py-12 mb-12">
              <h2 className="text-5xl font-bold text-gray-900 mb-4">
                <span className="text-red-600">FIXED</span> Trend-Analyse
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                V6.1 FIXED: Korrekte Sortierung, Duration-Filter, Erweiterte Spam-Detection
              </p>
              
              <div className="flex justify-center gap-8 text-sm text-gray-500 mb-8">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Sortierung nach Trending-Score
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Duration-Filter funktioniert
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Asiatische Spam-Detection
                </div>
              </div>
            </div>
          )}

          {/* Algorithm Selection */}
          <Card className="mb-8">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
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
                          ? 'border-red-500 bg-red-50' 
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
                    placeholder="z.B. musik, gaming, tech..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 px-4 py-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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

                {/* FIXED: Search Parameters mit Duration-Filter */}
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
                      <option value={1}>1+ Min</option>
                      <option value={4}>4+ Min</option>
                      <option value={10}>10+ Min</option>
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

          {/* FIXED: Quality Filter mit Regional-Relevance */}
          {rawResults && (
            <Card className="mb-8 border-green-200 bg-green-50">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Qualitätsfilter (V6.1 FIXED)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-red-600 font-semibold">🚨 {error}</p>
                </div>
                <div className="mt-2 text-sm text-red-500">
                  <strong>Debug-Hilfe:</strong>
                  <ul className="list-disc list-inside mt-1">
                    <li>Backend-Status: <a href={API_BASE + '/test'} target="_blank" className="underline">{API_BASE}/test</a></li>
                    <li>Browser-Konsole (F12) für Details öffnen</li>
                    <li>V6.1 FIXED Version läuft auf Backend</li>
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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  <span className="ml-3 text-gray-600">
                    {showComparison ? 'Vergleiche Algorithmen (V6.1 FIXED)...' : 'Analysiere YouTube Videos (V6.1 FIXED)...'}
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
                    Algorithmus-Vergleich für &quot;{searchQuery}&quot; (V6.1 FIXED)
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Vergleich der Top 3 Ergebnisse verschiedener Algorithmus-Strategien
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(algorithmComparison).map(([algKey, algData]) => (
                      <Card key={algKey} className="border-l-4 border-red-500">
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

          {/* FIXED: Single Algorithm Results */}
          {filteredResults && !showComparison && (
            <div className="space-y-6">
              {/* Results Header */}
              <Card>
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Trending Ergebnisse für &quot;{searchQuery}&quot; (V6.1 FIXED)
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span>📊 {analysisInfo?.analyzed_videos} Videos analysiert</span>
                        <span>🎯 {filteredResults.length} Videos nach Filter</span>
                        <span>🧠 {ALGORITHMS[analysisInfo?.algorithm_used as keyof typeof ALGORITHMS]?.name}</span>
                        <span>{getRegionName(searchParams.region || '')}</span>
                        <span>⚡ {apiCallsMade} API-Aufrufe</span>
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

              {/* FIXED: Video Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResults.map((video, index) => (
                  <Card key={video.url || index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <div className="p-0">
                      {/* FIXED: Header mit Trend-Score und Regional-Relevance */}
                      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-3 flex justify-between items-center">
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
                          <Badge className={`${getRegionalRelevanceColor(video.regional_relevance?.score || 0)} text-white border-none text-xs`}>
                            Regional: {((video.regional_relevance?.score || 0) * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </div>

                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-gray-200">
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
                        {/* FIXED: Spam-Warning */}
                        {video.regional_relevance?.blacklisted && (
                          <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs">
                            🚫 SPAM
                          </div>
                        )}
                      </div>

                      {/* Video Info */}
                      <div className="p-4 space-y-3">
                        <h4 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                          {video.title}
                        </h4>

                        <p className="text-gray-600 text-sm">📺 {video.channel}</p>

                        {/* FIXED: Metrics mit Regional-Relevance */}
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

                        {/* FIXED: Regional-Relevance-Info */}
                        <div className="bg-gray-50 p-2 rounded text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Regional-Relevance:</span>
                            <span className={`font-medium ${getConfidenceColor(video.regional_relevance?.score || 0)}`}>
                              {video.regional_relevance?.explanation || 'Nicht analysiert'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-gray-600">Confidence:</span>
                            <span className={`font-medium ${getConfidenceColor(video.regional_relevance?.confidence || 0)}`}>
                              {((video.regional_relevance?.confidence || 0) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <Button 
                          className="w-full" 
                          size="sm"
                          onClick={() => window.open(video.url, '_blank')}
                          disabled={video.regional_relevance?.blacklisted}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {video.regional_relevance?.blacklisted ? 'Spam-Video' : 'Video ansehen'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* FIXED: Info Box mit V6.1 Details */}
              <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    TopMetric AI - V6.1 FIXED
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Algorithmus:</span>
                      <div className="text-red-600">{ALGORITHMS[analysisInfo?.algorithm_used as keyof typeof ALGORITHMS]?.name}</div>
                    </div>
                    <div>
                      <span className="font-medium">Qualitätsfilter:</span>
                      <div className="text-green-600">{QUALITY_FILTERS[qualityFilter as keyof typeof QUALITY_FILTERS]?.label}</div>
                    </div>
                    <div>
                      <span className="font-medium">Fixes angewendet:</span>
                      <div className="text-blue-600">Sortierung, Duration, Spam-Detection</div>
                    </div>
                    <div>
                      <span className="font-medium">Performance:</span>
                      <div className="text-purple-600">{apiCallsMade} API-Aufrufe</div>
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
