'use server';

/**
 * @fileOverview Personalizes the AI's therapeutic approach based on a text-defined therapy style.
 *
 * - personalizeTherapyStyle - A function that personalizes the therapy style.
 * - PersonalizeTherapyStyleInput - The input type for the personalizeTherapyStyle function.
 * - PersonalizeTherapyStyleOutput - The return type for the personalizeTherapyStyle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizeTherapyStyleInputSchema = z.object({
  therapyStyle: z
    .string()
    .describe(
      'A description of the desired therapy style, including techniques and approaches.'
    ),
  userInput: z.string().describe('The user input or question.'),
});
export type PersonalizeTherapyStyleInput = z.infer<
  typeof PersonalizeTherapyStyleInputSchema
>;

const PersonalizeTherapyStyleOutputSchema = z.object({
  response: z.string().describe('The AI assistant’s response, personalized to the specified therapy style.'),
});
export type PersonalizeTherapyStyleOutput = z.infer<
  typeof PersonalizeTherapyStyleOutputSchema
>;

export async function personalizeTherapyStyle(
  input: PersonalizeTherapyStyleInput
): Promise<PersonalizeTherapyStyleOutput> {
  return personalizeTherapyStyleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizeTherapyStylePrompt',
  input: {schema: PersonalizeTherapyStyleInputSchema},
  output: {schema: PersonalizeTherapyStyleOutputSchema},
  prompt: `You are an AI assistant specializing in mental health counseling. You are to adopt a specific therapy style based on the user's defined preferences.

Therapy Style: {{{therapyStyle}}}

User Input: {{{userInput}}}

Response:`,
});

const personalizeTherapyStyleFlow = ai.defineFlow(
  {
    name: 'personalizeTherapyStyleFlow',
    inputSchema: PersonalizeTherapyStyleInputSchema,
    outputSchema: PersonalizeTherapyStyleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
