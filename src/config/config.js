// Configuration settings for the application
export const config = {
  api: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'
  },
  gemini: {
    apiKey: process.env.REACT_APP_GEMINI_API_KEY || '',
    model: 'gemini-pro'
  },

  // Task Configuration
  task: {
    timeframes: ['today', 'this week', 'long term'],
    defaultTimeframe: 'today',
    suggestions: {
      "Create": " a new marketing strategy",
      "Build": " a website prototype",
      "Plan": " team meeting agenda"
    }
  },

  // AI Insights Configuration
  insights: {
    defaultDuration: '3-5 days',
    recommendations: [
      'Consider breaking it into smaller milestones',
      'Similar tasks often require team collaboration'
    ]
  }
};