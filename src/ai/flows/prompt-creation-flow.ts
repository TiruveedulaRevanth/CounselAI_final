'use server';

/**
 * @fileOverview An AI agent that provides empathetic and supportive responses based on user prompts describing their emotional state.
 *
 * - promptBasedEmotionalSupport - A function that accepts a user's description of their emotional state and returns an empathetic and supportive response.
 * - PromptBasedEmotionalSupportInput - The input type for the promptBasedEmotionalSupport function.
 * - PromptBasedEmotionalSupportOutput - The return type for the promptBasedEmotionalSupport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PromptBasedEmotionalSupportInputSchema = z.object({
  emotionalStateDescription: z
    .string()
    .describe('A description of the user\'s current emotional state.'),
});
export type PromptBasedEmotionalSupportInput = z.infer<typeof PromptBasedEmotionalSupportInputSchema>;

const PromptBasedEmotionalSupportOutputSchema = z.object({
  response: z
    .string()
    .describe('An empathetic and supportive response from the AI.'),
});
export type PromptBasedEmotionalSupportOutput = z.infer<typeof PromptBasedEmotionalSupportOutputSchema>;

export async function promptBasedEmotionalSupport(
  input: PromptBasedEmotionalSupportInput
): Promise<PromptBasedEmotionalSupportOutput> {
  return promptBasedEmotionalSupportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'promptBasedEmotionalSupportPrompt',
  input: {schema: PromptBasedEmotionalSupportInputSchema},
  output: {schema: PromptBasedEmotionalSupportOutputSchema},
  prompt: `You are an AI assistant designed to provide empathetic and supportive responses to users describing their emotional state.  Please respond in a way that acknowledges their feelings and offers support. Always be kind, respectful, and encouraging.

User\'s description of their emotional state: {{{emotionalStateDescription}}}`,
});

const promptBasedEmotionalSupportFlow = ai.defineFlow(
  {
    name: 'promptBasedEmotionalSupportFlow',
    inputSchema: PromptBasedEmotionalSupportInputSchema,
    outputSchema: PromptBasedEmotionalSupportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
