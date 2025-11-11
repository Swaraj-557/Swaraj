
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// Creates a client
const client = new TextToSpeechClient();

export async function googleTTS(text: string, languageCode: string, name: string) {
  const request = {
    input: { text },
    // Select the language and SSML voice gender (optional)
    voice: { languageCode, name },
    // select the type of audio encoding
    audioConfig: { audioEncoding: 'MP3' as const },
  };

  try {
    // Performs the text-to-speech request
    const responses = await client.synthesizeSpeech(request);
    const response = responses[0];
    return response.audioContent;
  } catch (error) {
    console.error('ERROR:', error);
    throw new Error('Error generating speech');
  }
}
