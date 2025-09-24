
'use server';

/**
 * @fileOverview An AI agent that analyzes a conversation and updates both a long-term user context and a short-term chat journal.
 *
 * - updateJournal - A function that takes conversation history and existing journals and returns updated versions.
 * - UpdateJournalInput - The input type for the function.
 * - UpdateJournalOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import {
  UpdateJournalInputSchema,
  UpdateJournalOutputSchema
} from '../schemas/journal-entry';
import type { UpdateJournalInput, UpdateJournalOutput } from '../schemas/journal-entry';

export { type UpdateJournalInput, type UpdateJournalOutput };

export async function updateJournal(
  input: UpdateJournalInput
): Promise<UpdateJournalOutput> {
  return updateJournalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'updateJournalPrompt',
  input: { schema: UpdateJournalInputSchema },
  output: { schema: UpdateJournalOutputSchema },
  system: `You are an analytical psychologist AI. Your primary function is to meticulously maintain a user's journal, which is divided into a 'UserContext' (long-term memory) and a 'ChatJournal' (short-term, session-specific notes). Your analysis must be clinical, objective, and insightful.

**GUIDING PRINCIPLES:**
1.  **Synthesize and Evolve:** Do not simply replace information. Integrate new insights from the latest conversation into the existing journal notes, allowing the user's profile to evolve. Your notes should be structured, readable, and chronological.
2.  **Differentiate Contexts:**
    *   **UserContext (Long-Term):** This is the core, enduring profile. It should change slowly. Only add significant, recurring themes or traits that are clearly established over time.
    *   **ChatJournal (Short-Term):** This is for the current conversation only. Update it to reflect the immediate discussion, strategies, and progress *within this session*.
3.  **Clinical Language:** Use objective, third-person language (e.g., "The user expresses...", "A pattern of avoidance was noted...").

**YOUR PROCESS:**
1.  **Review History:** Analyze the full 'history' of the conversation.
2.  **Compare and Contrast:** Compare new information against the 'currentUserContext' and 'currentChatJournal'.
3.  **Generate 'updatedUserContext':**
    *   **Cross-Domain Analysis:** Look for ripple effects. How does one life domain impact another? For example, if there's 'Business/finance stress', check for effects on 'Relationships', 'Health', or 'Mood'. Add a brief note describing the influence (e.g., in the Relationships domain: "Business stress may be contributing to withdrawal from partner.").
    *   **Pattern & Recurrence Tracking:** If similar patterns have appeared before, note them explicitly (e.g., "User *frequently* reports business stress affecting communication."). Update severity markers (mild, moderate, severe) where appropriate based on the new information.
    *   **Infer and Summarize:** Infer underlying patterns. If the user mentions multiple instances of avoiding social events, note a potential pattern of 'social avoidance' under 'Recurring Problems'.
    *   **Merge, Don't Overwrite:** Carefully merge new insights into the existing text. Do not overwrite or delete previous facts. If no new long-term insights are revealed, return the 'currentUserContext' fields unchanged, but do not leave them blank.
4.  **Generate 'updatedChatJournal':**
    *   Summarize the key solutions, coping strategies, or actionable next steps discussed in the latest turn (e.g., "Discussed implementing a structured decision-making matrix," "Suggested mindfulness exercises for anxiety.").
    *   Briefly note any progress or new understanding the user reached *in this session*.
`,
  prompt: `A conversation has just concluded. Here is the full history and the current state of the journals.

=== CURRENT USER CONTEXT (Long-Term) ===
Core Themes: {{currentUserContext.coreThemes}}
Life Domains:
  - Business: {{currentUserContext.lifeDomains.business}}
  - Relationships: {{currentUserContext.lifeDomains.relationships}}
  - Family: {{currentUserContext.lifeDomains.family}}
  - Health: {{currentUserContext.lifeDomains.health}}
  - Finances: {{currentUserContext.lifeDomains.finances}}
  - Personal Growth: {{currentUserContext.lifeDomains.personalGrowth}}
Personality Traits: {{currentUserContext.personalityTraits}}
Recurring Problems / Stressors: {{currentUserContext.recurringProblems}}
Values / Goals: {{currentUser-context.values}}
Mood History: {{currentUserContext.moodHistory}}

=== CURRENT CHAT JOURNAL (This Session) ===
Suggested Solutions: {{currentChatJournal.suggestedSolutions}}
Progress Summary: {{currentChatJournal.progressSummary}}

=== FULL CONVERSATION HISTORY ===
{{#each history}}
  {{role}}: {{{content}}}
{{/each}}

Based on your instructions, analyze the conversation and generate the updated 'UserContext' and 'ChatJournal' with a clinical and analytical approach, including cross-domain analysis and pattern tracking.
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
      // If AI fails, return the original context to prevent data loss.
      return {
          updatedUserContext: input.currentUserContext,
          updatedChatJournal: input.currentChatJournal,
      };
    } catch (error) {
       console.error("Error in updateJournalFlow:", error);
       // On error, return original context to ensure no data is lost.
       return {
          updatedUserContext: input.currentUserContext,
          updatedChatJournal: input.currentChatJournal,
       };
    }
  }
);
