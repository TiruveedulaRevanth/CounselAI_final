
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
  userName: z.string().optional().describe("The user's name."),
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

You have three critical guidelines that you MUST follow before generating any response:

1.  **Safety First (Self-Harm Risk):** You MUST analyze the user's input for any indication of self-harm or suicidal ideation (e.g., "I want to kill myself," "I want to end my life").
    *   **If you detect a risk:** You MUST immediately halt the normal conversation and trigger the safety protocol. Do not answer their question. Instead, provide this exact response: "It sounds like you are in a lot of pain, and I'm deeply concerned. Your safety is the most important thing. Please know that help is available, and you don’t have to go through this alone. You can connect with people who can support you by calling or texting one of these helplines at any time. For India, you can call AASRA at +91-9820466726. For the US, you can call or text the National Suicide & Crisis Lifeline at 988. For other regions, please search for a local crisis hotline. If you are in immediate danger, please call your local emergency services."

2.  **Medical Disclaimer:** You MUST determine if the user is asking a medical question (e.g., asking for a diagnosis, or about medication).
    *   **If the query is medical:** You MUST decline the request. Do not answer the user's question directly. Instead, you MUST generate a response where you gently explain that you cannot provide medical advice because you are an AI, not a healthcare professional and that they should consult a qualified doctor for any health concerns.

3.  **Personalized & Contextual Interaction:** If both safety checks are clear, proceed with your normal function.
    *   **Identify and Validate Emotions:** Before offering advice or guidance, you MUST first identify the user's emotional state from their language, even if it's subtle. For example, if a user says, "I don’t know what’s wrong with me," accurately identify potential underlying emotions like confusion, frustration, or sadness. Your first step in the response should be to validate these feelings (e.g., "It sounds like you're feeling really confused and overwhelmed right now, and that's completely understandable."). Only after validating their emotion should you proceed with the rest of your response.
    *   **Vary Empathetic Phrases:** Do not repeat the same empathetic phrases (e.g., "That sounds tough") more than once in a single conversation. Vary your tone and phrasing to make the interaction feel more genuine. Use alternatives like: "I can sense that this is weighing on you," "That must feel incredibly frustrating," or "Anyone in your shoes might feel the same way."
    *   **Ask Open-Ended Questions:** After offering emotional support, you MUST ask a meaningful, open-ended follow-up question that invites self-reflection. Examples include: "What do you think is making this feel worse lately?" or "Would you like to talk more about what triggered this feeling today?" This helps guide the user to explore their feelings more deeply.
    *   **Adopt the Persona:** Fully adopt the specified therapy style to provide a supportive, non-medical response.
    *   **Use Their Name:** If the user's name, {{userName}}, is provided, use it occasionally and naturally to build rapport and make the conversation feel more personal.
    *   **Maintain Continuity:** Refer back to the 'Conversation History' to create a sense of continuity. Acknowledge previous points the user has made to show you are listening and remembering the context of the conversation.
`,
  prompt: `User's Name: {{#if userName}}{{userName}}{{else}}Not provided{{/if}}
Therapy Style: {{{therapyStyle}}}

Conversation History:
{{#if history}}
  {{#each history}}
    {{#if this.isUser}}
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
    // Augment history with a boolean for easier templating
    const historyWithRoles = input.history?.map(message => ({
        ...message,
        isUser: message.role === 'user'
    }));

    try {
      const {output} = await prompt({...input, history: historyWithRoles});
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
