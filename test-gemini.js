import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log('API Key (first 10 chars):', apiKey?.substring(0, 10));

const genAI = new GoogleGenerativeAI(apiKey);

async function testModels() {
  const models = [
    'gemini-2.5-flash',
    'gemini-2.5-flash-preview',
    'gemini-2.5-flash-latest',
    'gemini-2.0-flash-exp',
    'gemini-2.5-pro-preview-03-25'
  ];
  
  const testPrompt = 'You are Swaraj AI. Respond in both Hindi and English naturally.';
  
  console.log('\n--- Testing latest Gemini models for bilingual support ---');
  
  for (const modelName of models) {
    try {
      console.log(`\nTesting ${modelName}...`);
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        systemInstruction: testPrompt
      });
      const result = await model.generateContent('Introduce yourself in Hinglish style');
      const response = await result.response;
      console.log(`✓ ${modelName} works!`);
      console.log('Response:', response.text().substring(0, 150));
      console.log('---');
    } catch (error) {
      console.log(`✗ ${modelName} failed:`, error.message);
    }
  }
}

testModels();
