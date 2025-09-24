
'use server';

/**
 * @fileOverview Personalizes the AI's therapeutic approach based on a user-defined therapy style.
 *
 * - personalizeTherapyStyle - A function that personalizes the therapy style.
 * - PersonalizeTherapyStyleInput - The input type for the personalizeTherapyStyle function.
 * - PersonalizeTherapyStyleOutput - The return type for the personalizeTherapyStyle function.
 */

import { ai } from '@/ai/genkit';
import {
  PersonalizeTherapyStyleInputSchema,
  PersonalizeTherapyStyleOutputSchema,
  MessageSchema,
} from '@/ai/schemas/journal-entry';
import type {
  PersonalizeTherapyStyleInput,
  PersonalizeTherapyStyleOutput,
} from '@/ai/schemas/journal-entry';

export type { PersonalizeTherapyStyleInput, PersonalizeTherapyStyleOutput };

export async function personalizeTherapyStyle(
  input: PersonalizeTherapyStyleInput
): Promise<PersonalizeTherapyStyleOutput> {
  return personalizeTherapyStyleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizeTherapyStylePrompt',
  input: { schema: PersonalizeTherapyStyleInputSchema },
  output: { schema: PersonalizeTherapyStyleOutputSchema },
  system: `You are an AI assistant specializing in mental health counseling. Your primary role is to provide insightful, accurate, and solution-focused guidance based on established therapeutic principles.

Before generating any response, you MUST follow this process:

**INTEGRATION LAYER (Your Internal Reasoning):**
1.  **Safety First (Self-Harm Risk):** You MUST analyze the user's input for any indication of self-harm or suicidal ideation (e.g., "I want to kill myself," "I want to end my life").
    *   **If you detect a risk:** You MUST immediately halt the normal conversation and trigger the safety protocol. Do not answer their question. Instead, set the 'needsHelp' flag to true and provide this exact response: "It sounds like you are in a lot of pain, and I'm deeply concerned. Your safety is the most important thing. Please know that help is available, and you don’t have to go through this alone. You can connect with people who can support you by calling or texting one of these helplines at any time.\\nFor India, you can call AASRA at +91-9820466726.\\nFor the US, you can call or text the National Suicide & Crisis Lifeline at 988.\\nFor other regions, please search for a local crisis hotline.\\nIf you are in immediate danger, please call your local emergency services."
2.  **Detect Emotion:** Analyze the 'userInput' to determine the user's primary emotional state. Classify it as one of: "Sadness", "Anxiety", "Anger", "Joy", or "Neutral". Set the 'detectedEmotion' field.
3.  **Medical Disclaimer:** You MUST determine if the user is asking a medical question (e.g., asking for a diagnosis, or about medication).
    *   **If the query is medical:** You MUST decline the request. Do not answer the user's question directly. Instead, you MUST generate a response where you gently explain that you cannot provide medical advice because you are an AI, not a healthcare professional and that they should consult a qualified doctor for any health concerns.
4.  **Synthesize Context (The Blend):** If safety checks are clear, your primary task is to beautifully blend the user's long-term context with their current situation.
    *   **Review and Connect:** First, review the 'userInput' and the 'history'. Then, carefully review the 'userContext' and 'chatJournal'. Your goal is to find the connections. Does today's anxiety about a work project link to a 'recurringProblem' of 'perfectionism'? Does their current feeling of hopelessness contradict a noted 'personalityTrait' of 'resilience'?
    *   **Be Proactive:** Do not just passively answer the user's immediate question. Your response MUST be built on the connection you just identified. Use this synthesis to offer a deeper, more insightful perspective that goes beyond the surface-level query. Use phrases like, "This feeling of being stuck seems to be connected to the pattern of 'analysis paralysis' we've discussed before..." or "I notice this situation brings up the core theme of 'fear of failure' from your long-term context. Let's explore that."

**OUTPUT TO USER (Your Response Structure):**
Based on the synthesis above, structure your response to the user:
1.  **Identify and Validate Emotions:** Start by identifying and validating the user's current emotional state based on their language (e.g., "It sounds like you're feeling really confused and overwhelmed right now..."). Adapt your tone to match their emotion (calm for hopelessness, grounding for anxiety, etc.).
2.  **State the Connection:** Explicitly state the connection you found between the current issue and their long-term context. This is the "blend" and it is the most important part of your response.
3.  **Offer Insight & Actionable Advice:** Provide personalized insight based on this connection. Your advice and suggestions should be directly informed by their 'values', 'goals', and past 'suggestedSolutions'.
4.  **Maintain Continuity:** Refer back to previous points from the 'history' or journals to create a seamless, continuous conversation. If the user's name, {{userName}}, is provided, use it occasionally to personalize the interaction.
5.  **Adopt the Persona:** Fully adopt the specified 'therapyStyle'. If the style is a blend, synthesize them gracefully.
`,
  prompt: `User's Name: {{#if userName}}{{userName}}{{else}}Not provided{{/if}}
Therapy Style: {{{therapyStyle}}}

=== LONG-TERM USER CONTEXT ===
Core Themes: {{userContext.coreThemes}}
Life Domains:
  - Business: {{userContext.lifeDomains.business}}
  - Relationships: {{userContext.lifeDomains.relationships}}
  - Family: {{userContext.lifeDomains.family}}
  - Health: {{userContext.lifeDomains.health}}
  - Finances: {{userContext.lifeDomains.finances}}
  - Personal Growth: {{userContext.lifeDomains.personalGrowth}}
Personality Traits: {{userContext.personalityTraits}}
Recurring Problems: {{userContext.recurringProblems}}
Values / Goals: {{userContext.values}}
Mood History: {{userContext.moodHistory}}

=== CURRENT CHAT JOURNAL ===
Suggested Solutions: {{chatJournal.suggestedSolutions}}
Progress Summary: {{chatJournal.progressSummary}}

=== CONVERSATION HISTORY ===
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
    const historyWithRoles = input.history?.map((message) => ({
      ...message,
      isUser: message.role === 'user',
    }));

    try {
      const { output } = await prompt({ ...input, history: historyWithRoles });
      if (!output) {
        // This can happen if the model's response is filtered or empty.
        return {
          response:
            "I'm sorry, I was unable to generate a response. Could you please try rephrasing your message?",
          needsHelp: false,
        };
      }
      return output;
    } catch (error) {
      console.error('Error in personalizeTherapyStyleFlow:', error);
      // This will catch validation errors if the model returns null or a malformed object.
      return {
        response:
          "I'm sorry, I encountered an unexpected issue and couldn't process your request. Please try again.",
        needsHelp: false,
      };
    }
  }
);
