import axios from 'axios';

export class NewsService {
  private apiKey: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.apiKey = process.env.NEWS_API_KEY || '';
  }

  async getNews(topic: string = 'technology', limit: number = 5): Promise<any> {
    // Check cache
    const cacheKey = `${topic}_${limit}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`📰 Using cached news for: "${topic}"`);
      return cached.data;
    }

    if (!this.apiKey) {
      console.log('⚠️  NewsAPI not configured, returning fallback');
      return this.getFallbackNews(topic);
    }

    try {
      const url = 'https://newsapi.org/v2/everything';
      const response = await axios.get(url, {
        params: {
          apiKey: this.apiKey,
          q: topic,
          pageSize: limit,
          sortBy: 'publishedAt',
          language: 'en',
        },
      });

      const news = {
        topic,
        articles: response.data.articles?.map((article: any) => ({
          title: article.title,
          description: article.description,
          url: article.url,
          source: article.source.name,
          publishedAt: article.publishedAt,
        })) || [],
      };

      // Cache the results
      this.cache.set(cacheKey, { data: news, timestamp: Date.now() });

      return news;
    } catch (error) {
      console.error('News fetch error:', error);
      return this.getFallbackNews(topic);
    }
  }

  async getTopHeadlines(category: string = 'technology', limit: number = 5): Promise<any> {
    if (!this.apiKey) {
      return this.getFallbackNews(category);
    }

    try {
      const url = 'https://newsapi.org/v2/top-headlines';
      const response = await axios.get(url, {
        params: {
          apiKey: this.apiKey,
          category,
          pageSize: limit,
          country: 'in', // India
        },
      });

      return {
        category,
        articles: response.data.articles?.map((article: any) => ({
          title: article.title,
          description: article.description,
          url: article.url,
          source: article.source.name,
          publishedAt: article.publishedAt,
        })) || [],
      };
    } catch (error) {
      console.error('Headlines fetch error:', error);
      return this.getFallbackNews(category);
    }
  }

  private getFallbackNews(topic: string): any {
    return {
      topic,
      fallback: true,
      newsUrl: `https://news.google.com/search?q=${encodeURIComponent(topic)}`,
      message: 'Opening Google News in browser',
    };
  }
}
