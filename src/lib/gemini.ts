import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('Gemini API key not found. AI features will be disabled.');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export const gemini = {
  async generateSummary(content: string): Promise<string> {
    if (!genAI) throw new Error('Gemini API not configured');
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const prompt = `Please provide a concise summary of the following note content in 2-3 sentences. Focus on the main ideas and key takeaways:

${content}

Summary:`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating summary:', error);
      throw new Error('Failed to generate summary');
    }
  },

  async extractKeyPoints(content: string): Promise<string[]> {
    if (!genAI) throw new Error('Gemini API not configured');
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const prompt = `Extract 3-5 key points from the following note content. Return each point as a separate line starting with "•":

${content}

Key Points:`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      return text.split('\n').filter(line => line.trim().startsWith('•')).map(line => line.replace('•', '').trim());
    } catch (error) {
      console.error('Error extracting key points:', error);
      throw new Error('Failed to extract key points');
    }
  },

  async analyzeSentiment(content: string): Promise<string> {
    if (!genAI) throw new Error('Gemini API not configured');
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const prompt = `Analyze the emotional tone and mood of the following text based on Plutchik's Wheel of Emotions. Consider the language used, topics discussed, and overall emotional state conveyed.

Text to analyze:
"${content}"

Based on your analysis, classify the emotion as one of these specific emotions from the wheel of emotions:

PRIMARY EMOTIONS:
- "joy" - happiness, delight, celebration, bliss
- "trust" - acceptance, confidence, faith, admiration
- "fear" - anxiety, worry, terror, apprehension
- "surprise" - amazement, astonishment, wonder, bewilderment
- "sadness" - grief, melancholy, sorrow, despair
- "disgust" - revulsion, loathing, contempt, aversion
- "anger" - rage, fury, irritation, annoyance
- "anticipation" - excitement, eagerness, hope, expectation

SECONDARY EMOTIONS (combinations):
- "optimism" - anticipation + joy
- "love" - joy + trust
- "submission" - trust + fear
- "awe" - fear + surprise
- "disappointment" - surprise + sadness
- "remorse" - sadness + disgust
- "contempt" - disgust + anger
- "aggressiveness" - anger + anticipation

TERTIARY EMOTIONS (more nuanced):
- "serenity" - mild joy
- "ecstasy" - intense joy
- "acceptance" - mild trust
- "admiration" - intense trust
- "apprehension" - mild fear
- "terror" - intense fear
- "distraction" - mild surprise
- "amazement" - intense surprise
- "pensiveness" - mild sadness
- "grief" - intense sadness
- "boredom" - mild disgust
- "loathing" - intense disgust
- "annoyance" - mild anger
- "rage" - intense anger
- "interest" - mild anticipation
- "vigilance" - intense anticipation

Choose the most accurate emotion that matches the content. If the content is neutral or factual with no clear emotional tone, respond with "neutral".

Respond with only one word from the list above:`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const emotion = response.text().trim().toLowerCase();
      
      const validEmotions = [
        // Primary emotions
        'joy', 'trust', 'fear', 'surprise', 'sadness', 'disgust', 'anger', 'anticipation',
        // Secondary emotions
        'optimism', 'love', 'submission', 'awe', 'disappointment', 'remorse', 'contempt', 'aggressiveness',
        // Tertiary emotions
        'serenity', 'ecstasy', 'acceptance', 'admiration', 'apprehension', 'terror', 'distraction', 
        'amazement', 'pensiveness', 'grief', 'boredom', 'loathing', 'annoyance', 'rage', 'interest', 
        'vigilance', 'neutral'
      ];
      
      const foundEmotion = validEmotions.find(e => emotion.includes(e));
      return foundEmotion || 'neutral';
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return 'neutral';
    }
  },

  async suggestConnections(content: string, existingNotes: Array<{id: string, title: string, content: string}>): Promise<string[]> {
    if (!genAI || existingNotes.length === 0) return [];
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const notesContext = existingNotes.map(note => `Title: ${note.title}\nContent: ${note.content.substring(0, 200)}...`).join('\n\n');
    
    const prompt = `Given this new note content:
${content}

And these existing notes:
${notesContext}

Suggest which existing notes are most related to the new note. Look for:
- Similar topics or themes
- Related concepts or ideas
- Complementary information
- References to similar people, places, or events

Return only the note titles that are relevant, one per line:`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const suggestions = response.text().trim().split('\n').filter(line => line.trim());
      return suggestions.slice(0, 3); // Limit to top 3 suggestions
    } catch (error) {
      console.error('Error suggesting connections:', error);
      return [];
    }
  },

  async categorizeNote(content: string): Promise<string> {
    if (!genAI) throw new Error('Gemini API not configured');
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const prompt = `Analyze the following note content and categorize it into the most appropriate category. Look at the main topic, keywords, context, and purpose of the note.

Note content:
"${content}"

Choose the MOST FITTING category from these options based on the content:
- Work: Professional tasks, meetings, projects, career-related content, business matters
- Personal: Personal thoughts, experiences, relationships, daily life, family matters
- Ideas: Creative thoughts, brainstorming, innovations, concepts, inventions
- Research: Academic content, studies, investigations, learning materials, analysis
- Learning: Educational content, tutorials, courses, skill development, training
- Health: Fitness, wellness, medical, mental health, exercise, nutrition
- Finance: Money, investments, budgeting, financial planning, expenses
- Travel: Trips, places, travel planning, experiences, destinations

IMPORTANT: 
- Analyze the actual content carefully
- Choose the category that best matches the main theme
- If the content clearly fits multiple categories, choose the most prominent one
- Only return the exact category name (Work, Personal, Ideas, Research, Learning, Health, Finance, or Travel)
- Do not return "Other" or "Uncategorized"

Category:`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const category = response.text().trim();
      
      // Validate the category is one of our expected values
      const validCategories = ['Work', 'Personal', 'Ideas', 'Research', 'Learning', 'Health', 'Finance', 'Travel'];
      const foundCategory = validCategories.find(cat => 
        category.toLowerCase().includes(cat.toLowerCase())
      );
      
      return foundCategory || 'Personal'; // Default to Personal instead of Other
    } catch (error) {
      console.error('Error categorizing note:', error);
      return 'Personal'; // Default to Personal instead of Other
    }
  }
};