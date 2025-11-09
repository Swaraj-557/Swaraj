import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log('API Key (first 10 chars):', apiKey?.substring(0, 10));

const genAI = new GoogleGenerativeAI(apiKey);

async function testModels() {
  const testPrompt = 'You are Swaraj AI. Speak like a chill Indian developer. Keep it short.';
  
  console.log('\n--- Testing systemInstruction support ---');
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      systemInstruction: testPrompt
    });
    const result = await model.generateContent('Who are you?');
    const response = await result.response;
    console.log('✓ systemInstruction works!');
    console.log('Response:', response.text().substring(0, 100));
  } catch (error) {
    console.log('✗ systemInstruction failed:', error.message);
  }
}

testModels();
