require('dotenv').config();
const axios = require('axios');

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  console.log('API Key exists:', !!apiKey);
  console.log('API Key length:', apiKey ? apiKey.length : 0);
  console.log('API Key preview:', apiKey ? apiKey.substring(0, 10) + '...\n':0);
  
  try {
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    console.log('✅ Available models for your API key:\n');
    
    response.data.models.forEach(model => {
      if (model.supportedGenerationMethods && 
          model.supportedGenerationMethods.includes('generateContent')) {
        console.log(`Model: ${model.name}`);
        console.log(`  Display Name: ${model.displayName}`);
        console.log(`  Supports: ${model.supportedGenerationMethods.join(', ')}`);
        console.log('---');
      }
    });
    
  } catch (error) {
    console.log('❌ Failed to list models');
    if (error.response) {
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

listModels();