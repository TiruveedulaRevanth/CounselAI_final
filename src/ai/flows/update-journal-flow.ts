
'use server';

/**
 * @fileOverview An AI agent that analyzes a user's conversation history and an existing journal
 * to create an updated, structured summary of their personality, challenges, and progress.
 *
 * - updateJournal - A function that accepts conversation history and returns an updated journal.
 * - UpdateJournalInput - The input type for the updateJournal function.
 * - UpdateJournalOutput - The return type representing the structured journal.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { UserContextSchema, ChatJournalSchema, MessageSchema, UpdateJournalInputSchema } from '../schemas/journal';
import type { UserContext, ChatJournal, UpdateJournalInput } from '../schemas/journal';


const UpdateJournalOutputSchema = z.object({
    userContext: UserContextSchema,
    chatJournal: ChatJournalSchema,
});
export type UpdateJournalOutput = z.infer<typeof UpdateJournalOutputSchema>;


export async function updateJournal(input: UpdateJournalInput): Promise<UpdateJournalOutput> {
  return updateJournalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'updateJournalPrompt',
  input: { schema: UpdateJournalInputSchema },
  output: { schema: UpdateJournalOutputSchema },
  system: `You are an expert AI therapist. Your task is to analyze the provided conversation history and the user's existing journals (both the long-term User Context and the current Chat Journal) to create concise, updated summaries for both.
  
You MUST follow these rules:
1.  **Synthesize, Don't Replace:** Read the 'currentUserContext' and 'currentChatJournal'. Integrate new insights from the 'history' into the existing journal fields. Do not simply discard old information. The goal is to evolve the journals, not rewrite them from scratch.
2.  **Differentiate Context:**
    *   The **User Context** is for long-term, stable traits. Only update 'personality', 'strengths', and 'problems' if new, significant, and recurring themes emerge. These should change slowly over time.
    *   The **Chat Journal** is for this specific conversation. Update 'suggestedSolutions' and 'progressSummary' based only on the recent messages in this chat. This journal should be dynamic.
3.  **Be Objective and Empathetic:** Use neutral, observational language. Frame the user's traits and problems constructively.
4.  **Identify Core Themes:** Distill the conversation into key themes for each section.

**Journal Sections to Update:**

*   **User Context (Long-Term):**
    *   'personality': Based on the user's language, tone, and expressed thoughts across all conversations, describe their core personality traits. Are they analytical, anxious, resilient, self-critical?
    *   'strengths': Identify the user's recurring strengths and positive attributes. This could be self-awareness, determination, kindness, etc.
    *   'problems': What are the main, persistent challenges, mental problems, or real-world issues the user is facing across multiple conversations? Be specific (e.g., "Struggling with social anxiety," "Deals with Impostor Syndrome").
*   **Chat Journal (This Conversation Only):**
    *   'suggestedSolutions': What are the potential therapeutic avenues or coping strategies that have been discussed *in this specific chat*? (e.g., "Practiced a 5-4-3-2-1 grounding exercise," "Discussed reframing negative thoughts about the exam").
    *   'progressSummary': Based only on the recent history of this chat, assess their change. Are they applying advice from this session? Is their mood improving or worsening *in this conversation*?`,
    prompt: `=== LONG-TERM USER CONTEXT (PREVIOUS) ===
{{#if currentUserContext}}
  Personality: {{{currentUserContext.personality}}}
  Strengths: {{{currentUserContext.strengths}}}
  Problems: {{{currentUserContext.problems}}}
{{else}}
  This is a new user.
{{/if}}

=== CURRENT CHAT JOURNAL (PREVIOUS) ===
{{#if currentChatJournal}}
  Suggested Solutions: {{{currentChatJournal.suggestedSolutions}}}
  Progress Summary: {{{currentChatJournal.progressSummary}}}
{{else}}
  This is a new chat.
{{/if}}

=== NEW CONVERSATION HISTORY (from this chat) ===
{{#each history}}
  - {{role}}: {{{content}}}
{{/each}}

Update both journals based on the new conversation history. Provide the complete, updated content for both the User Context and the Chat Journal.
`,
});

const updateJournalFlow = ai.defineFlow(
  {
    name: 'updateJournalFlow',
    inputSchema: UpdateJournalInputSchema,
    outputSchema: UpdateJournalOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (output) {
        return output;
      }
    } catch (error) {
       console.error("Error in updateJournalFlow:", error);
    }
    // Return the old journals or empty ones if the AI fails.
    return {
        userContext: input.currentUserContext || {
            personality: "",
            strengths: "",
            problems: "",
        },
        chatJournal: input.currentChatJournal || {
            suggestedSolutions: "",
            progressSummary: "No progress to report yet.",
        }
    };
  }
);

    
