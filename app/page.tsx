'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Search, TrendingUp, Download, Play, Clock, ThumbsUp, MessageCircle, Globe } from 'lucide-react'

// API Configuration
const API_BASE = 'https://youtube-trending-api-kc53.onrender.com'

// Type Definitions
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
  error?: string;
  message?: string;
}

interface AnalysisInfo {
  analyzed_videos: number;
  timestamp: string;
  parameters?: SearchParams;
}

// Utility Functions (moved to top to avoid hoisting issues)
const calculateNormalizedScore = (currentScore: number, topScore: number): string => {
  if (!topScore || topScore === 0) return "0.0"
  const normalized = (currentScore / topScore) * 10
  return Math.max(0, Math.min(10, normalized)).toFixed(1)
}

const formatNumber = (num: number): string => {
  if (!num || isNaN(num)) return "0"
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const extractVideoId = (url: string): string => {
  try {
    const match = url.match(/[?&]v=([^&]+)/)
    return match?.[1] || 'default'
  } catch {
    return 'default'
  }
}

const generateThumbnailUrl = (url: string, fallbackThumbnail?: string): string => {
  if (fallbackThumbnail) return fallbackThumbnail
  const videoId = extractVideoId(url)
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
}

const getScoreColor = (normalizedScore: number): string => {
  if (normalizedScore >= 8) return 'bg-green-500'
  if (normalizedScore >= 6) return 'bg-yellow-500'
  if (normalizedScore >= 4) return 'bg-orange-500'
  return 'bg-red-500'
}

// API Functions
const analyzeVideos = async (params: SearchParams): Promise<AnalyzeResponse> => {
  try {
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

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// CSV Export Functions
const convertResultsToCSV = (videos: TrendingVideo[]): string => {
  if (!videos || videos.length === 0) {
    throw new Error('Keine Videos zum Exportieren verfügbar');
  }

  const topScore = videos[0]?.trending_score || 1;
  
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
  
  const rows = videos.map((video) => [
    video.rank || 0,
    `"${(video.title || 'Unbekannt').replace(/"/g, '""')}"`,
    `"${(video.channel || 'Unbekannt').replace(/"/g, '""')}"`,
    video.views || 0,
    video.likes || 0,
    video.comments || 0,
    calculateNormalizedScore(video.trending_score || 0, topScore),
    video.age_hours || 0,
    video.duration_formatted || '00:00',
    ((video.engagement_rate || 0) * 100).toFixed(2) + '%',
    video.url || '',
    video.thumbnail || ''
  ].join(','))
  
  return [headers, ...rows].join('\n')
}

const downloadCSVContent = (csvContent: string, filename: string): void => {
  try {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    
    // Cleanup
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }, 100)
  } catch (error) {
    console.error('Download Error:', error)
    throw new Error('Download fehlgeschlagen')
  }
}

// UI Components
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'default', 
  size = 'default',
  className = '',
  type = 'button'
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50';
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100'
  };
  const sizes = {
    default: 'h-10 px-4 py-2 text-sm',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-12 px-8 text-base'
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
};

interface InputProps {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  type?: string;
  id?: string;
  'aria-label'?: string;
}

const Input: React.FC<InputProps> = ({ 
  placeholder, 
  value, 
  onChange, 
  onKeyPress,
  className = '',
  disabled = false,
  type = 'text',
  id,
  'aria-label': ariaLabel
}) => (
  <input
    type={type}
    id={id}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    onKeyPress={onKeyPress}
    disabled={disabled}
    aria-label={ariaLabel}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
);

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col space-y-1.5 p-6 pb-4">
    {children}
  </div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm text-gray-600">
    {children}
  </p>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const Badge: React.FC<{ 
  children: React.ReactNode; 
  variant?: 'default' | 'destructive';
  className?: string;
}> = ({ children, variant = 'default', className = '' }) => {
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

// Tabs Components
interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

const Tabs: React.FC<{ children: React.ReactNode; defaultValue: string; className?: string }> = ({ children, defaultValue, className = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  const contextValue = useMemo(() => ({ activeTab, setActiveTab }), [activeTab]);
  
  return (
    <TabsContext.Provider value={contextValue}>
      <div className={`w-full ${className}`}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-600" role="tablist">
    {children}
  </div>
);

const TabsTrigger: React.FC<{ value: string; children: React.ReactNode }> = ({ value, children }) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');
  
  const { activeTab, setActiveTab } = context;
  
  return (
    <button 
      type="button"
      role="tab"
      aria-selected={activeTab === value}
      onClick={() => setActiveTab(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        activeTab === value 
          ? 'bg-white text-gray-900 shadow-sm' 
          : 'hover:bg-white hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  );
};

const TabsContent: React.FC<{ value: string; children: React.ReactNode; className?: string }> = ({ value, children, className = '' }) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');
  
  const { activeTab } = context;
  
  return (
    <div 
      role="tabpanel"
      className={`mt-2 ${activeTab === value ? 'block' : 'hidden'} ${className}`}
    >
      {children}
    </div>
  );
};

// Main Component
export default function HomePage() {
  // State Management
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
  const [analysisInfo, setAnalysisInfo] = useState<AnalysisInfo | null>(null)

  // Memoized Values
  const regionMapping = useMemo(() => ({
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
  }), []);

  const getRegionName = useCallback((code: string): string => {
    return regionMapping[code as keyof typeof regionMapping] || '🌍 Weltweit';
  }, [regionMapping]);

  // Event Handlers
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setError('Bitte geben Sie einen Suchbegriff ein');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const params = { ...searchParams, query: searchQuery.trim() };
      const response = await analyzeVideos(params);
      
      if (response.success && response.top_videos) {
        setResults(response.top_videos);
        setAnalysisInfo({
          analyzed_videos: response.analyzed_videos,
          timestamp: response.timestamp,
          parameters: response.parameters
        });
      } else {
        throw new Error(response.error || response.message || 'Unbekannter Fehler');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler bei der Suche';
      setError(errorMessage);
      console.error('Search Error:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, searchParams]);

  const handleExportCSV = useCallback(async () => {
    if (!results || results.length === 0) {
      setError('Keine Ergebnisse zum Exportieren verfügbar');
      return;
    }
    
    try {
      const csvContent = convertResultsToCSV(results);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `youtube_trending_${searchQuery.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.csv`;
      downloadCSVContent(csvContent, filename);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'CSV Export fehlgeschlagen';
      setError(errorMessage);
      console.error('CSV Export Error:', err);
    }
  }, [results, searchQuery]);

  const handleExportExcel = useCallback(async () => {
    // For now, export as CSV (Excel functionality can be added later)
    await handleExportCSV();
  }, [handleExportCSV]);

  const handleExampleSearch = useCallback((example: string) => {
    setSearchQuery(example);
    setSearchParams(prev => ({ ...prev, query: example }));
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      handleSearch();
    }
  }, [handleSearch, loading]);

  // Render Functions
  const renderVideoCard = useCallback((video: TrendingVideo) => {
    if (!video || !video.url) return null;
    
    const topScore = results?.[0]?.trending_score || 1;
    const normalizedScore = parseFloat(calculateNormalizedScore(video.trending_score || 0, topScore));
    const thumbnailUrl = generateThumbnailUrl(video.url, video.thumbnail);
    
    return (
      <Card key={`${video.url}-${video.rank}`} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
        <CardContent className="p-0">
          {/* Rank & Score Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                #{video.rank || 0}
              </div>
              <span className="text-sm opacity-90">Platz {video.rank || 0}</span>
            </div>
            <Badge className={`${getScoreColor(normalizedScore)} text-white border-none`}>
              {calculateNormalizedScore(video.trending_score || 0, topScore)}/10
            </Badge>
          </div>

          {/* Thumbnail */}
          <div className="relative aspect-video bg-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={thumbnailUrl}
              alt={`Thumbnail für ${video.title || 'YouTube Video'}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/320x180/f3f4f6/9ca3af?text=YouTube+Video';
              }}
              loading="lazy"
            />
            <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm">
              {video.duration_formatted || '00:00'}
            </div>
          </div>

          {/* Video Info */}
          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2" title={video.title}>
              {video.title || 'Unbekannter Titel'}
            </h3>

            <p className="text-gray-600 text-sm flex items-center gap-1" title={video.channel}>
              📺 {video.channel || 'Unbekannter Kanal'}
            </p>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1" title={`${video.views || 0} Aufrufe`}>
                <Play className="h-3 w-3 text-gray-400" aria-hidden="true" />
                <span className="font-medium">{formatNumber(video.views || 0)}</span>
              </div>
              
              <div className="flex items-center gap-1" title={`${video.likes || 0} Likes`}>
                <ThumbsUp className="h-3 w-3 text-gray-400" aria-hidden="true" />
                <span className="font-medium">{formatNumber(video.likes || 0)}</span>
              </div>
              
              <div className="flex items-center gap-1" title={`${video.comments || 0} Kommentare`}>
                <MessageCircle className="h-3 w-3 text-gray-400" aria-hidden="true" />
                <span className="font-medium">{formatNumber(video.comments || 0)}</span>
              </div>
              
              <div className="flex items-center gap-1" title={`${video.age_hours || 0} Stunden alt`}>
                <Clock className="h-3 w-3 text-gray-400" aria-hidden="true" />
                <span className="font-medium">{video.age_hours || 0}h alt</span>
              </div>
            </div>

            {/* Action Button */}
            <Button 
              className="w-full" 
              size="sm"
              onClick={() => {
                if (video.url) {
                  window.open(video.url, '_blank', 'noopener,noreferrer');
                }
              }}
              aria-label={`Video "${video.title}" auf YouTube öffnen`}
            >
              <Play className="h-4 w-4 mr-2" aria-hidden="true" />
              Video ansehen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }, [results]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-600" aria-hidden="true" />
              <h1 className="text-2xl font-bold text-gray-900">
                YouTube Trending Analyzer Pro
              </h1>
            </div>
            <Button 
              variant="outline" 
              onClick={() => window.open('https://youtube-trending-api-kc53.onrender.com', '_blank', 'noopener,noreferrer')}
              aria-label="System Test öffnen"
            >
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
                <TrendingUp className="h-4 w-4" aria-hidden="true" />
                10-Punkte-System
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" aria-hidden="true" />
                15 Länder verfügbar
              </div>
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" aria-hidden="true" />
                CSV/Excel Export
              </div>
            </div>
          </div>
        )}

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" aria-hidden="true" />
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
                  onKeyPress={handleKeyPress}
                  className="text-lg"
                  disabled={loading}
                  aria-label="Suchbegriff eingeben"
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={loading || !searchQuery.trim()}
                  size="lg"
                  aria-label={loading ? 'Suche läuft...' : 'Suche starten'}
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
                      <label htmlFor="days-select" className="text-sm font-medium block mb-1">Zeitraum</label>
                      <select 
                        id="days-select"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={searchParams.days}
                        onChange={(e) => setSearchParams(prev => ({ ...prev, days: Number(e.target.value) }))}
                        disabled={loading}
                      >
                        <option value={1}>Letzte 24 Stunden</option>
                        <option value={2}>Letzten 2 Tage</option>
                        <option value={7}>Letzte Woche</option>
                        <option value={30}>Letzten Monat</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="count-select" className="text-sm font-medium block mb-1">Anzahl Ergebnisse</label>
                      <select 
                        id="count-select"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={searchParams.top_count}
                        onChange={(e) => setSearchParams(prev => ({ ...prev, top_count: Number(e.target.value) }))}
                        disabled={loading}
                      >
                        <option value={6}>Top 6</option>
                        <option value={12}>Top 12</option>
                        <option value={18}>Top 18</option>
                        <option value={24}>Top 24</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="duration-select" className="text-sm font-medium block mb-1">Mindestdauer</label>
                      <select 
                        id="duration-select"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={searchParams.min_duration}
                        onChange={(e) => setSearchParams(prev => ({ ...prev, min_duration: Number(e.target.value) }))}
                        disabled={loading}
                      >
                        <option value={0}>Alle Videos</option>
                        <option value={60}>1+ Minuten</option>
                        <option value={240}>4+ Minuten</option>
                        <option value={600}>10+ Minuten</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="region-select" className="text-sm font-medium block mb-1">🌍 Region</label>
                      <select 
                        id="region-select"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={searchParams.region}
                        onChange={(e) => setSearchParams(prev => ({ ...prev, region: e.target.value }))}
                        disabled={loading}
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
                    onClick={() => handleExampleSearch(example)}
                    disabled={loading}
                    aria-label={`Beispielsuche: ${example}`}
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
          <Card className="mb-8 border-red-200 bg-red-50" role="alert">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <span className="text-red-600 font-medium">Fehler:</span>
                <p className="text-red-600">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8" role="status" aria-live="polite">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" aria-hidden="true"></div>
                <span className="ml-3 text-gray-600">Analysiere YouTube Videos...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results && results.length > 0 && (
          <div className="space-y-6">
            {/* Results Header */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" aria-hidden="true" />
                      Trending Ergebnisse für &quot;{searchQuery}&quot;
                    </CardTitle>
                    <CardDescription>
                      {analysisInfo?.analyzed_videos || 0} Videos analysiert • {results.length} Top Trending Videos gefunden • {getRegionName(searchParams.region || '')}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExportCSV} aria-label="Als CSV exportieren">
                      <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                      CSV
                    </Button>
                    <Button variant="outline" onClick={handleExportExcel} aria-label="Als Excel exportieren">
                      <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                      Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Video Results - Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="grid">
              {results.map(renderVideoCard)}
            </div>

            {/* Info Box */}
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
                      <div className="font-semibold text-blue-600">
                        {analysisInfo?.timestamp ? new Date(analysisInfo.timestamp).toLocaleTimeString() : '--:--'}
                      </div>
                      <div>Letzte Analyse</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty Results State */}
        {results && results.length === 0 && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Keine Ergebnisse gefunden
                </h3>
                <p className="text-gray-600 mb-4">
                  Für &quot;{searchQuery}&quot; in {getRegionName(searchParams.region || '')} wurden keine Videos gefunden.
                </p>
                <Button onClick={() => setSearchParams(prev => ({ ...prev, region: '' }))}>
                  Weltweit suchen
                </Button>
              </div>
            </CardContent>
          </Card>
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
