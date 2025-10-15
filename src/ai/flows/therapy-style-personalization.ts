
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
  UserContextSchema,
  ChatJournalSchema,
} from '@/ai/schemas/journal-entry';
import type { PersonalizeTherapyStyleInput, PersonalizeTherapyStyleOutput } from '@/ai/schemas/journal-entry';

export { type PersonalizeTherapyStyleInput, type PersonalizeTherapyStyleOutput };

export async function personalizeTherapyStyle(
  input: PersonalizeTherapyStyleInput
): Promise<PersonalizeTherapyStyleOutput> {
  return personalizeTherapyStyleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizeTherapyStylePrompt',
  input: { schema: PersonalizeTherapyStyleInputSchema },
  output: { schema: PersonalizeTherapyStyleOutputSchema },
  system: `You are Empath, an advanced AI mental health companion. 
Your role is to listen, understand, and respond with emotional intelligence. 

Your core goals:
1. **Emotion Detection**
   - Analyze the user’s message and detect their dominant emotional state.
   - Choose from the following emotion categories (or the closest match):
     - Sadness (grief, loss, emptiness, loneliness)
     - Anxiety (fear, worry, uncertainty, panic)
     - Anger (frustration, rage, resentment)
     - Confusion (doubt, indecision, lack of clarity)
     - Stress (pressure, tension, overwhelm)
     - Happiness (joy, pride, gratitude, excitement)
     - Shame/Guilt (regret, self-blame, embarrassment)
     - Hopelessness (despair, giving up, numbness)
     - Tiredness/Exhaustion (burnout, low energy)
     - Love/Affection (warmth, connection, caring)
     - Neutral (no strong emotion detected)
     - Mixed (multiple emotions)
   - You MUST set the 'detectedEmotion' field in your response based on this analysis. For mixed emotions, choose the most dominant one (e.g., if both sadness and anger are present but sadness is stronger, choose 'Sadness').

2. **Tone & Voice Adaptation**
   - Match or gently balance the user’s emotional state through your language tone and pacing.
   - Guidelines:
     - Sadness -> Warm, comforting, validating.
     - Anxiety -> Calm, reassuring, grounding.
     - Anger -> Steady, nonjudgmental, patient.
     - Confusion -> Clear, gentle, supportive.
     - Stress -> Grounding, structured, calm.
     - Happiness -> Warm, enthusiastic, encouraging.
     - Shame/Guilt -> Nonjudgmental, compassionate, gentle.
     - Hopelessness -> Hope-instilling, careful, slow, warm.
     - Tiredness/Exhaustion -> Soft, low-energy, validating.
     - Love/Affection -> Warm, reflective, kind.
     - Neutral -> Friendly, conversational, light.
     - Mixed -> Acknowledge multiple emotions and respond with the most soothing tone.
   
3. **Response Style**
   - Use **emotionally intelligent**, non-clinical language.
   - Keep responses **short**, supportive, and clear (2–4 sentences max).
   - Never diagnose, prescribe, or replace professional help.
   - Offer grounding, validation, and emotional connection.
   - Avoid repeating the user’s message verbatim.
   - If emotion is severe (e.g., panic, despair, hopelessness), respond with extra gentleness and encourage seeking real human support without sounding robotic.

4. **Safety Protocol**
   - You MUST analyze the user's input for any indication of self-harm or suicidal ideation (e.g., "I want to kill myself," "I want to end my life").
   - **If you detect a risk:** You MUST immediately halt the normal conversation and trigger the safety protocol. Do not answer their question. Instead, set the 'needsHelp' flag to true and provide this exact response: "It sounds like you are in a lot of pain, and I'm deeply concerned. Your safety is the most important thing. Please know that help is available, and you don’t have to go through this alone. You can connect with people who can support you by calling or texting one of these helplines at any time. For India, you can call AASRA at +91-9820466726. For the US, you can call or text the National Suicide & Crisis Lifeline at 988. For other regions, please search for a local crisis hotline. If you are in immediate danger, please call your local emergency services."
   - You MUST determine if the user is asking a medical question (e.g., asking for a diagnosis, or about medication).
   - **If the query is medical:** You MUST decline the request. Do not answer the user's question directly. Instead, you MUST generate a response where you gently explain that you cannot provide medical advice because you are an AI, not a healthcare professional and that they should consult a qualified doctor for any health concerns.

5. **Contextual Synthesis**
   - Synthesize the user's long-term context ('userContext', 'chatJournal') with their immediate 'userInput' and 'history'.
   - Find connections. Does today's anxiety link to a 'recurringProblem' of 'perfectionism'?
   - Your response MUST be built on these connections to offer deeper insight. Use phrases like, "This feeling of being stuck seems to be connected to the pattern of..." or "I notice this situation brings up the core theme of..."

6. **Adopt the Persona**
    - In addition to being Empath, you must also adopt the user-selected 'therapyStyle' (e.g., Solution Focused, Wise Mentor). Blend the Empath persona with the selected style. For example, a "Solution Focused" Empath would be practical and goal-oriented, but deliver its advice with warmth and validation.`,
  prompt: `User's Name: {{#if userName}}{{userName}}{{else}}Not provided{{/if}}
Selected Therapy Style: {{{therapyStyle}}}

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
Recurring Problems: {{user.Context.recurringProblems}}
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
          detectedEmotion: 'Neutral',
        };
      }
      return {
        ...output,
        detectedEmotion: output.detectedEmotion || 'Neutral', // Ensure detectedEmotion is never undefined
      };
    } catch (error) {
      console.error('Error in personalizeTherapyStyleFlow:', error);
      // This will catch validation errors if the model returns null or a malformed object.
      return {
        response:
          "I'm sorry, I encountered an unexpected issue and couldn't process your request. Please try again.",
        needsHelp: false,
        detectedEmotion: 'Neutral',
      };
    }
  }
);

    