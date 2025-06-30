const DAPPIER_API_KEY = import.meta.env.VITE_DAPPIER_API_KEY;
const DAPPIER_BASE_URL = import.meta.env.VITE_DAPPIER_BASE_URL || 'https://api.dappier.com/v1';

interface DappierSearchResult {
  id: string;
  title: string;
  content: string;
  relevance: number;
  metadata?: Record<string, any>;
}

interface DappierCopilotResponse {
  response: string;
  confidence: number;
  sources: string[];
  suggestions: string[];
}

export const dappier = {
  async semanticSearch(query: string, documents: Array<{id: string, title: string, content: string}>): Promise<DappierSearchResult[]> {
    if (!DAPPIER_API_KEY || DAPPIER_API_KEY.trim() === '' || DAPPIER_API_KEY === 'your_dappier_api_key_here') {
      console.warn('Dappier API key not configured. Using fallback search.');
      return this.fallbackSearch(query, documents);
    }

    try {
      const response = await fetch(`${DAPPIER_BASE_URL}/search/semantic`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DAPPIER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          documents: documents.map(doc => ({
            id: doc.id,
            title: doc.title,
            content: doc.content.substring(0, 1000), // Limit content length
          })),
          limit: 10,
          threshold: 0.1,
        }),
      });

      if (!response.ok) {
        throw new Error(`Dappier API error: ${response.status}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Dappier semantic search error:', error);
      return this.fallbackSearch(query, documents);
    }
  },

  async askCopilot(question: string, context: string[]): Promise<DappierCopilotResponse> {
    if (!DAPPIER_API_KEY || DAPPIER_API_KEY.trim() === '' || DAPPIER_API_KEY === 'your_dappier_api_key_here') {
      throw new Error('Dappier API key not configured');
    }

    try {
      const response = await fetch(`${DAPPIER_BASE_URL}/copilot/ask`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DAPPIER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          context: context.slice(0, 5), // Limit context
          model: 'gpt-4',
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`Dappier API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        response: data.response || 'No response generated',
        confidence: data.confidence || 0.5,
        sources: data.sources || [],
        suggestions: data.suggestions || [],
      };
    } catch (error) {
      console.error('Dappier copilot error:', error);
      throw error;
    }
  },

  async generateInsights(notes: Array<{title: string, content: string, category?: string}>): Promise<string[]> {
    if (!DAPPIER_API_KEY || DAPPIER_API_KEY.trim() === '' || DAPPIER_API_KEY === 'your_dappier_api_key_here') {
      return [];
    }

    try {
      const response = await fetch(`${DAPPIER_BASE_URL}/insights/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DAPPIER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documents: notes.map(note => ({
            title: note.title,
            content: note.content.substring(0, 500),
            metadata: { category: note.category },
          })),
          insight_types: ['patterns', 'connections', 'recommendations'],
          limit: 5,
        }),
      });

      if (!response.ok) {
        throw new Error(`Dappier API error: ${response.status}`);
      }

      const data = await response.json();
      return data.insights || [];
    } catch (error) {
      console.error('Dappier insights error:', error);
      return [];
    }
  },

  // Fallback search using simple text matching
  fallbackSearch(query: string, documents: Array<{id: string, title: string, content: string}>): DappierSearchResult[] {
    const queryLower = query.toLowerCase();
    const results = documents
      .map(doc => {
        const titleMatch = doc.title.toLowerCase().includes(queryLower);
        const contentMatch = doc.content.toLowerCase().includes(queryLower);
        const relevance = (titleMatch ? 0.7 : 0) + (contentMatch ? 0.3 : 0);
        
        return {
          id: doc.id,
          title: doc.title,
          content: doc.content,
          relevance,
        };
      })
      .filter(result => result.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10);

    return results;
  },
};