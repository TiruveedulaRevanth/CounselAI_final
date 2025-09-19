
'use server';

/**
 * @fileOverview An AI agent that analyzes a user's conversation history and an existing journal
 * to create an updated, structured summary of their personality, challenges, and progress.
 *
 * - updateJournal - A function that accepts conversation history and returns an updated journal.
 * - UpdateJournalInput - The input type for the updateJournal function.
 * - Journal - The return type representing the structured journal.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { JournalSchema, MessageSchema, UpdateJournalInputSchema } from '../schemas/journal';
import type { Journal, UpdateJournalInput } from '../schemas/journal';


export async function updateJournal(input: UpdateJournalInput): Promise<Journal> {
  return updateJournalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'updateJournalPrompt',
  input: { schema: UpdateJournalInputSchema },
  output: { schema: JournalSchema },
  system: `You are an expert AI therapist. Your task is to analyze the provided conversation history and the user's existing journal to create a concise, updated summary.
  
You MUST follow these rules:
1.  **Synthesize, Don't Replace:** Read the 'currentJournal' and the new 'history'. Integrate the new insights from the conversation history into the existing journal fields. Do not simply discard the old information. The goal is to evolve the journal, not rewrite it from scratch.
2.  **Be Objective and Empathetic:** Use neutral, observational language. Frame the user's traits and struggles constructively.
3.  **Identify Core Themes:** Distill the conversation into key themes for each section.

**Journal Sections to Update:**

*   'personality': Based on the user's language, tone, and expressed thoughts, describe their core personality traits. Are they analytical, anxious, resilient, self-critical?
*   'strengths': Identify the user's strengths and positive attributes. This could be self-awareness, resilience, determination, kindness, etc. Even in difficult conversations, look for their strengths.
*   'struggles': What are the main challenges or issues the user is currently facing? Be specific (e.g., "Struggling with social anxiety," "Dealing with academic pressure," "Experiencing grief").
*   'suggestedSolutions': Based on the struggles, what are the potential therapeutic avenues or coping strategies that have been discussed or could be helpful? (e.g., "Practice CBT techniques for negative thoughts," "Explore grounding exercises for anxiety," "Focus on setting boundaries").
*   'progressSummary': This is the most important section. Compare the recent history with the 'currentJournal' to assess change over time. Has the user made progress? Are they applying advice? Is their mood improving or worsening? Note any shifts in their emotional state or perspective.`,
    prompt: `Current Journal:
{{#if currentJournal}}
  Personality: {{{currentJournal.personality}}}
  Strengths: {{{currentJournal.strengths}}}
  Struggles: {{{currentJournal.struggles}}}
  Suggested Solutions: {{{currentJournal.suggestedSolutions}}}
  Progress Summary: {{{currentJournal.progressSummary}}}
{{else}}
  This is a new journal.
{{/if}}

New Conversation History:
{{#each history}}
  - {{role}}: {{{content}}}
{{/each}}

Update the journal based on the new conversation history.
`,
});

const updateJournalFlow = ai.defineFlow(
  {
    name: 'updateJournalFlow',
    inputSchema: UpdateJournalInputSchema,
    outputSchema: JournalSchema,
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
    // Return the old journal or an empty one if the AI fails.
    return input.currentJournal || {
        personality: "",
        strengths: "",
        struggles: "",
        suggestedSolutions: "",
        progressSummary: "No progress to report yet.",
    };
  }
);
