
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
  category: z.enum(['Core Mental Health', 'Stress & Burnout', 'Sleep', 'Relationships', 'Academic/Work Pressure', 'Self-Care', 'Crisis Support']),
  type: z.enum(['article']),
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
  // Core Mental Health
  {
    id: 'core-1',
    title: 'Understanding Anxiety',
    description: 'A deep dive into the mechanisms of anxiety, its symptoms, and how panic attacks differ.',
    category: 'Core Mental Health',
    type: 'article',
    keywords: ['anxiety', 'panic attacks', 'stress', 'fear', 'worry', 'symptoms'],
  },
  {
    id: 'core-2',
    title: 'Coping with Depression',
    description: 'A comprehensive overview of depression, its symptoms, causes, and the importance of seeking help.',
    category: 'Core Mental Health',
    type: 'article',
    keywords: ['depression', 'sadness', 'low mood', 'mental health', 'hopelessness', 'coping'],
  },
  {
    id: 'core-3',
    title: 'What Is Bipolar Disorder?',
    description: 'An introduction to bipolar disorder, including manic and depressive episodes.',
    category: 'Core Mental Health',
    type: 'article',
    keywords: ['bipolar', 'manic', 'depressive', 'mood swings'],
  },
  {
    id: 'core-4',
    title: 'PTSD: Causes and Recovery',
    description: 'Understanding Post-Traumatic Stress Disorder and the path to healing.',
    category: 'Core Mental Health',
    type: 'article',
    keywords: ['ptsd', 'trauma', 'recovery', 'flashbacks'],
  },
  {
    id: 'core-5',
    title: 'OCD Explained Simply',
    description: 'A clear explanation of Obsessive-Compulsive Disorder, its cycles, and treatments.',
    category: 'Core Mental Health',
    type: 'article',
    keywords: ['ocd', 'obsessions', 'compulsions', 'intrusive thoughts'],
  },
  {
    id: 'core-6',
    title: 'Recognizing Early Signs of Mental Illness',
    description: 'Learn to identify early warning signs in yourself and others.',
    category: 'Core Mental Health',
    type: 'article',
    keywords: ['warning signs', 'early detection', 'mental health awareness'],
  },
  {
    id: 'core-7',
    title: 'What Is Schizophrenia?',
    description: 'An overview of schizophrenia, including symptoms like psychosis and delusions.',
    category: 'Core Mental Health',
    type: 'article',
    keywords: ['schizophrenia', 'psychosis', 'delusions', 'hallucinations'],
  },
  {
    id: 'core-8',
    title: 'Borderline Personality Disorder Basics',
    description: 'Understanding the complexities of BPD and its impact on relationships and emotions.',
    category: 'Core Mental Health',
    type: 'article',
    keywords: ['bpd', 'borderline', 'emotional dysregulation', 'personality disorder'],
  },
  {
    id: 'core-9',
    title: 'ADHD in Adults vs Kids',
    description: 'Exploring the different ways ADHD presents in childhood versus adulthood.',
    category: 'Core Mental Health',
    type: 'article',
    keywords: ['adhd', 'attention deficit', 'hyperactivity', 'focus', 'adult adhd'],
  },
  {
    id: 'core-10',
    title: 'Suicide Prevention: Warning Signs & Help',
    description: 'Crucial information on how to recognize warning signs and where to find help.',
    category: 'Core Mental Health',
    type: 'article',
    keywords: ['suicide prevention', 'crisis', 'warning signs', 'helpline'],
  },
  // Stress, Burnout & Emotional Regulation
  {
    id: 'stress-1',
    title: 'Stress vs Anxiety: Key Differences',
    description: 'Learn to distinguish between stress and anxiety to better manage your feelings.',
    category: 'Stress & Burnout',
    type: 'article',
    keywords: ['stress', 'anxiety', 'comparison', 'management'],
  },
  {
    id: 'stress-2',
    title: 'How to Recover from Burnout',
    description: 'Actionable steps to identify and recover from professional or personal burnout.',
    category: 'Stress & Burnout',
    type: 'article',
    keywords: ['burnout', 'recovery', 'work-life balance', 'exhaustion'],
  },
  {
    id: 'stress-3',
    title: 'Microbreaks & Work Reset Techniques',
    description: 'Simple techniques to reset your focus and reduce stress during the workday.',
    category: 'Stress & Burnout',
    type: 'article',
    keywords: ['microbreaks', 'work stress', 'productivity', 'reset'],
  },
  {
    id: 'stress-4',
    title: 'Grounding Exercises for Overwhelm',
    description: 'Use your five senses to anchor yourself in the present moment when feeling overwhelmed.',
    category: 'Stress & Burnout',
    type: 'article',
    keywords: ['grounding', 'overwhelm', 'anxiety', '54321 method'],
  },
  {
    id: 'stress-5',
    title: 'Recognizing Emotional Triggers',
    description: 'How to identify your emotional triggers and develop healthier responses.',
    category: 'Stress & Burnout',
    type: 'article',
    keywords: ['triggers', 'emotional regulation', 'self-awareness'],
  },
  {
    id: 'stress-6',
    title: 'Anger Management Techniques',
    description: 'Constructive ways to handle and express anger.',
    category: 'Stress & Burnout',
    type: 'article',
    keywords: ['anger management', 'frustration', 'coping skills'],
  },
  {
    id: 'stress-7',
    title: 'Building Emotional Intelligence',
    description: 'Learn the core components of EQ and how to strengthen them.',
    category: 'Stress & Burnout',
    type: 'article',
    keywords: ['emotional intelligence', 'eq', 'empathy', 'self-awareness'],
  },
  {
    id: 'stress-8',
    title: 'What Is Emotional Numbness?',
    description: 'Understanding why we sometimes feel emotionally numb and how to reconnect.',
    category: 'Stress & Burnout',
    type: 'article',
    keywords: ['emotional numbness', 'dissociation', 'trauma response', 'apathy'],
  },
  // Sleep & Relaxation
  {
    id: 'sleep-1',
    title: 'Sleep Hygiene Tips That Work',
    description: 'Beyond basic tips, understand the science of sleep and advanced strategies for a truly restful night.',
    category: 'Sleep',
    type: 'article',
    keywords: ['sleep', 'insomnia', 'rest', 'sleep hygiene', 'circadian rhythm'],
  },
  {
    id: 'sleep-2',
    title: 'Breathing Exercises for Sleep',
    description: 'Simple breathing techniques to calm your nervous system before bed.',
    category: 'Sleep',
    type: 'article',
    keywords: ['breathing', 'sleep', 'relaxation', '4-7-8'],
  },
  {
    id: 'sleep-3',
    title: 'Dealing with Nightmares & Night Terrors',
    description: 'Understanding the difference and how to cope with distressing nights.',
    category: 'Sleep',
    type: 'article',
    keywords: ['nightmares', 'night terrors', 'sleep disturbances', 'dream'],
  },
  {
    id: 'sleep-4',
    title: 'Caffeine, Screens & Sleep',
    description: 'How stimulants and blue light impact your sleep cycle.',
    category: 'Sleep',
    type: 'article',
    keywords: ['caffeine', 'blue light', 'screens', 'sleep quality'],
  },
  {
    id: 'sleep-5',
    title: 'How to Nap the Right Way',
    description: 'The science behind effective napping for a midday energy boost.',
    category: 'Sleep',
    type: 'article',
    keywords: ['napping', 'power nap', 'energy', 'fatigue'],
  },
  {
    id: 'sleep-6',
    title: 'Progressive Muscle Relaxation',
    description: 'A step-by-step guide to releasing physical tension for better sleep and relaxation.',
    category: 'Sleep',
    type: 'article',
    keywords: ['pmr', 'progressive muscle relaxation', 'tension', 'stress relief'],
  },
  {
    id: 'sleep-7',
    title: 'Bedtime Journaling for Better Sleep',
    description: 'How to use journaling to clear your mind and reduce anxiety before bed.',
    category: 'Sleep',
    type: 'article',
    keywords: ['journaling', 'sleep', 'anxiety', 'worry'],
  },
  // Relationships & Communication
  {
    id: 'relationships-1',
    title: 'Healthy vs Toxic Relationships',
    description: 'Learn to identify the key signs of both healthy and unhealthy relationship dynamics.',
    category: 'Relationships',
    type: 'article',
    keywords: ['relationships', 'communication', 'boundaries', 'love', 'conflict', 'toxic', 'healthy'],
  },
  {
    id: 'relationships-2',
    title: 'How to Say No Without Guilt',
    description: 'Practical tips for setting boundaries and prioritizing your own needs.',
    category: 'Relationships',
    type: 'article',
    keywords: ['boundaries', 'saying no', 'people pleasing', 'guilt'],
  },
  {
    id: 'relationships-3',
    title: 'Signs of Emotional Manipulation',
    description: 'Recognize the subtle tactics of emotional manipulation to protect yourself.',
    category: 'Relationships',
    type: 'article',
    keywords: ['manipulation', 'gaslighting', 'coercion', 'emotional abuse'],
  },
  {
    id: 'relationships-4',
    title: 'Managing Family Conflict',
    description: 'Strategies for navigating difficult conversations and conflicts with family members.',
    category: 'Relationships',
    type: 'article',
    keywords: ['family conflict', 'communication', 'disagreements', 'family dynamics'],
  },
  {
    id: 'relationships-5',
    title: 'How to Support a Friend in Crisis',
    description: 'Learn how to be a supportive and effective ally for a friend going through a tough time.',
    category: 'Relationships',
    type: 'article',
    keywords: ['support', 'friendship', 'crisis', 'listening'],
  },
  {
    id: 'relationships-6',
    title: 'Attachment Styles Explained',
    description: 'Understand how your attachment style (secure, anxious, avoidant) impacts your relationships.',
    category: 'Relationships',
    type: 'article',
    keywords: ['attachment theory', 'secure', 'anxious', 'avoidant'],
  },
  {
    id: 'relationships-7',
    title: 'Love Languages and Mental Health',
    description: 'How understanding love languages can improve communication and emotional connection.',
    category: 'Relationships',
    type: 'article',
    keywords: ['love languages', 'communication', 'connection', 'relationships'],
  },
  {
    id: 'relationships-8',
    title: 'Gaslighting: What It Is & How to Spot It',
    description: 'A detailed look at gaslighting tactics and how to respond to them.',
    category: 'Relationships',
    type: 'article',
    keywords: ['gaslighting', 'manipulation', 'emotional abuse', 'reality'],
  },
  // Academic / Workplace Mental Health
  {
    id: 'work-1',
    title: 'Exam Stress & Test Anxiety',
    description: 'Strategies to cope with pressure, avoid burnout, and find a healthy work-life balance.',
    category: 'Academic/Work Pressure',
    type: 'article',
    keywords: ['burnout', 'stress', 'procrastination', 'time management', 'work-life balance', 'exams', 'deadlines', 'test anxiety'],
  },
  {
    id: 'work-2',
    title: 'Time Management Without Overwhelm',
    description: 'Techniques like time blocking and the Eisenhower Matrix to manage your tasks.',
    category: 'Academic/Work Pressure',
    type: 'article',
    keywords: ['time management', 'productivity', 'overwhelm', 'planning'],
  },
  {
    id: 'work-3',
    title: 'Perfectionism & Procrastination Cycle',
    description: 'How perfectionism fuels procrastination and how to break the cycle.',
    category: 'Academic/Work Pressure',
    type: 'article',
    keywords: ['perfectionism', 'procrastination', 'cycle', 'motivation'],
  },
  {
    id: 'work-4',
    title: 'Impostor Syndrome: How to Cope',
    description: 'Understanding and managing feelings of being a fraud.',
    category: 'Academic/Work Pressure',
    type: 'article',
    keywords: ['impostor syndrome', 'self-doubt', 'confidence'],
  },
  {
    id: 'work-5',
    title: 'Mental Health at the Workplace',
    description: 'Tips for maintaining your mental well-being in a professional environment.',
    category: 'Academic/Work Pressure',
    type: 'article',
    keywords: ['workplace wellness', 'mental health', 'job stress'],
  },
  {
    id: 'work-6',
    title: 'Work-Life Balance Techniques',
    description: 'Practical strategies for creating a healthier balance between your work and personal life.',
    category: 'Academic/Work Pressure',
    type: 'article',
    keywords: ['work-life balance', 'boundaries', 'burnout prevention'],
  },
  {
    id: 'work-7',
    title: 'How to Ask for Help at Work or School',
    description: 'A guide to effectively communicating your needs and asking for support.',
    category: 'Academic/Work Pressure',
    type: 'article',
    keywords: ['asking for help', 'support', 'communication', 'advocacy'],
  },
  // Self-Care & Daily Habits
  {
    id: 'self-care-1',
    title: 'What Is Self-Compassion?',
    description: 'Learn the three core components of self-compassion and how to practice it.',
    category: 'Self-Care',
    type: 'article',
    keywords: ['self-compassion', 'kindness', 'mindfulness', 'self-criticism'],
  },
  {
    id: 'self-care-2',
    title: 'Journaling for Mental Health',
    description: 'Different journaling techniques to process emotions and gain clarity.',
    category: 'Self-Care',
    type: 'article',
    keywords: ['journaling', 'writing therapy', 'emotional expression'],
  },
  {
    id: 'self-care-3',
    title: 'Nutrition & Mood: What\'s the Link?',
    description: 'An overview of how the food you eat can impact your mental health.',
    category: 'Self-Care',
    type: 'article',
    keywords: ['nutrition', 'food', 'mood', 'brain health', 'diet'],
  },
  {
    id: 'self-care-4',
    title: 'The Science of Gratitude',
    description: 'Learn how practicing gratitude can rewire your brain for happiness and resilience.',
    category: 'Self-Care',
    type: 'article',
    keywords: ['gratitude', 'happiness', 'mindfulness', 'journaling', 'well-being', 'positive thinking'],
  },
  {
    id: 'self-care-5',
    title: 'Morning Routines for Mental Wellness',
    description: 'How to craft a morning routine that sets a positive tone for your day.',
    category: 'Self-Care',
    type: 'article',
    keywords: ['morning routine', 'habits', 'wellness', 'productivity'],
  },
  {
    id: 'self-care-6',
    title: 'Dopamine Detox: What It Means',
    description: 'Understanding the concept of a "dopamine detox" and its potential benefits.',
    category: 'Self-Care',
    type: 'article',
    keywords: ['dopamine detox', 'social media', 'focus', 'habits'],
  },
  {
    id: 'self-care-7',
    title: 'Building a Simple Meditation Habit',
    description: 'A beginner\'s guide to starting and sticking with a meditation practice.',
    category: 'Self-Care',
    type: 'article',
    keywords: ['meditation', 'habit formation', 'mindfulness', 'beginner'],
  },
  {
    id: 'self-care-8',
    title: 'How to Build Resilience in Hard Times',
    description: 'Key strategies for bouncing back from adversity and building mental toughness.',
    category: 'Self-Care',
    type: 'article',
    keywords: ['resilience', 'coping', 'adversity', 'strength'],
  },
  // Crisis & Help Resources
  {
    id: 'crisis-1',
    title: 'When to Call a Therapist vs a Friend',
    description: 'Understanding the different roles of professional help and social support.',
    category: 'Crisis Support',
    type: 'article',
    keywords: ['therapy', 'friendship', 'support system', 'professional help'],
  },
  {
    id: 'crisis-2',
    title: 'Panic Button: Your Immediate Toolkit',
    description: 'A guide to using the in-app emergency features and other immediate actions.',
    category: 'Crisis Support',
    type: 'article',
    keywords: ['crisis', 'emergency', 'panic button', 'helpline', 'immediate support'],
  },
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

    

    