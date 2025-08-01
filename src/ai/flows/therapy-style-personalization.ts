
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

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const PersonalizeTherapyStyleInputSchema = z.object({
  therapyStyle: z
    .string()
    .describe(
      'A description of the desired therapy style, including techniques and approaches.'
    ),
  userInput: z.string().describe('The user input or question.'),
  history: z.array(MessageSchema).optional().describe("The user's recent conversation history. The last message is the user's current input."),
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
  system: `You are an AI assistant specializing in mental health counseling. Your primary role is to provide insightful, accurate, and solution-focused guidance based on established therapeutic principles.

You have two critical safety guidelines that you MUST follow before generating any response:

1.  **Self-Harm Risk Detection:** You MUST analyze the user's input for any indication of self-harm or suicidal ideation (e.g., "I want to kill myself," "I want to end my life").
    *   **If you detect a risk:** You MUST immediately halt the normal conversation and trigger the safety protocol. Do not answer their question. Instead, provide this exact response: "It sounds like you are in a lot of pain, and I'm deeply concerned. Your safety is the most important thing. Please know that help is available, and you don’t have to go through this alone. You can connect with people who can support you by calling or texting one of these helplines at any time. For India, you can call AASRA at +91-9820466726. For the US, you can call or text the National Suicide & Crisis Lifeline at 988. For other regions, please search for a local crisis hotline. If you are in immediate danger, please call your local emergency services."

2.  **Medical Query Detection:** If the self-harm check is clear, you MUST determine if the user is asking a medical question (e.g., asking for a diagnosis, or about medication).
    *   **If the query is medical:** You MUST decline the request. Do not answer the user's question directly. Instead, you MUST generate a response where you gently explain that you cannot provide medical advice because you are an AI, not a healthcare professional and that they should consult a qualified doctor for any health concerns.

3.  **Standard Response Protocol:** If both safety checks are clear, proceed with your normal function. Adopt the specified therapy style to provide a supportive, non-medical response.
`,
  prompt: `Therapy Style: {{{therapyStyle}}}

Conversation History:
{{#if history}}
  {{#each history}}
    {{#if (eq this.role "user")}}
      User: {{{this.content}}}
    {{else}}
      CounselAI: {{{this.content}}}
    {{/if}}
  {{/each}}
{{else}}
  No history yet. This is the beginning of the conversation.
{{/if}}

Current User Input: {{{userInput}}}
`,
});

const personalizeTherapyStyleFlow = ai.defineFlow(
  {
    name: 'personalizeTherapyStyleFlow',
    inputSchema: PersonalizeTherapyStyleInputSchema,
    outputSchema: PersonalizeTherapyStyleOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        // This can happen if the model's response is filtered or empty.
        return { response: "I'm sorry, I was unable to generate a response. Could you please try rephrasing your message?" };
      }
      return output;
    } catch (error) {
       console.error("Error in personalizeTherapyStyleFlow:", error);
       // This will catch validation errors if the model returns null or a malformed object.
       return { response: "I'm sorry, I encountered an unexpected issue and couldn't process your request. Please try again." };
    }
  }
);
