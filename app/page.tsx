'use client'

import React, { useState } from 'react'
import { Search, TrendingUp, Download, Play, Clock, ThumbsUp, MessageCircle, Globe } from 'lucide-react'

// API Types und Functions direkt im Code
const API_BASE = 'https://youtube-trending-api-kc53.onrender.com'

interface TrendingVideo {
  rank: number;
  title: string;
  channel: string;
  views: number;
  comments: number;
  likes: number;
  trending_score: number;
  age_hours: number;
  duration_formatted: string;
  engagement_rate: number;
  url: string;
  publish_date?: string;
  thumbnail?: string;
}

interface SearchParams {
  query: string;
  days?: number;
  top_count?: number;
  min_duration?: number;
  sort_by?: 'trending_score' | 'views' | 'engagement' | 'age';
  region?: string;
}

interface AnalyzeResponse {
  success: boolean;
  query: string;
  analyzed_videos: number;
  top_videos: TrendingVideo[];
  timestamp: string;
  parameters?: SearchParams;
}

// API Functions
const analyzeVideos = async (params: SearchParams): Promise<AnalyzeResponse> => {
  const url = new URL('/analyze', API_BASE);
  
  url.searchParams.append('query', params.query);
  url.searchParams.append('days', (params.days || 2).toString());
  url.searchParams.append('top_count', (params.top_count || 10).toString());
  
  if (params.min_duration) {
    url.searchParams.append('min_duration', params.min_duration.toString());
  }
  if (params.sort_by) {
    url.searchParams.append('sort_by', params.sort_by);
  }
  if (params.region && params.region !== '') {
    url.searchParams.append('region', params.region);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
};

// CSV-Konvertierung für Frontend-Daten
const convertResultsToCSV = (videos: TrendingVideo[]): string => {
  const headers = [
    'Rank',
    'Title', 
    'Channel',
    'Views',
    'Likes',
    'Comments',
    'Score (von 10)',
    'Age Hours',
    'Duration',
    'Engagement Rate',
    'URL',
    'Thumbnail'
  ].join(',')
  
  const rows = videos.map((video, index) => [
    video.rank,
    `"${video.title.replace(/"/g, '""')}"`, // Escape quotes
    `"${video.channel.replace(/"/g, '""')}"`,
    video.views,
    video.likes,
    video.comments,
    calculateNormalizedScore(video.trending_score, videos[0]?.trending_score || 1),
    video.age_hours,
    video.duration_formatted,
    (video.engagement_rate * 100).toFixed(2) + '%',
    video.url,
    video.thumbnail || ''
  ].join(','))
  
  return [headers, ...rows].join('\n')
}

// Normalisierte Score-Berechnung (10-Punkte-System)
const calculateNormalizedScore = (currentScore: number, topScore: number): string => {
  if (topScore === 0) return "0.0"
  const normalized = (currentScore / topScore) * 10
  return normalized.toFixed(1)
}

// CSV-Download-Funktion
const downloadCSVContent = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

// Basic UI Components (ohne externe Dependencies)
const Button = ({ 
  children, 
  onClick, 
  disabled, 
  variant = 'default', 
  size = 'default',
  className = ''
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50';
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
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

const Input = ({ 
  placeholder, 
  value, 
  onChange, 
  onKeyPress,
  className = ''
}: {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
}) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    onKeyPress={onKeyPress}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
);

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col space-y-1.5 p-6 pb-4">
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-600">
    {children}
  </p>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const Badge = ({ 
  children, 
  variant = 'default',
  className = ''
}: { 
  children: React.ReactNode; 
  variant?: 'default' | 'destructive';
  className?: string;
}) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    destructive: 'bg-red-100 text-red-800'
  };
  
  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

const Tabs = ({ children, defaultValue, className = '' }: { children: React.ReactNode; defaultValue: string; className?: string }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  return (
    <div className={`w-full ${className}`}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<{ activeTab?: string; setActiveTab?: (tab: string) => void }>, { activeTab, setActiveTab });
        }
        return child;
      })}
    </div>
  );
};

const TabsList = ({ children, activeTab, setActiveTab }: { children: React.ReactNode; activeTab?: string; setActiveTab?: (tab: string) => void }) => (
  <div className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-600">
    {React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<{ activeTab?: string; setActiveTab?: (tab: string) => void }>, { activeTab, setActiveTab });
      }
      return child;
    })}
  </div>
);

const TabsTrigger = ({ value, children, activeTab, setActiveTab }: { value: string; children: React.ReactNode; activeTab?: string; setActiveTab?: (tab: string) => void }) => (
  <button 
    onClick={() => setActiveTab?.(value)}
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
      activeTab === value 
        ? 'bg-white text-gray-900 shadow-sm' 
        : 'hover:bg-white hover:text-gray-900'
    }`}
  >
    {children}
  </button>
);

const TabsContent = ({ value, children, className = '', activeTab }: { value: string; children: React.ReactNode; className?: string; activeTab?: string }) => (
  <div className={`mt-2 ${activeTab === value ? 'block' : 'hidden'} ${className}`}>
    {children}
  </div>
);

// Score-Farben für 10-Punkte-System
const getScoreColor = (normalizedScore: number) => {
  if (normalizedScore >= 8) return 'bg-green-500'
  if (normalizedScore >= 6) return 'bg-yellow-500'
  if (normalizedScore >= 4) return 'bg-orange-500'
  return 'bg-red-500'
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    days: 2,
    top_count: 12,
    min_duration: 4,
    region: 'DE'
  })
  const [results, setResults] = useState<TrendingVideo[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisInfo, setAnalysisInfo] = useState<{
    analyzed_videos: number;
    timestamp: string;
    parameters?: SearchParams;
  } | null>(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setLoading(true)
    setError(null)
    
    try {
      const params = { ...searchParams, query: searchQuery }
      const response = await analyzeVideos(params)
      
      if (response.success) {
        setResults(response.top_videos)
        setAnalysisInfo({
          analyzed_videos: response.analyzed_videos,
          timestamp: response.timestamp,
          parameters: response.parameters
        })
      } else {
        setError('Suche fehlgeschlagen. Bitte versuche es erneut.')
      }
    } catch (err) {
      setError(`Fehler bei der Suche: ${err}`)
    }
    
    setLoading(false)
  }

  const handleExportCSV = async () => {
    if (!results) return
    try {
      const csvContent = convertResultsToCSV(results)
      const filename = `youtube_trending_${searchQuery}_${new Date().toISOString().split('T')[0]}.csv`
      downloadCSVContent(csvContent, filename)
    } catch (err) {
      setError(`CSV Export fehlgeschlagen: ${err}`)
    }
  }

  const handleExportExcel = async () => {
    if (!results) return
    try {
      const csvContent = convertResultsToCSV(results)
      const filename = `youtube_trending_${searchQuery}_${new Date().toISOString().split('T')[0]}.csv`
      downloadCSVContent(csvContent, filename)
    } catch (err) {
      setError(`Excel Export fehlgeschlagen: ${err}`)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getRegionName = (code: string) => {
    const regions: { [key: string]: string } = {
      '': '🌍 Weltweit',
      'DE': '🇩🇪 Deutschland',
      'AT': '🇦🇹 Österreich',
      'CH': '🇨🇭 Schweiz',
      'US': '🇺🇸 USA',
      'GB': '🇬🇧 Großbritannien',
      'FR': '🇫🇷 Frankreich',
      'ES': '🇪🇸 Spanien',
      'IT': '🇮🇹 Italien',
      'NL': '🇳🇱 Niederlande',
      'PL': '🇵🇱 Polen',
      'BR': '🇧🇷 Brasilien',
      'JP': '🇯🇵 Japan',
      'KR': '🇰🇷 Südkorea',
      'IN': '🇮🇳 Indien'
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
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                YouTube Trending Analyzer Pro
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
        {!results && (
          <div className="text-center py-12 mb-12">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Finde <span className="text-blue-600">echte</span> YouTube Trends
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Analysiere YouTube-Videos mit unserem intelligenten Trending-Algorithmus. 
              Nicht nur Views - echtes Engagement, Timing und Momentum.
            </p>
            
            <div className="flex justify-center gap-8 text-sm text-gray-500 mb-8">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                10-Punkte-System
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                15 Länder verfügbar
              </div>
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                CSV/Excel Export
              </div>
            </div>
          </div>
        )}

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              YouTube Trending Suche
            </CardTitle>
            <CardDescription>
              Suche nach einem Thema und entdecke die wirklich trending Videos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Main Search */}
              <div className="flex gap-2">
                <Input
                  placeholder="z.B. künstliche intelligenz, gaming, musik..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="text-lg"
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={loading || !searchQuery.trim()}
                  size="lg"
                >
                  {loading ? 'Suche...' : 'Analysieren'}
                </Button>
              </div>

              {/* Advanced Options */}
              <Tabs defaultValue="basic" className="w-full">
                <TabsList>
                  <TabsTrigger value="basic">Standard</TabsTrigger>
                  <TabsTrigger value="advanced">Erweitert</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium">Zeitraum</label>
                      <select 
                        className="w-full mt-1 p-2 border rounded"
                        value={searchParams.days}
                        onChange={(e) => setSearchParams(prev => ({ ...prev, days: Number(e.target.value) }))}
                      >
                        <option value={1}>Letzte 24 Stunden</option>
                        <option value={2}>Letzten 2 Tage</option>
                        <option value={7}>Letzte Woche</option>
                        <option value={30}>Letzten Monat</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Anzahl Ergebnisse</label>
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
                      <label className="text-sm font-medium">Mindestdauer</label>
                      <select 
                        className="w-full mt-1 p-2 border rounded"
                        value={searchParams.min_duration}
                        onChange={(e) => setSearchParams(prev => ({ ...prev, min_duration: Number(e.target.value) }))}
                      >
                        <option value={0}>Alle Videos</option>
                        <option value={60}>1+ Minuten</option>
                        <option value={240}>4+ Minuten</option>
                        <option value={600}>10+ Minuten</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">🌍 Region</label>
                      <select 
                        className="w-full mt-1 p-2 border rounded"
                        value={searchParams.region}
                        onChange={(e) => setSearchParams(prev => ({ ...prev, region: e.target.value }))}
                      >
                        <option value="">🌍 Weltweit</option>
                        <option value="DE">🇩🇪 Deutschland</option>
                        <option value="AT">🇦🇹 Österreich</option>
                        <option value="CH">🇨🇭 Schweiz</option>
                        <option value="US">🇺🇸 USA</option>
                        <option value="GB">🇬🇧 Großbritannien</option>
                        <option value="FR">🇫🇷 Frankreich</option>
                        <option value="ES">🇪🇸 Spanien</option>
                        <option value="IT">🇮🇹 Italien</option>
                        <option value="NL">🇳🇱 Niederlande</option>
                        <option value="PL">🇵🇱 Polen</option>
                        <option value="BR">🇧🇷 Brasilien</option>
                        <option value="JP">🇯🇵 Japan</option>
                        <option value="KR">🇰🇷 Südkorea</option>
                        <option value="IN">🇮🇳 Indien</option>
                      </select>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced">
                  <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded">
                    Weitere Optionen wie erweiterte Sortierung und Filterung kommen in Phase C
                  </div>
                </TabsContent>
              </Tabs>

              {/* Quick Search Examples */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-500">🚀 Beispiele:</span>
                {['KI', 'Gaming', 'Musik', 'Tech News', 'Krypto'].map((example) => (
                  <Button
                    key={example}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery(example)
                      setSearchParams(prev => ({ ...prev, query: example }))
                    }}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Analysiere YouTube Videos...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Results Header */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Trending Ergebnisse für &quot;{searchQuery}&quot;
                    </CardTitle>
                    <CardDescription>
                      {analysisInfo?.analyzed_videos} Videos analysiert • {results.length} Top Trending Videos gefunden • {getRegionName(searchParams.region || '')}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExportCSV}>
                      <Download className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                    <Button variant="outline" onClick={handleExportExcel}>
                      <Download className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Video Results - Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((video, index) => {
                const normalizedScore = parseFloat(calculateNormalizedScore(video.trending_score, results[0]?.trending_score || 1))
                return (
                  <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <CardContent className="p-0">
                      {/* Rank & Score Header */}
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                            #{video.rank}
                          </div>
                          <span className="text-sm opacity-90">Platz {video.rank}</span>
                        </div>
                        <Badge className={`${getScoreColor(normalizedScore)} text-white border-none`}>
                          {calculateNormalizedScore(video.trending_score, results[0]?.trending_score || 1)}/10
                        </Badge>
                      </div>

                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-gray-200">
                        <img 
                          src={video.thumbnail || `https://img.youtube.com/vi/${video.url.split('v=')[1]?.split('&')[0]}/maxresdefault.jpg`}
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
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                          {video.title}
                        </h3>

                        <p className="text-gray-600 text-sm flex items-center gap-1">
                          📺 {video.channel}
                        </p>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <Play className="h-3 w-3 text-gray-400" />
                            <span className="font-medium">{formatNumber(video.views)}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3 text-gray-400" />
                            <span className="font-medium">{formatNumber(video.likes)}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3 text-gray-400" />
                            <span className="font-medium">{formatNumber(video.comments)}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="font-medium">{video.age_hours}h alt</span>
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
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Info Box statt Algorithm Details */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    🎯 Intelligente Trend-Analyse
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Unsere KI analysiert nicht nur Views, sondern auch Engagement, Timing und Momentum für echte Trending-Videos.
                  </p>
                  <div className="flex justify-center gap-6 text-sm text-gray-500">
                    <div className="text-center">
                      <div className="font-semibold text-blue-600">{results.length}</div>
                      <div>Top Videos</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-blue-600">{analysisInfo?.analyzed_videos || 0}</div>
                      <div>Analysiert</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-blue-600">{new Date(analysisInfo?.timestamp || '').toLocaleTimeString()}</div>
                      <div>Letzte Analyse</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* CSS Styles */}
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
