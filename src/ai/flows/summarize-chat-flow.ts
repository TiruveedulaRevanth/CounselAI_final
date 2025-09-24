
'use server';

/**
 * @fileOverview An AI agent that summarizes a user's initial message into a short, meaningful chat title.
 *
 * - summarizeChat - A function that accepts a user's message and returns a concise title.
 * - SummarizeChatInput - The input type for the summarizeChat function.
 * - SummarizeChatOutput - The return type for the summarizeChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeChatInputSchema = z.object({
  message: z.string().describe('The initial user message to summarize.'),
});
export type SummarizeChatInput = z.infer<typeof SummarizeChatInputSchema>;

const SummarizeChatOutputSchema = z.object({
  title: z
    .string()
    .describe('A short, meaningful title for the chat (3-5 words).'),
});
export type SummarizeChatOutput = z.infer<typeof SummarizeChatOutputSchema>;

export async function summarizeChat(
  input: SummarizeChatInput
): Promise<SummarizeChatOutput> {
  return summarizeChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeChatPrompt',
  input: {schema: SummarizeChatInputSchema},
  output: {schema: SummarizeChatOutputSchema},
  prompt: `Summarize the following user message into a short, meaningful title of 3 to 5 words. This title will be used in a chat list.

User Message: {{{message}}}`,
});

const summarizeChatFlow = ai.defineFlow(
  {
    name: 'summarizeChatFlow',
    inputSchema: SummarizeChatInputSchema,
    outputSchema: SummarizeChatOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await prompt(input);
      // Ensure there is a valid output, otherwise provide a fallback.
      if (output?.title) {
        return output;
      }
    } catch (error) {
       console.error("Error in summarizeChatFlow:", error);
    }
    // Return a default title if the AI fails to generate one or returns an empty response.
    return { title: "New Chat" };
  }
);
