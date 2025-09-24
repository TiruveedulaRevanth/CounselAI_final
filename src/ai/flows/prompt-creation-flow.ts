
'use server';

/**
 * @fileOverview An AI agent that provides empathetic and supportive responses based on user prompts describing their emotional state.
 *
 * - promptBasedEmotionalSupport - A function that accepts a user's description of their emotional state and returns an empathetic and supportive response.
 * - PromptBasedEmotionalSupportInput - The input type for the promptBasedEmotionalSupport function.
 * - PromptBasedEmotionalSupportOutput - The return type for the promptBasedEmotionalSupport function.
 */

import { ai } from '@/ai/genkit';
import {
  PromptBasedEmotionalSupportInputSchema,
  PromptBasedEmotionalSupportOutputSchema,
} from '../schemas';
import type {
  PromptBasedEmotionalSupportInput,
  PromptBasedEmotionalSupportOutput,
} from '../schemas';

export type {
  PromptBasedEmotionalSupportInput,
  PromptBasedEmotionalSupportOutput,
};

export async function promptBasedEmotionalSupport(
  input: PromptBasedEmotionalSupportInput
): Promise<PromptBasedEmotionalSupportOutput> {
  return promptBasedEmotionalSupportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'promptBasedEmotionalSupportPrompt',
  input: { schema: PromptBasedEmotionalSupportInputSchema },
  output: { schema: PromptBasedEmotionalSupportOutputSchema },
  prompt: `You are an AI assistant designed to provide empathetic and supportive responses to users describing their emotional state.  Please respond in a way that acknowledges their feelings and offers support. Always be kind, respectful, and encouraging.

User\'s description of their emotional state: {{{emotionalStateDescription}}}`,
});

const promptBasedEmotionalSupportFlow = ai.defineFlow(
  {
    name: 'promptBasedEmotionalSupportFlow',
    inputSchema: PromptBasedEmotionalSupportInputSchema,
    outputSchema: PromptBasedEmotionalSupportOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (output) {
        return output;
      }
      throw new Error('AI failed to generate a response.');
    } catch (error) {
      console.error('Error in promptBasedEmotionalSupportFlow:', error);
      return {
        response:
          "I'm sorry, I'm having a little trouble understanding. Could you please rephrase that?",
      };
    }
  }
);
