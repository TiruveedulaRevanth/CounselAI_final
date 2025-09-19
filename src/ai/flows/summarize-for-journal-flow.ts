
'use server';

/**
 * @fileOverview An AI agent that summarizes a user's message into a concise journal entry.
 *
 * - summarizeForJournal - A function that accepts a user's message and returns a short summary.
 * - SummarizeForJournalInput - The input type for the summarizeForJournal function.
 * - SummarizeForJournalOutput - The return type for the summarizeForJournal function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeForJournalInputSchema = z.object({
  message: z.string().describe('The user message to summarize for a journal entry.'),
});
export type SummarizeForJournalInput = z.infer<typeof SummarizeForJournalInputSchema>;

const SummarizeForJournalOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the user\'s message, approximately 20 words long.'),
});
export type SummarizeForJournalOutput = z.infer<typeof SummarizeForJournalOutputSchema>;

export async function summarizeForJournal(
  input: SummarizeForJournalInput
): Promise<SummarizeForJournalOutput> {
  return summarizeForJournalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeForJournalPrompt',
  input: {schema: SummarizeForJournalInputSchema},
  output: {schema: SummarizeForJournalOutputSchema},
  prompt: `Summarize the following user message into a concise journal entry of approximately 20 words. Capture the core emotional and topical essence of the message.

User Message: {{{message}}}`,
});

const summarizeForJournalFlow = ai.defineFlow(
  {
    name: 'summarizeForJournalFlow',
    inputSchema: SummarizeForJournalInputSchema,
    outputSchema: SummarizeForJournalOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await prompt(input);
      if (output) {
        return output;
      }
    } catch (error) {
       console.error("Error in summarizeForJournalFlow:", error);
    }
    // Return a truncated version of the original message as a fallback.
    return { summary: input.message.substring(0, 100) + '...' };
  }
);
