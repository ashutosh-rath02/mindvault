const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY.trim() === '' || ELEVENLABS_API_KEY === 'your_elevenlabs_api_key_here') {
    throw new Error('ElevenLabs API key not configured. Please add VITE_ELEVENLABS_API_KEY to your .env file.');
  }

  try {
    // Convert webm to wav for better compatibility
    const audioBuffer = await audioBlob.arrayBuffer();
    const audioFile = new File([audioBuffer], 'recording.webm', { type: 'audio/webm' });

    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model_id', 'scribe_v1');

    const response = await fetch(`${ELEVENLABS_API_URL}/speech-to-text`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail?.message || 
        errorData.message || 
        `ElevenLabs API error: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.text || result.transcript || '';
  } catch (error) {
    console.error('ElevenLabs transcription error:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to transcribe audio with ElevenLabs');
  }
}

export async function generateSpeech(text: string, voiceId: string = 'pNInz6obpgDQGcFmaJgB'): Promise<Blob> {
  if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY.trim() === '' || ELEVENLABS_API_KEY === 'your_elevenlabs_api_key_here') {
    throw new Error('ElevenLabs API key not configured. Please add VITE_ELEVENLABS_API_KEY to your .env file.');
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail?.message || 
        errorData.message || 
        `ElevenLabs API error: ${response.status} ${response.statusText}`
      );
    }

    return await response.blob();
  } catch (error) {
    console.error('ElevenLabs speech generation error:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to generate speech with ElevenLabs');
  }
}