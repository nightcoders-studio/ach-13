/**
 * Text-to-Speech handler using Gemini TTS model via Vertex AI.
 * Uses the generateContent endpoint with response_modalities: ["AUDIO"]
 */
import { GoogleAuth } from 'google-auth-library';
import fetch from 'node-fetch';

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

// Use us-central1 for TTS as it's only available in limited regions
const TTS_LOCATION = 'us-central1';
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

/**
 * Generate speech audio from text using Gemini TTS.
 * Returns raw PCM audio data (24kHz, 16-bit, mono) as a WAV file.
 */
export async function generateSpeech(req, res) {
  const { text, voiceName } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Bad Request', message: 'text is required.' });
  }

  if (text.length > 5000) {
    return res.status(400).json({ error: 'Bad Request', message: 'text must be 5000 characters or less.' });
  }

  const voice = voiceName || 'Kore';

  try {
    const authClient = await auth.getClient();
    const tokenResponse = await authClient.getAccessToken();
    const accessToken = tokenResponse.token;

    const apiUrl = `https://${TTS_LOCATION}-aiplatform.googleapis.com/v1/projects/${GOOGLE_CLOUD_PROJECT}/locations/${TTS_LOCATION}/publishers/google/models/${TTS_MODEL}:generateContent`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `Say in a warm, storytelling voice: ${text}` }],
        },
      ],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice,
            },
          },
        },
      },
    };

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Goog-User-Project': GOOGLE_CLOUD_PROJECT,
      },
      body: JSON.stringify(requestBody),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('[TTS] Vertex AI error:', apiResponse.status, errorText);
      return res.status(apiResponse.status).json({
        error: 'TTS Error',
        message: `Vertex AI returned ${apiResponse.status}`,
      });
    }

    const data = await apiResponse.json();

    // Extract audio data from response
    const candidate = data.candidates?.[0];
    const part = candidate?.content?.parts?.[0];

    if (!part?.inlineData?.data) {
      console.error('[TTS] No audio data in response:', JSON.stringify(data).substring(0, 500));
      return res.status(500).json({ error: 'TTS Error', message: 'No audio data returned from model.' });
    }

    // The response is base64-encoded PCM audio (24kHz, 16-bit, mono)
    const audioBase64 = part.inlineData.data;
    const pcmBuffer = Buffer.from(audioBase64, 'base64');

    // Create WAV header for PCM data (24kHz, 16-bit, mono)
    const wavBuffer = createWavBuffer(pcmBuffer, 24000, 1, 16);

    res.set({
      'Content-Type': 'audio/wav',
      'Content-Length': wavBuffer.length,
      'Cache-Control': 'public, max-age=3600',
    });

    res.send(wavBuffer);
  } catch (error) {
    console.error('[TTS] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown TTS error';
    res.status(500).json({ error: 'TTS Error', message });
  }
}

/**
 * Create a WAV file buffer from raw PCM data.
 */
function createWavBuffer(pcmData, sampleRate, numChannels, bitsPerSample) {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmData.length;
  const headerSize = 44;
  const fileSize = headerSize + dataSize;

  const buffer = Buffer.alloc(fileSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(fileSize - 8, 4);
  buffer.write('WAVE', 8);

  // fmt sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Sub-chunk size
  buffer.writeUInt16LE(1, 20); // Audio format (PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  pcmData.copy(buffer, 44);

  return buffer;
}
