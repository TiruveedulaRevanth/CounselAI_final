'use server';

/**
 * @fileOverview A flow that detects user emotions from voice input and adapts the AI's tone and rhythm accordingly.
 *
 * - emotionallyAdaptiveResponse - A function that handles the emotion detection and adaptive response process.
 * - EmotionallyAdaptiveResponseInput - The input type for the emotionallyAdaptiveResponse function.
 * - EmotionallyAdaptiveResponseOutput - The return type for the emotionallyAdaptiveResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EmotionallyAdaptiveResponseInputSchema = z.object({
  userInput: z.string().describe('The user input text from voice.'),
});
export type EmotionallyAdaptiveResponseInput = z.infer<typeof EmotionallyAdaptiveResponseInputSchema>;

const EmotionallyAdaptiveResponseOutputSchema = z.object({
  emotionalTone: z.string().describe('The detected emotional tone of the user input.'),
  adaptedResponse: z.string().describe('The AI response adapted to the detected emotional tone.'),
});
export type EmotionallyAdaptiveResponseOutput = z.infer<typeof EmotionallyAdaptiveResponseOutputSchema>;

export async function emotionallyAdaptiveResponse(input: EmotionallyAdaptiveResponseInput): Promise<EmotionallyAdaptiveResponseOutput> {
  return emotionallyAdaptiveResponseFlow(input);
}

const detectEmotionTool = ai.defineTool({
  name: 'detectEmotion',
  description: 'Detects the emotion in the user input text.',
  inputSchema: z.object({
    text: z.string().describe('The text to analyze for emotion.'),
  }),
  outputSchema: z.string().describe('The detected emotion in the text.'),
  async resolve(input) {
    // TODO: Implement emotion detection using an appropriate service or model.
    // For now, return a placeholder emotion.
    return 'neutral';
  },
});

const adaptResponsePrompt = ai.definePrompt({
  name: 'adaptResponsePrompt',
  input: {schema: EmotionallyAdaptiveResponseInputSchema},
  output: {schema: EmotionallyAdaptiveResponseOutputSchema},
  tools: [detectEmotionTool],
  prompt: `You are an AI assistant designed to provide empathetic and supportive responses.

  The user has provided the following input: {{{userInput}}}

  The detected emotion in the user input is: {{await detectEmotionTool text=userInput}}

  Based on the detected emotion, adapt your response to be more empathetic and supportive.

  emotionalTone: The detected emotion in the user input.
  adaptedResponse: The AI response adapted to the detected emotional tone.

  Respond in the following format:
  {
    "emotionalTone": "<detected emotion>",
    "adaptedResponse": "<adapted response>"
  }`,
});

const emotionallyAdaptiveResponseFlow = ai.defineFlow(
  {
    name: 'emotionallyAdaptiveResponseFlow',
    inputSchema: EmotionallyAdaptiveResponseInputSchema,
    outputSchema: EmotionallyAdaptiveResponseOutputSchema,
  },
  async input => {
    const detectedEmotion = await detectEmotionTool({text: input.userInput});
    const {output} = await adaptResponsePrompt({
      ...input,
      emotionalTone: detectedEmotion,
    });
    return output!;
  }
);
