
'use server';
/**
 * @fileOverview A unified flow that generates a personalized text response and its corresponding audio in parallel.
 *
 * - generateResponseAndAudio - A function that takes user input and context, and returns both the text response and audio data.
 * - GenerateResponseAndAudioInput - The input type for the function.
 * - GenerateResponseAndAudioOutput - The return type for the function.
 */

import { personalizeTherapyStyle } from './therapy-style-personalization';
import { textToSpeech } from './text-to-speech-flow';
import { ai } from '@/ai/genkit';
import {
  GenerateResponseAndAudioInputSchema,
  GenerateResponseAndAudioOutputSchema,
} from '../schemas/journal-entry';
import type {
  GenerateResponseAndAudioInput,
  GenerateResponseAndAudioOutput,
} from '../schemas/journal-entry';

export type {
  GenerateResponseAndAudioInput,
  GenerateResponseAndAudioOutput,
};

export async function generateResponseAndAudio(
  input: GenerateResponseAndAudioInput
): Promise<GenerateResponseAndAudioOutput> {
  return generateResponseAndAudioFlow(input);
}

const generateResponseAndAudioFlow = ai.defineFlow(
  {
    name: 'generateResponseAndAudioFlow',
    inputSchema: GenerateResponseAndAudioInputSchema,
    outputSchema: GenerateResponseAndAudioOutputSchema,
  },
  async ({ personalizationInput }) => {
    // 1. Generate the text response and detect emotion
    const textResult = await personalizeTherapyStyle(personalizationInput);

    if (textResult.needsHelp) {
      return {
        textResponse: textResult.response,
        needsHelp: true,
      };
    }

    // 2. In parallel, start generating the audio for the text response
    const audioPromise = textToSpeech({
      text: textResult.response,
      emotion: textResult.detectedEmotion,
    });

    // 3. Wait for the audio to be ready
    const audioResult = await audioPromise;

    // 4. Return both text and audio together
    return {
      textResponse: textResult.response,
      audioResponse: audioResult.audio,
      needsHelp: false,
    };
  }
);
