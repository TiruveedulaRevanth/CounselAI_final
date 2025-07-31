
'use server';

/**
 * @fileOverview An AI agent that suggests a relevant resource from a predefined library based on user input.
 *
 * - suggestResource - A function that accepts a user's query and returns the most relevant resource.
 * - SuggestResourceInput - The input type for the suggestResource function.
 * - SuggestResourceOutput - The return type for the suggestResource function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { SuggestResourceInputSchema } from '../schemas';
import type { SuggestResourceInput } from '../schemas';


const ResourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.enum(['Anxiety', 'Depression', 'Sleep', 'Stress', 'Relationships', 'Gratitude', 'Grief', 'Mindfulness', 'Self-Care', 'Academic/Work Pressure', 'Crisis Support']),
  type: z.enum(['article', 'video']),
  keywords: z.array(z.string()),
});

const SuggestResourceOutputSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  relevanceScore: z.number().optional().describe('A score from 0 to 1 indicating how relevant the resource is to the query.'),
});

export type SuggestResourceOutput = z.infer<typeof SuggestResourceOutputSchema>;

// This is a placeholder for a Firestore or other database call.
const resourcesData = [
  {
    id: 'anxiety-1',
    title: 'Understanding Anxiety and Panic Attacks',
    description: 'A deep dive into the mechanisms of anxiety, its symptoms, and how panic attacks differ.',
    category: 'Anxiety',
    type: 'article',
    keywords: ['anxiety', 'panic attacks', 'stress', 'fear', 'worry', 'symptoms'],
  },
  {
    id: 'anxiety-2',
    title: 'Guided Meditation for Anxiety',
    description: 'A 10-minute guided meditation to calm your mind and release anxiety.',
    category: 'Anxiety',
    type: 'video',
    keywords: ['meditation', 'mindfulness', 'anxiety', 'calm', 'breathing'],
  },
  {
    id: 'depression-1',
    title: 'What is Depression?',
    description: 'A comprehensive overview of depression, its symptoms, causes, and the importance of seeking help.',
    category: 'Depression',
    type: 'article',
    keywords: ['depression', 'sadness', 'low mood', 'mental health', 'hopelessness'],
  },
  {
    id: 'sleep-1',
    title: 'A Deeper Dive into Better Sleep',
    description: 'Beyond basic tips, understand the science of sleep and advanced strategies for a truly restful night.',
    category: 'Sleep',
    type: 'article',
    keywords: ['sleep', 'insomnia', 'rest', 'sleep hygiene', 'circadian rhythm'],
  },
  {
    id: 'stress-1',
    title: 'How to Manage and Reduce Stress',
    description: 'Practical strategies for coping with stress in your daily life.',
    category: 'Stress',
    type: 'video',
    keywords: ['stress', 'coping', 'management', 'relaxation', 'overwhelmed', 'burnout'],
  },
  {
    id: 'relationships-1',
    title: 'The Blueprint for Healthy Relationships',
    description: 'Explore the core components of healthy relationships, from communication to trust.',
    category: 'Relationships',
    type: 'article',
    keywords: ['relationships', 'communication', 'boundaries', 'love', 'conflict', 'breakup', 'trust'],
  },
  {
      id: 'gratitude-1',
      title: 'The Science and Practice of Gratitude',
      description: 'Learn how practicing gratitude can rewire your brain for happiness and resilience.',
      category: 'Gratitude',
      type: 'article',
      keywords: ['gratitude', 'happiness', 'mindfulness', 'journaling', 'well-being', 'positive thinking'],
  },
  {
      id: 'grief-1',
      title: 'Navigating the Complex Path of Grief',
      description: 'Understanding that grief is a unique and non-linear journey.',
      category: 'Grief',
      type: 'article',
      keywords: ['grief', 'loss', 'bereavement', 'sadness', 'coping', 'mourning'],
  },
  {
      id: 'mindfulness-1',
      title: 'An Introduction to Mindfulness',
      description: 'Learn the core principles of mindfulness and simple exercises to bring more presence to your daily life.',
      category: 'Mindfulness',
      type: 'article',
      keywords: ['mindfulness', 'meditation', 'presence', 'awareness', 'stress reduction', 'focus'],
  },
  {
    id: 'self-care-1',
    title: 'Building Your Personal Self-Care Toolkit',
    description: 'Self-care is not selfish. Learn how to build a sustainable practice that works for you.',
    category: 'Self-Care',
    type: 'article',
    keywords: ['self-care', 'well-being', 'burnout', 'routine', 'balance'],
  },
  {
      id: 'work-pressure-1',
      title: 'Managing Academic and Work Pressure',
      description: 'Strategies to cope with pressure, avoid burnout, and find a healthy work-life balance.',
      category: 'Academic/Work Pressure',
      type: 'article',
      keywords: ['burnout', 'stress', 'procrastination', 'time management', 'work-life balance', 'exams', 'deadlines'],
  }
];

export async function suggestResource(input: SuggestResourceInput): Promise<SuggestResourceOutput> {
  return suggestResourceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestResourcePrompt',
  input: { schema: SuggestResourceInputSchema },
  output: { schema: SuggestResourceOutputSchema },
  prompt: `You are a resource recommendation engine. Your task is to find the single most relevant resource for the user's query from the provided list.

Analyze the user's query: "{{query}}"

Consider the titles, descriptions, and keywords of the available resources to determine the best match.

Available Resources:
{{#each resources}}
- id: {{this.id}}
  title: "{{this.title}}"
  description: "{{this.description}}"
  keywords: [{{#each this.keywords}}"{{this}}"{{#unless @last}}, {{/unless}}{{/each}}]
{{/each}}

Based on the query, identify the single best resource and provide its ID and title. Also, provide a relevance score from 0.0 to 1.0, where 1.0 is a perfect match.

If no resource is a good match (relevance score below 0.6), return an empty object.`,
});

const suggestResourceFlow = ai.defineFlow(
  {
    name: 'suggestResourceFlow',
    inputSchema: SuggestResourceInputSchema,
    outputSchema: SuggestResourceOutputSchema,
  },
  async (input) => {
    const { output } = await prompt({ 
        ...input,
        // @ts-ignore - Adding resources to the prompt context
        resources: resourcesData 
    });
    
    if (output?.relevanceScore && output.relevanceScore > 0.6) {
        return output;
    }
    
    return {};
  }
);
