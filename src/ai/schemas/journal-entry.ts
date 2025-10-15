

import { z } from 'zod';

const LifeDomainsSchema = z.object({
  business: z.string().describe("Notes on the user's business and career life."),
  relationships: z.string().describe("Notes on the user's romantic and social relationships."),
  family: z.string().describe("Notes on the user's family life."),
  health: z.string().describe("Notes on the user's physical and mental health."),
  finances: z.string().describe("Notes on the user's financial situation."),
  personalGrowth: z.string().describe("Notes on the user's personal growth journey."),
});

export const UserContextSchema = z.object({
  coreThemes: z.string().describe("High-level summary of the core themes in the user's life."),
  lifeDomains: LifeDomainsSchema.describe("Detailed notes on specific areas of the user's life.").optional(),
  personalityTraits: z.string().describe("A summary of the user's core personality traits observed over all conversations."),
  recurringProblems: z.string().describe("A summary of the user's main, long-term challenges and recurring stressors."),
  values: z.string().describe("A summary of the user's core values and life goals."),
  moodHistory: z.string().describe("A summary of the user's mood patterns and significant milestones over time."),
});
export type UserContext = z.infer<typeof UserContextSchema>;

export const ChatJournalSchema = z.object({
  suggestedSolutions: z.string().describe("A summary of potential solutions or coping strategies discussed in the current chat."),
  progressSummary: z.string().describe("An assessment of the user's progress and improvement within the current chat session."),
});
export type ChatJournal = z.infer<typeof ChatJournalSchema>;

export const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});
export type Message = z.infer<typeof MessageSchema>;

export const UpdateJournalInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).describe("The full conversation history."),
  currentUserContext: UserContextSchema.describe("The existing long-term context of the user."),
  currentChatJournal: ChatJournalSchema.describe("The existing journal for the current chat session."),
});
export type UpdateJournalInput = z.infer<typeof UpdateJournalInputSchema>;

export const UpdateJournalOutputSchema = z.object({
  updatedUserContext: UserContextSchema,
  updatedChatJournal: ChatJournalSchema,
});
export type UpdateJournalOutput = z.infer<typeof UpdateJournalOutputSchema>;


export const ShortTermContextSchema = z.object({
    mood: z.string().describe("The user's current mood or emotion."),
    events: z.string().describe("Recent events or triggers that are on the user's mind."),
    concerns: z.string().describe("The primary concerns or focus of the day."),
    copingAttempts: z.string().describe("What the user has tried to do to cope and how it worked."),
});

export const GenerateJournalReflectionInputSchema = z.object({
    shortTermContext: ShortTermContextSchema,
    longTermContext: UserContextSchema.optional(),
});
export type GenerateJournalReflectionInput = z.infer<typeof GenerateJournalReflectionInputSchema>;


const ReflectionSchema = z.object({
    summary: z.string().describe("A short, empathetic summary of the user's daily entry."),
    connection: z.string().describe("A sentence connecting the daily entry to long-term patterns."),
    insight: z.string().describe("A personalized insight or gentle reframe."),
    suggestions: z.array(z.string()).describe("1-2 actionable, small, and realistic suggestions."),
});

export const GenerateJournalReflectionOutputSchema = z.object({
    reflection: ReflectionSchema,
    updatedLongTermContext: UserContextSchema,
});
export type GenerateJournalReflectionOutput = z.infer<typeof GenerateJournalReflectionOutputSchema>;

export const UserJournalEntrySchema = z.object({
  id: z.string(),
  date: z.number(),
  shortTermContext: ShortTermContextSchema,
  reflection: ReflectionSchema.optional(),
});
export type UserJournalEntry = z.infer<typeof UserJournalEntrySchema>;


export const SummarizeForJournalInputSchema = z.object({
  query: z.string().describe("The user's query to be summarized."),
});
export type SummarizeForJournalInput = z.infer<typeof SummarizeForJournalInputSchema>;

export const SummarizeForJournalOutputSchema = z.object({
  summary: z.string().describe("A concise summary of the user's query, no more than 20 words."),
});
export type SummarizeForJournalOutput = z.infer<typeof SummarizeForJournalOutputSchema>;

export const PersonalizeTherapyStyleInputSchema = z.object({
  userName: z.string().optional().describe("The user's name."),
  therapyStyle: z
    .string()
    .describe(
      'A description of the desired therapy style, including techniques, approaches, and personality weightings.'
    ),
  userInput: z.string().describe('The user input or question.'),
  history: z.array(MessageSchema).optional().describe("The user's recent conversation history. The last message is the user's current input."),
  userContext: UserContextSchema.describe("A long-term summary of the user's context."),
  chatJournal: ChatJournalSchema.describe("A summary of the user's progress and suggested solutions specific to the current conversation.")
});
export type PersonalizeTherapyStyleInput = z.infer<
  typeof PersonalizeTherapyStyleInputSchema
>;

export const PersonalizeTherapyStyleOutputSchema = z.object({
  response: z.string().describe('The AI assistant’s response, personalized to the specified therapy style.'),
  needsHelp: z.boolean().optional().describe('A flag indicating if the user is in crisis and needs immediate help.'),
  detectedEmotion: z.enum(["Sadness", "Anxiety", "Anger", "Joy", "Neutral", "Confusion", "Stress", "Happiness", "Shame/Guilt", "Hopelessness", "Tiredness/Exhaustion", "Love/Affection", "Mixed"]).optional().describe("The primary emotion detected in the user's input."),
});
export type PersonalizeTherapyStyleOutput = z.infer<
  typeof PersonalizeTherapyStyleOutputSchema
>;

    