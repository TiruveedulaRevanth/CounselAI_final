
import { z } from 'zod';

export const SuggestResourceInputSchema = z.object({
  query: z
    .string()
    .describe("The user's message or query to find a resource for."),
});
export type SuggestResourceInput = z.infer<typeof SuggestResourceInputSchema>;

export const SuggestResourceOutputSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
});
export type SuggestResourceOutput = z.infer<typeof SuggestResourceOutputSchema>;

export const PromptBasedEmotionalSupportInputSchema = z.object({
  emotionalStateDescription: z
    .string()
    .describe("A description of the user's current emotional state."),
});
export type PromptBasedEmotionalSupportInput = z.infer<
  typeof PromptBasedEmotionalSupportInputSchema
>;

export const PromptBasedEmotionalSupportOutputSchema = z.object({
  response: z
    .string()
    .describe('An empathetic and supportive response from the AI.'),
});
export type PromptBasedEmotionalSupportOutput = z.infer<
  typeof PromptBasedEmotionalSupportOutputSchema
>;

export const SendSmsInputSchema = z.object({
  userName: z.string().describe('The name of the user in crisis.'),
  emergencyContactPhone: z
    .string()
    .describe('The phone number of the emergency contact.'),
});
export type SendSmsInput = z.infer<typeof SendSmsInputSchema>;

export const SendSmsOutputSchema = z.object({
  success: z.boolean().describe('Whether the SMS was sent successfully.'),
  message: z.string().describe('The content of the SMS message that was sent.'),
});
export type SendSmsOutput = z.infer<typeof SendSmsOutputSchema>;

export const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
  emotion: z
    .enum(['Sadness', 'Anxiety', 'Anger', 'Joy', 'Neutral'])
    .optional()
    .describe('The primary emotion detected in the text.'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

export const TextToSpeechOutputSchema = z.object({
  audio: z
    .string()
    .describe(
      "The generated audio as a data URI in WAV format. Expected format: 'data:audio/wav;base64,<encoded_data>'"
    )
    .optional(),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;
