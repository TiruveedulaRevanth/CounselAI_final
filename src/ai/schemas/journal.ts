
import { z } from 'zod';

export const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});
export type Message = z.infer<typeof MessageSchema>;

export const JournalSchema = z.object({
  personality: z.string().describe("A summary of the user's core personality traits observed from the conversation."),
  strengths: z.string().describe("A summary of the user's strengths and positive attributes."),
  struggles: z.string().describe("A summary of the user's main challenges and struggles."),
  suggestedSolutions: z.string().describe("A summary of potential solutions or coping strategies."),
  progressSummary: z.string().describe("An assessment of the user's progress and improvement over time."),
});
export type Journal = z.infer<typeof JournalSchema>;

export const UpdateJournalInputSchema = z.object({
  currentJournal: JournalSchema.optional().describe("The current state of the journal, if it exists."),
  history: z.array(MessageSchema).describe("The user's recent conversation history."),
});
export type UpdateJournalInput = z.infer<typeof UpdateJournalInputSchema>;
