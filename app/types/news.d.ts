export interface BONKNewsArticle {
  id: string;
  title: string;
  summary: string;
  link: string;
  source: string;
  published: string;
  category: string;
  subCategory: string;
  relativeTime: string;
  media?: string | null; // URL to article thumbnail/image
  sentiment: {
    label: 'positive' | 'negative' | 'neutral';
    score: number; // 0-1 scale
  };
  sourceCount: number;
  readingTime: string;
  language?: string;
  timeZone?: string;
}

export interface BONKNewsResponse {
  articles: BONKNewsArticle[];
  total: number;
  page: number;
  limit: number;
  timeFrame: string;
  lastUpdated: string;
  error?: string;
  isFallback?: boolean;
}

export interface SentimentDisplay {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  text: string;
}
