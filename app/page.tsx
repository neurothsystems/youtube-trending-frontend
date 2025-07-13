'use client'

import React, { useState } from 'react'
import { Search, TrendingUp, Download, Play, Clock, ThumbsUp, MessageCircle } from 'lucide-react'

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
}

interface SearchParams {
  query: string;
  days?: number;
  top_count?: number;
  min_duration?: number;
  sort_by?: 'trending_score' | 'views' | 'engagement' | 'age';
}

interface AnalyzeResponse {
  success: boolean;
  query: string;
  analyzed_videos: number;
  top_videos: TrendingVideo[];
  algorithm: string;
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

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
};

const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

const exportCSV = async (params: SearchParams): Promise<void> => {
  const url = new URL('/export/csv', API_BASE);
  
  url.searchParams.append('query', params.query);
  url.searchParams.append('days', (params.days || 2).toString());
  url.searchParams.append('top_count', (params.top_count || 10).toString());
  
  if (params.min_duration) {
    url.searchParams.append('min_duration', params.min_duration.toString());
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Export failed: ${response.status}`);
  }
  
  const blob = await response.blob();
  const filename = `youtube_trending_${params.query}_${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(blob, filename);
};

const exportExcel = async (params: SearchParams): Promise<void> => {
  const url = new URL('/export/excel', API_BASE);
  
  url.searchParams.append('query', params.query);
  url.searchParams.append('days', (params.days || 2).toString());
  url.searchParams.append('top_count', (params.top_count || 10).toString());
  
  if (params.min_duration) {
    url.searchParams.append('min_duration', params.min_duration.toString());
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Export failed: ${response.status}`);
  }
  
  const blob = await response.blob();
  const filename = `youtube_trending_${params.query}_${new Date().toISOString().split('T')[0]}.xlsx`;
  downloadFile(blob, filename);
};

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

const Tabs = ({ children, defaultValue }: { children: React.ReactNode; defaultValue: string }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  return (
    <div className="w-full">
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

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    days: 2,
    top_count: 10,
    min_duration: 4
  })
  const [results, setResults] = useState<TrendingVideo[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisInfo, setAnalysisInfo] = useState<{
    analyzed_videos: number;
    algorithm: string;
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
          algorithm: response.algorithm,
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
      await exportCSV({ ...searchParams, query: searchQuery })
    } catch (err) {
      setError(`CSV Export fehlgeschlagen: ${err}`)
    }
  }

  const handleExportExcel = async () => {
    if (!results) return
    try {
      await exportExcel({ ...searchParams, query: searchQuery })
    } catch (err) {
      setError(`Excel Export fehlgeschlagen: ${err}`)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getScoreColor = (score: number) => {
    if (score > 100000) return 'bg-red-500'
    if (score > 50000) return 'bg-orange-500'
    if (score > 10000) return 'bg-yellow-500'
    return 'bg-green-500'
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
            <Button variant="outline" onClick={() => alert('In deinem echten Projekt: window.location.href = "/test"')}>
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
                Echter Trending-Score
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Echtzeit-Analyse
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <option value={5}>Top 5</option>
                        <option value={10}>Top 10</option>
                        <option value={20}>Top 20</option>
                        <option value={50}>Top 50</option>
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
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced">
                  <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded">
                    Weitere Optionen wie Sortierung, Sprache und Region kommen in v2.1
                  </div>
                </TabsContent>
              </Tabs>

              {/* Quick Search Examples */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-500">Beispiele:</span>
                {['KI', 'Gaming', 'Musik', 'Tech News', 'Krypto'].map((example) => (
                  <Button
                    key={example}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery(example)}
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
                      {analysisInfo?.analyzed_videos} Videos analysiert • {results.length} Top Trending Videos gefunden
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

            {/* Video Results */}
            <div className="space-y-4">
              {results.map((video, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      {/* Rank Badge */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                          #{video.rank}
                        </div>
                      </div>

                      {/* Video Info */}
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {video.title}
                          </h3>
                          <Badge 
                            className={`ml-2 text-white ${getScoreColor(video.trending_score)}`}
                          >
                            {Math.round(video.trending_score)} Score
                          </Badge>
                        </div>

                        <p className="text-gray-600 mb-3">📺 {video.channel}</p>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Play className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{formatNumber(video.views)}</span>
                            <span className="text-gray-500">Views</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{formatNumber(video.likes)}</span>
                            <span className="text-gray-500">Likes</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{formatNumber(video.comments)}</span>
                            <span className="text-gray-500">Kommentare</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{video.duration_formatted}</span>
                            <span className="text-gray-500">• {video.age_hours}h alt</span>
                          </div>
                        </div>

                        {/* Engagement Rate */}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-sm">
                            <span className="text-gray-500">Engagement: </span>
                            <span className="font-medium">{(video.engagement_rate * 100).toFixed(2)}%</span>
                          </div>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => alert(`In deinem echten Projekt öffnet sich: ${video.url}`)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Video ansehen
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Algorithm Info */}
            {analysisInfo && (
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-sm">Algorithmus-Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 font-mono">
                    {analysisInfo.algorithm}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Analyse durchgeführt: {new Date(analysisInfo.timestamp).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  )
}