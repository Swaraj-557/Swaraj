import axios from 'axios';

export class SearchService {
  private apiKey: string;
  private searchEngineId: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1 hour

  constructor() {
    this.apiKey = process.env.GOOGLE_SEARCH_API_KEY || '';
    this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID || '';
  }

  async search(query: string, limit: number = 5): Promise<any> {
    // Check cache
    const cacheKey = `${query}_${limit}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`🔍 Using cached search results for: "${query}"`);
      return cached.data;
    }

    if (!this.apiKey || !this.searchEngineId) {
      console.log('⚠️  Google Search API not configured, returning fallback');
      return this.getFallbackSearchResult(query);
    }

    try {
      const url = 'https://www.googleapis.com/customsearch/v1';
      const response = await axios.get(url, {
        params: {
          key: this.apiKey,
          cx: this.searchEngineId,
          q: query,
          num: limit,
        },
      });

      const results = {
        query,
        items: response.data.items?.map((item: any) => ({
          title: item.title,
          link: item.link,
          snippet: item.snippet,
        })) || [],
      };

      // Cache the results
      this.cache.set(cacheKey, { data: results, timestamp: Date.now() });

      return results;
    } catch (error) {
      console.error('Search error:', error);
      return this.getFallbackSearchResult(query);
    }
  }

  private getFallbackSearchResult(query: string): any {
    return {
      query,
      fallback: true,
      searchUrl: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      message: 'Opening Google search in browser',
    };
  }
}
