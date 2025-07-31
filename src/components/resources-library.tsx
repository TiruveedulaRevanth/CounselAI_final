
"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "./ui/scroll-area";
import ResourceCard from "./resource-card";
import { Library } from "lucide-react";
import { Button } from "./ui/button";

interface ResourcesLibraryProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export type Resource = {
  id: string;
  title: string;
  description: string;
  category: 'Anxiety' | 'Depression' | 'Sleep' | 'Stress' | 'Relationships' | 'Gratitude' | 'Grief' | 'Mindfulness' | 'Self-Care' | 'Academic/Work Pressure' | 'Crisis Support';
  type: 'article' | 'video';
  content?: string;
  videoUrl?: string;
  keywords: string[];
};

const resourcesData: Resource[] = [
  {
    id: 'anxiety-1',
    title: 'Understanding Anxiety and Panic Attacks',
    description: 'A deep dive into the mechanisms of anxiety, its symptoms, and how panic attacks differ.',
    category: 'Anxiety',
    type: 'article',
    keywords: ['anxiety', 'panic attacks', 'stress', 'fear', 'worry', 'symptoms'],
    content: `Anxiety is a natural human response to stress—a feeling of fear or apprehension about what’s to come. It’s the body’s way of preparing you for a challenge. For instance, feeling anxious before a major exam or a public speaking event is perfectly normal. This type of anxiety can even be beneficial, as it sharpens your focus and readies your body for action. However, when these feelings of intense fear and distress become overwhelming, persistent, and interfere with daily life, it may indicate an anxiety disorder.

Anxiety disorders are a group of mental illnesses that cause constant and overwhelming anxiety and fear. The anxiety can be so severe that it affects your ability to work, study, and maintain relationships. The physical symptoms are also very real and can include a pounding heart, shortness of breath, sweating, trembling, and dizziness. These symptoms are not just "in your head"; they are the result of the body's fight-or-flight response being activated inappropriately or for prolonged periods.

A panic attack is a specific, sudden episode of intense fear that triggers severe physical reactions when there is no real danger or apparent cause. Panic attacks can be terrifying. You might feel like you are losing control, having a heart attack, or even dying. Symptoms can peak within minutes and may include a racing heart, chest pain, feeling of choking, and a sense of impending doom.

The key difference between general anxiety and a panic attack lies in the onset and duration. Anxiety often builds gradually and can be long-lasting, simmering in the background of your day. A panic attack, on the other hand, is abrupt and intense, typically lasting for a short period. While someone with an anxiety disorder can experience panic attacks, not everyone who has a panic attack has an anxiety disorder. Understanding this distinction is the first step toward seeking the right kind of help and developing effective coping strategies tailored to your specific experience.`
  },
  {
    id: 'anxiety-2',
    title: 'Guided Meditation for Anxiety',
    description: 'A 10-minute guided meditation to calm your mind and release anxiety.',
    category: 'Anxiety',
    type: 'video',
    keywords: ['meditation', 'mindfulness', 'anxiety', 'calm'],
    videoUrl: 'https://www.youtube.com/embed/O-6f5wQXSu8',
  },
  {
    id: 'depression-1',
    title: 'What is Depression?',
    description: 'A comprehensive overview of depression, its symptoms, causes, and the importance of seeking help.',
    category: 'Depression',
    type: 'article',
    keywords: ['depression', 'sadness', 'low mood', 'mental health', 'hopelessness'],
    content: `Depression, clinically known as Major Depressive Disorder (MDD), is more than just feeling sad. It's a persistent and serious mood disorder that affects how you feel, think, and handle daily activities, such as sleeping, eating, or working. To be diagnosed with depression, the symptoms must be present for at least two weeks.

It's a common misconception that depression is a sign of weakness or something you can simply "snap out of." It is a complex medical illness with biological, psychological, and social factors contributing to its development. Brain chemistry, genetics, personality traits, and stressful life events can all play a role.

The symptoms of depression can vary widely from person to person, but commonly include a persistent sad, anxious, or "empty" mood; feelings of hopelessness or pessimism; and irritability. Many people experience a significant loss of interest or pleasure in activities they once enjoyed. Physical symptoms are also common, including fatigue, changes in appetite or sleep patterns, and unexplained aches or pains. Cognitive symptoms can include difficulty concentrating, remembering details, and making decisions. In severe cases, it can lead to thoughts of death or suicide.

It is crucial to understand that depression is treatable. The most common treatments are psychotherapy (talk therapy), medication, or a combination of the two. Psychotherapy can help you learn new ways of thinking and behaving and change habits that may be contributing to your depression. Antidepressant medications can help modify brain chemistry. No single treatment is right for everyone, and it often takes time to find the best approach. Lifestyle changes, such as regular exercise, a healthy diet, and a consistent sleep schedule, can also have a significant positive impact. Seeking help is a sign of strength, and the first step toward recovery and reclaiming your well-being.`
  },
  {
    id: 'sleep-1',
    title: 'A Deeper Dive into Better Sleep',
    description: 'Beyond basic tips, understand the science of sleep and advanced strategies for a truly restful night.',
    category: 'Sleep',
    type: 'article',
    keywords: ['sleep', 'insomnia', 'rest', 'sleep hygiene', 'circadian rhythm'],
    content: `Quality sleep is not a luxury; it is a biological necessity, fundamental to our physical and mental health. While we sleep, our brains are hard at work processing information, consolidating memories, and clearing out toxins. Our bodies use this time to repair cells, restore energy, and release essential hormones. Consistently failing to get enough quality sleep can have serious consequences, impacting everything from our mood and cognitive function to our immune system and risk of chronic disease.

The foundation of good sleep is a healthy circadian rhythm, our body's internal 24-hour clock. This clock is heavily influenced by light exposure. To regulate it, aim for exposure to natural sunlight in the morning, which signals to your body that it's time to be awake. Conversely, in the evening, minimize exposure to bright screens (phones, tablets, computers) as the blue light they emit can suppress the production of melatonin, the hormone that tells your body it's time to sleep.

Creating a sanctuary for sleep is also critical. Your bedroom should be cool, dark, and quiet. Invest in blackout curtains, use an eye mask, or try earplugs to minimize disruptions. The ideal temperature for sleep is typically between 60-67°F (15-19°C).

Your pre-sleep routine, or "sleep hygiene," can make or break your night. Establish a relaxing wind-down period at least 30-60 minutes before bed. This could include activities like reading a physical book, taking a warm bath, listening to calming music, or gentle stretching. Avoid stimulating activities like watching intense TV shows, engaging in stressful conversations, or checking work emails. What you consume also matters. Avoid caffeine and alcohol for several hours before bedtime. While alcohol might make you feel drowsy initially, it disrupts the sleep cycle later in the night, leading to less restorative sleep. If you find yourself unable to fall asleep after 20 minutes, get out of bed and do something relaxing in low light until you feel sleepy again. This prevents your brain from associating your bed with the frustration of being awake.`
  },
  {
    id: 'stress-1',
    title: 'How to Manage and Reduce Stress',
    description: 'Practical strategies for coping with stress in your daily life.',
    category: 'Stress',
    type: 'video',
    keywords: ['stress', 'coping', 'management', 'relaxation', 'burnout'],
    videoUrl: 'https://www.youtube.com/embed/hnpQrMqDoqE',
  },
    {
    id: 'relationships-1',
    title: 'The Blueprint for Healthy Relationships',
    description: 'Explore the core components of healthy relationships, from communication to trust.',
    category: 'Relationships',
    type: 'article',
    keywords: ['relationships', 'communication', 'boundaries', 'love', 'conflict', 'trust'],
    content: `Healthy relationships are a cornerstone of a fulfilling life, providing a source of joy, support, and personal growth. They are not built on grand gestures, but on a foundation of small, consistent actions rooted in respect, communication, and trust.

**Communication** is the lifeblood of any strong connection. This means more than just talking; it means listening to understand, not just to reply. It involves expressing your own needs and feelings honestly and respectfully, using "I" statements to avoid placing blame (e.g., "I feel hurt when..." instead of "You always make me..."). Healthy communication also requires being open to feedback and willing to see things from the other person's perspective, even if you don't agree.

**Boundaries** are the guidelines that define what you are comfortable with in a relationship. They are not walls to keep people out, but fences to protect your own well-being and sense of self. Setting healthy boundaries requires self-awareness—knowing your limits and what you need to feel safe and respected. This could relate to your time, your emotional space, or your physical comfort. Communicating these boundaries clearly and calmly is essential, as is respecting the boundaries of others. It's about finding a balance between connection and individuality.

**Trust** is the glue that holds a relationship together. It is built over time through reliability, integrity, and consistency. It means believing that the other person has your best interests at heart and will follow through on their commitments. Trust also involves vulnerability—being ableto share your true self without fear of judgment or betrayal. When trust is broken, it can be repaired, but it requires honesty, accountability, and a genuine commitment from both parties to rebuild it through transparent actions.

Finally, a healthy relationship involves **mutual respect**. This means valuing each other's opinions, feelings, and needs, and supporting each other's individual goals and passions. It's about celebrating each other's successes and providing a safe harbor during times of struggle, all while maintaining your own identity.`
  },
  {
    id: 'gratitude-1',
    title: 'The Science and Practice of Gratitude',
    description: 'Learn how practicing gratitude can rewire your brain for happiness and resilience.',
    category: 'Gratitude',
    type: 'article',
    keywords: ['gratitude', 'happiness', 'mindfulness', 'journaling', 'well-being', 'positive thinking'],
    content: `Gratitude is more than just a fleeting feeling of thankfulness; it's a powerful practice that can fundamentally change your perspective and improve your mental well-being. It is the art of actively noticing and appreciating the good things in your life, no matter how small. Scientific studies have shown that a regular gratitude practice can lead to increased happiness, reduced symptoms of depression, better sleep, and greater resilience in the face of adversity.

So, how does it work? When you practice gratitude, you are essentially training your brain to scan the world for positives rather than negatives. This is a concept known as neuroplasticity—the brain's ability to reorganize itself by forming new neural connections. By consistently focusing on what you're thankful for, you strengthen the neural pathways associated with positive emotions like joy, contentment, and love. This can help counteract the brain's natural "negativity bias," our tendency to pay more attention to negative experiences than positive ones.

Starting a gratitude practice is simple. One of the most effective methods is keeping a gratitude journal. Each day, take a few minutes to write down three to five things you are grateful for. Be specific. Instead of just writing "I'm grateful for my family," try "I'm grateful for the way my partner made me laugh today." This specificity helps you relive the positive emotion associated with the memory.

Another powerful technique is the "gratitude visit." Think of someone who has made a positive impact on your life and write them a detailed letter expressing your appreciation. If possible, deliver it in person and read it aloud. Studies have shown this exercise provides a significant and lasting boost to happiness for both the writer and the recipient.

You can also incorporate gratitude into your daily routine through mindfulness. As you go about your day, make a conscious effort to notice the small joys: the warmth of the sun on your skin, the taste of your morning coffee, or a kind word from a stranger. The key is consistency. Like any form of exercise, the benefits of gratitude compound over time, leading to a more optimistic and resilient outlook on life.`
  },
  {
    id: 'grief-1',
    title: 'Navigating the Complex Path of Grief',
    description: 'Understanding that grief is a unique and non-linear journey.',
    category: 'Grief',
    type: 'article',
    keywords: ['grief', 'loss', 'bereavement', 'sadness', 'coping', 'mourning'],
    content: `Grief is a natural, albeit painful, response to loss. It is the emotional landscape we must navigate after losing someone or something we love. While often associated with the death of a loved one, grief can also arise from other significant life changes, such as the end of a relationship, the loss of a job, or a decline in health. It's important to understand that there is no "right" way to grieve. Your journey through grief is as unique as your relationship with what you have lost.

You may have heard of the "five stages of grief": denial, anger, bargaining, depression, and acceptance. While this model can be helpful for identifying some of the emotions you might experience, it's crucial to know that grief is not a neat, linear process. You may not experience all of these stages, and you may not experience them in that order. Grief is more like a wild, unpredictable ocean than a straight path. Some days, the waves will be overwhelming, while on other days, the waters may be calm.

The emotional symptoms of grief are vast and can include shock, sadness, guilt, anger, and fear. You might find yourself replaying events in your head or feeling a profound sense of emptiness. Grief can also manifest physically, leading to fatigue, nausea, weight changes, and a weakened immune system. It can feel isolating, but it's important to remember that these responses are normal.

Coping with grief requires patience and self-compassion. Allow yourself to feel your emotions without judgment. Suppressing them can prolong the healing process. Find healthy ways to express your feelings, whether it's through talking with a trusted friend or family member, journaling, or engaging in a creative outlet like painting or music.

Maintaining your physical health is also vital. Try to eat nutritious meals, get some form of gentle exercise, and prioritize sleep, even when it feels difficult. Lean on your support system. Connecting with others who understand your pain can make you feel less alone. Support groups, either in-person or online, can provide a safe space to share your experience. And remember, seeking professional help from a therapist or counselor is a sign of strength. They can provide you with tools and strategies to navigate the complexities of your loss. Healing doesn't mean forgetting; it means learning to live with the loss in a new way, carrying the memory of what you've lost with you as you move forward.`
  },
  {
    id: 'mindfulness-1',
    title: 'An Introduction to Mindfulness',
    description: 'Learn the core principles of mindfulness and simple exercises to bring more presence to your daily life.',
    category: 'Mindfulness',
    type: 'article',
    keywords: ['mindfulness', 'meditation', 'presence', 'awareness', 'stress reduction', 'focus'],
    content: `Mindfulness is the basic human ability to be fully present, aware of where we are and what we’re doing, and not overly reactive or overwhelmed by what’s going on around us. While it’s something we all naturally possess, it’s a skill that can be cultivated and deepened through practice, much like strengthening a muscle. The goal of mindfulness isn't to stop your thoughts or empty your mind, but rather to observe your thoughts and feelings from a distance without judging them.

In our fast-paced, constantly connected world, our minds are often racing—jumping from worries about the future to regrets about the past. Mindfulness provides an anchor to the present moment, offering a powerful antidote to this mental chatter. By bringing a gentle, accepting awareness to our current experience, we can reduce stress, improve focus, and enhance our overall sense of well-being.

One of the simplest ways to practice mindfulness is through focused breathing. Find a quiet place to sit comfortably. Close your eyes and bring your attention to the physical sensation of your breath. Notice the feeling of the air entering your nostrils, filling your lungs, and then leaving your body. Your mind will inevitably wander—that's what minds do. When it does, gently acknowledge the thought without criticism and guide your attention back to your breath. This act of returning your focus, again and again, is the core of the practice.

You can also integrate mindfulness into everyday activities. This is often called informal mindfulness. For example, when you're drinking your morning coffee, try to do so mindfully. Notice the warmth of the mug, the aroma of the coffee, and the taste of each sip. When you're walking, pay attention to the sensation of your feet on the ground and the movement of your body.

The benefits of a consistent mindfulness practice are well-documented. Studies have shown it can reduce symptoms of anxiety and depression, improve sleep quality, lower blood pressure, and even enhance immune function. By learning to anchor ourselves in the present, we can navigate life's challenges with greater calm, clarity, and resilience.`
  },
  {
    id: 'self-care-1',
    title: 'Building Your Personal Self-Care Toolkit',
    description: 'Self-care is not selfish. Learn how to build a sustainable practice that works for you.',
    category: 'Self-Care',
    type: 'article',
    keywords: ['self-care', 'well-being', 'burnout', 'routine', 'balance'],
    content: `Self-care is any intentional action you take to care for your physical, mental, and emotional health. It's a broad concept, and it looks different for everyone. The key is that it is intentional and tailored to you. It is not about indulgence; it is about preservation. In a world that often demands constant productivity, prioritizing self-care is a radical act of self-preservation that is essential for long-term well-being and resilience.

Think of building a self-care plan like building a toolkit. You need a variety of tools for different situations. Some tools are for daily maintenance, while others are for when things get tough. A balanced toolkit should address several key areas:

**1. Physical Self-Care:** This involves moving your body, getting enough sleep, and eating nutritious food. It doesn’t have to mean intense workouts. It could be a gentle walk, stretching, or dancing to your favorite song. Prioritizing sleep is one of the most effective forms of self-care. Fueling your body with foods that make you feel good is another cornerstone.

**2. Mental Self-Care:** This is about stimulating your mind and reducing stress. Activities could include reading a book, doing a puzzle, learning a new skill, or practicing mindfulness. It also means setting boundaries around mental clutter, such as limiting your news consumption or time on social media.

**3. Emotional Self-Care:** This involves acknowledging and processing your feelings in a healthy way. This could be through journaling, talking to a trusted friend or therapist, or engaging in a creative hobby. It's about giving yourself permission to feel without judgment.

**4. Social Self-Care:** Nurturing your relationships with others is crucial. This means spending quality time with people who uplift you. It could be a deep conversation with a friend, a fun outing with family, or a quiet evening with a partner.

**How to Start:** Begin by identifying small, manageable activities you can incorporate into your daily or weekly routine. Start with just 5-10 minutes a day. The goal is not to add more stress to your life but to find sustainable practices that replenish your energy. Be flexible and compassionate with yourself. Some days, self-care might be a bubble bath; other days, it might simply be saying "no" to a commitment that would overwhelm you. The most important thing is to listen to your body and mind and give them what they need.`
  },
  {
      id: 'work-pressure-1',
      title: 'Managing Academic and Work Pressure',
      description: 'Strategies to cope with pressure, avoid burnout, and find a healthy work-life balance.',
      category: 'Academic/Work Pressure',
      type: 'article',
      keywords: ['burnout', 'stress', 'procrastination', 'time management', 'work-life balance', 'exams', 'deadlines'],
      content: `Academic and professional environments can be incredibly demanding, often leading to significant stress and pressure. While a healthy amount of pressure can be motivating, chronic stress can lead to burnout, a state of emotional, physical, and mental exhaustion caused by prolonged or excessive stress. Recognizing the signs of burnout—such as cynicism, feelings of ineffectiveness, and exhaustion—is the first step toward managing it.

One of the most effective strategies for managing pressure is effective **time management**. The Eisenhower Matrix is a great tool for this. Categorize your tasks into four quadrants:
1.  **Urgent and Important:** (Do first) - Crises, deadlines, pressing problems.
2.  **Important, but Not Urgent:** (Schedule) - Prevention, planning, relationship building. This is where you should aim to spend most of your time.
3.  **Urgent, but Not Important:** (Delegate) - Interruptions, some meetings, other people's minor issues.
4.  **Neither Urgent nor Important:** (Eliminate) - Trivial tasks, time-wasters.

This helps you focus on what truly matters, rather than getting caught up in the tyranny of the urgent. Another powerful technique is the **Pomodoro Technique**: work in focused 25-minute intervals, followed by a 5-minute break. After four "Pomodoros," take a longer break of 15-30 minutes. This prevents mental fatigue and improves concentration.

**Setting Boundaries** is also critical. Learn to say "no" to additional commitments when your plate is already full. In a digital world, this also means setting boundaries with technology. Designate specific times to check email and messages, and create "offline" hours where you can disconnect and recharge. It's not about working harder; it's about working smarter and preserving your energy.

Finally, prioritize **Self-Care**. Ensure you are getting adequate sleep, eating nutritious meals, and engaging in regular physical activity. These are non-negotiable for building resilience against stress. Make time for hobbies and social connections that have nothing to do with your work or studies. A healthy work-life balance isn't a luxury; it's a necessity for sustained performance and overall well-being. If you're struggling, don't hesitate to reach out to a manager, academic advisor, or a mental health professional for support.`
  }
];

export default function ResourcesLibrary({ isOpen, onOpenChange }: ResourcesLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeResource, setActiveResource] = useState<Resource | null>(null);

  const filteredResources = useMemo(() => {
    return resourcesData.filter(resource => {
      const searchTermLower = searchTerm.toLowerCase();
      const searchMatch = searchTerm.trim() === '' ||
        resource.title.toLowerCase().includes(searchTermLower) ||
        resource.description.toLowerCase().includes(searchTermLower) ||
        resource.category.toLowerCase().includes(searchTermLower) ||
        resource.keywords.some(k => k.toLowerCase().includes(searchTermLower));
      return searchMatch;
    });
  }, [searchTerm]);

  const handleClose = () => {
    onOpenChange(false);
    // Delay resetting state to allow dialog to close smoothly
    setTimeout(() => {
        setActiveResource(null);
        setSearchTerm("");
    }, 300);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Library />
            Resources Library
          </DialogTitle>
          <DialogDescription>
            Explore articles, videos, and tools to support your mental well-being.
          </DialogDescription>
        </DialogHeader>
        
        {activeResource ? (
            <div className="flex-1 flex flex-col min-h-0">
                <Button variant="outline" onClick={() => setActiveResource(null)} className="mb-4 self-start">
                    &larr; Back to Library
                </Button>
                <ScrollArea className="flex-1 pr-4 -mr-6">
                    <div className="pr-6">
                        <h2 className="text-2xl font-bold mb-2">{activeResource.title}</h2>
                        <p className="text-muted-foreground mb-4">{activeResource.description}</p>
                        {activeResource.type === 'video' && activeResource.videoUrl ? (
                            <div className="aspect-video">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={activeResource.videoUrl}
                                    title={activeResource.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="rounded-lg"
                                ></iframe>
                            </div>
                        ) : (
                            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed text-base">
                                {activeResource.content}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search by title, keyword, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
                {filteredResources.length > 0 ? (
                  filteredResources.map(resource => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      onReadMore={() => setActiveResource(resource)}
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground col-span-full text-center py-8">
                    No resources found. Try adjusting your search or filters.
                  </p>
                )}
              </div>
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
