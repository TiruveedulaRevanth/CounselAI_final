
'use server';
/**
 * @fileOverview A flow for converting text to speech using an advanced AI model.
 *
 * - textToSpeech - A function that accepts text and returns the audio data as a data URI.
 * - TextToSpeechInput - The input type for the textToSpeech function.
 * - TextToSpeechOutput - The return type for the textToSpeech function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { InferenceClient } from '@huggingface/inference';

const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
  audio: z.string().describe("The generated audio as a data URI in WAV format. Expected format: 'data:audio/wav;base64,<encoded_data>'.").optional(),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;


export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(input);
}

const hf = new InferenceClient(process.env.HF_TOKEN);

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async ({ text }) => {
    try {
        const audioBlob = await hf.textToSpeech({
            model: 'ResembleAI/chatterbox',
            inputs: text,
            provider: 'fal-ai',
        });

        if (audioBlob) {
             const buffer = await audioBlob.arrayBuffer();
             const base64Audio = Buffer.from(buffer).toString('base64');
             return {
                audio: `data:audio/wav;base64,${base64Audio}`,
            };
        } else {
            console.error('No audio data was returned from the TTS model.');
            return { audio: undefined };
        }
    } catch(error) {
        console.error("Error in textToSpeechFlow (Hugging Face API):", error);
        // Return an empty audio object so the client can handle it gracefully
        return { audio: undefined };
    }
  }
);
