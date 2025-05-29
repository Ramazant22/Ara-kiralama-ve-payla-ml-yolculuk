require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 5000,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/carsharing',
    JWT_SECRET: process.env.JWT_SECRET || 'your-jwt-secret-key-here',
    JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
    NODE_ENV: process.env.NODE_ENV || 'development',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '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',
    
    // AI Model Configuration
    AI_MODELS: {
        // Current active model for main chat
        CHAT_MODEL: process.env.AI_CHAT_MODEL || 'openai/gpt-4o-mini',
        
        // Available model options
        AVAILABLE_MODELS: {
            // OpenAI models (best Turkish support)
            'openai/gpt-4o-mini': {
                name: 'GPT-4o Mini',
                provider: 'OpenAI',
                quality: 'High',
                speed: 'Fast',
                cost: 'Low',
                turkish_support: 'Excellent'
            },
            'openai/gpt-4o': {
                name: 'GPT-4o',
                provider: 'OpenAI', 
                quality: 'Highest',
                speed: 'Medium',
                cost: 'Medium',
                turkish_support: 'Excellent'
            },
            'openai/gpt-3.5-turbo': {
                name: 'GPT-3.5 Turbo',
                provider: 'OpenAI',
                quality: 'Good',
                speed: 'Very Fast',
                cost: 'Very Low',
                turkish_support: 'Good'
            },
            
            // Anthropic models
            'anthropic/claude-3-haiku': {
                name: 'Claude 3 Haiku',
                provider: 'Anthropic',
                quality: 'High',
                speed: 'Fast',
                cost: 'Low',
                turkish_support: 'Good'
            },
            'anthropic/claude-3-sonnet': {
                name: 'Claude 3 Sonnet',
                provider: 'Anthropic',
                quality: 'Very High',
                speed: 'Medium',
                cost: 'Medium',
                turkish_support: 'Good'
            },
            
            // Google models
            'google/gemini-pro': {
                name: 'Gemini Pro',
                provider: 'Google',
                quality: 'High',
                speed: 'Fast',
                cost: 'Low',
                turkish_support: 'Good'
            },
            'google/gemma-2-9b-it:free': {
                name: 'Gemma 2 9B (Free)',
                provider: 'Google',
                quality: 'Medium',
                speed: 'Fast',
                cost: 'Free',
                turkish_support: 'Fair'
            },
            
            // Mistral models
            'mistralai/mixtral-8x7b-instruct:free': {
                name: 'Mixtral 8x7B (Free)',
                provider: 'Mistral',
                quality: 'Good',
                speed: 'Fast',
                cost: 'Free',
                turkish_support: 'Fair'
            },
            'mistralai/mistral-7b-instruct:free': {
                name: 'Mistral 7B (Free)',
                provider: 'Mistral',
                quality: 'Fair',
                speed: 'Very Fast',
                cost: 'Free',
                turkish_support: 'Fair'
            }
        }
    }
}; 