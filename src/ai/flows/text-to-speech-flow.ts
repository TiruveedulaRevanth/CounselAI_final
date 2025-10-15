
'use server';
/**
 * @fileOverview A flow for converting text to speech using an advanced AI model.
 *
 * - textToSpeech - A function that accepts text and returns the audio data as a data URI.
 * - TextToSpeechInput - The input type for the textToSpeech function.
 * - TextToSpeechOutput - The return type for the textToSpeech function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';
import wav from 'wav';
import {
  TextToSpeechInputSchema,
  TextToSpeechOutputSchema,
} from '../schemas';
import type {
  TextToSpeechInput,
  TextToSpeechOutput,
} from '../schemas';

export type { TextToSpeechInput, TextToSpeechOutput };

export async function textToSpeech(
  input: TextToSpeechInput
): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(input);
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async ({ text, emotion }) => {
    // Define the voice based on emotion
    const isSoothing = emotion === 'Sadness' || emotion === 'Anxiety' || emotion === 'Hopelessness' || emotion === 'Shame/Guilt' || emotion === 'Tiredness/Exhaustion';
    const voiceName = isSoothing ? 'Algenib' : 'Achernar';

    try {
      const { media } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-preview-tts'),
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
        prompt: text,
      });

      if (!media || !media.url) {
        console.error('No audio data was returned from the TTS model.');
        return { audio: undefined };
      }

      // The audio data is Base64 encoded PCM. We need to decode it first.
      const pcmBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
      );

      // Convert the raw PCM buffer to a WAV buffer.
      const base64Wav = await toWav(pcmBuffer);

      if (!base64Wav) {
        console.error('Failed to convert PCM to WAV.');
        return { audio: undefined };
      }

      return {
        audio: `data:audio/wav;base64,${base64Wav}`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error in textToSpeechFlow (Gemini API):', errorMessage);
      // Return an empty audio object so the client can handle it gracefully
      return { audio: undefined };
    }
  }
);

/**
 * Converts raw PCM audio data into a Base64-encoded WAV string.
 */
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000, // Gemini TTS outputs at 24kHz
  sampleWidth = 2 // 16-bit audio
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8, // 16 bits
    });

    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (chunk) => bufs.push(chunk));
    writer.on('end', () => {
      const wavBuffer = Buffer.concat(bufs);
      resolve(wavBuffer.toString('base64'));
    });

    writer.end(pcmData);
  });
}

    