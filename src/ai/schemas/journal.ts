
import { z } from 'zod';

export const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});
export type Message = z.infer<typeof MessageSchema>;

export const UserContextSchema = z.object({
  personality: z.string().describe("A summary of the user's core personality traits observed over all conversations."),
  strengths: z.string().describe("A summary of the user's recurring strengths and positive attributes."),
  struggles: z.string().describe("A summary of the user's main, long-term challenges and struggles."),
});
export type UserContext = z.infer<typeof UserContextSchema>;

export const ChatJournalSchema = z.object({
    suggestedSolutions: z.string().describe("A summary of potential solutions or coping strategies discussed in the current chat."),
    progressSummary: z.string().describe("An assessment of the user's progress and improvement within the current chat session."),
});
export type ChatJournal = z.infer<typeof ChatJournalSchema>;

export const UpdateJournalInputSchema = z.object({
  currentUserContext: UserContextSchema.optional().describe("The current state of the user's long-term context."),
  currentChatJournal: ChatJournalSchema.optional().describe("The current state of the journal for this specific chat."),
  history: z.array(MessageSchema).describe("The user's recent conversation history for the current chat."),
});
export type UpdateJournalInput = z.infer<typeof UpdateJournalInputSchema>;
