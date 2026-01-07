# CounselAI-G505-PS25
Repo for CounselAI PS project


<h1>CounselAI: A Proactive, Expressive Voice Assistant for Mental Health</h1>


<h2>🌟 Overview</h2>

CounselAI is a next-generation, voice-based AI assistant for mental health counseling. It's designed to provide real-time, emotionally expressive, and personalized support to users. Moving beyond traditional, reactive systems, CounselAI engages in natural and empathetic conversations. It achieves this by recognizing emotional cues and adapting its tone, rhythm, and persona to suit individual needs.
The core of this project is to create a proactive, responsive, and privacy-conscious assistant that improves accessibility and trust in psychological care through seamless, human-like interactions.

<h2>✨ Key Features</h2>

CounselAI leverages the cutting-edge capabilities of Voila, a family of voice-language foundation models, to deliver a unique user experience.
•Proactive & Autonomous Interaction: Instead of passively waiting for commands, CounselAI continuously listens and reasons, allowing it to proactively engage with users and offer support when it detects 	emotional distress.

•Real-Time, Low-Latency Conversations: With a response latency as low as 195 milliseconds, interactions are fluid and natural, mimicking human conversation and eliminating awkward delays.
•Emotionally Expressive & Empathetic: The system preserves and understands rich vocal nuances like tone, rhythm, and emotion, enabling it to respond with genuine empathy.

•Customizable Personas: CounselAI can be tailored to different therapeutic styles (e.g., CBT, mindfulness-focused). Users can define the AI's persona and tone through simple text instructions.

•Unified, End-to-End Architecture: By using Voila's end-to-end model, CounselAI avoids the high latency and loss of vocal nuance common in traditional pipeline systems (ASR → LLM → TTS).

•Privacy-First Design: All interactions are handled through a secure, healthcare-grade backend with robust user session management and data anonymization to ensure confidentiality.




<h2>🛠️ System Architecture</h2>


CounselAI is built on a sophisticated architecture that integrates Voila's powerful voice-language models with a secure and scalable backend.

1.User Interface: An intuitive frontend application for patients to access, schedule, and interact with their AI counselor.

2.Voila API Integration: The application communicates with our backend, which leverages the Voila-autonomous model. This full-duplex model allows the system to listen, reason, and speak simultaneously, creating a
truly interactive experience.

3.Backend Services: A secure, healthcare-grade backend manages user authentication, session logging (with anonymization), and the logic for adaptive conversations.

4.Persona & Voice Customization: The backend uses text-based instructions to dynamically configure the Voila model's persona and voice, allowing for different therapeutic approaches and user preferences.


<h2>TECH STACK</h2>

Frontend: Made using React.js (from the MERN stack) for an interactive web app experience.

Backend: FastAPI (Python) handles all API calls and intelligent agent workflows.

Database: MongoDB stores user info and session data, with encryption for privacy.

Voice Features: We use the Voila API to turn speech into text (and back), making conversations feel smooth and natural.

Agentic Workflow Engine: A custom Python part that manages the conversation, detects emotions, and makes sure every response fits the user’s needs.

Authentication: We use JWT/OAuth2 to make sure only the right people have access and that everyone’s data stays private.

Deployment: Everything is packed in Docker containers, ready to be run and scaled on cloud services like AWS, Azure, or GCP.



<h2>Architecture Diagram</h2>


<img width="3093" height="1313" alt="diagram-export-7-29-2025-7_42_15-PM" src="https://github.com/user-attachments/assets/be5dc8c0-dcf1-4cfc-8697-6027e3819657" />



<h2>Workflow</h2>

<img width="4294" height="1654" alt="diagram-export-7-29-2025-7_31_06-PM" src="https://github.com/user-attachments/assets/6dd690ae-ecf5-468e-a33b-bfb47bee20f4" />


<h2>WHY AGENTIC WORKFLOWS ? </h2>

Better Empathy:
Regular AI assistants just wait and reply after we’re done speaking, but with agentic workflows, our AI can listen, read the situation, and give empathetic, supportive responses right when they're needed. That’s really important in mental health care.

Personalized Support:
Agentic workflows allow the assistant to actually adjust its “personality”—like voice tone or way of talking—based on how a user feels or what they prefer. It means conversations are more relatable and helpful.

Easy to Upgrade:
This way of building makes it super easy to add new therapy techniques, different emotion detection models, or even more privacy features in the future. So as our project grows, it keeps improving for everyone.



<h2>Contributors</h2>


| Name | Github URL | 
|----------|----------|
| Tiruveedula Revanth   | [Tiruveedula Revanth](https://github.com/TiruveedulaRevanth)   |
| Pranav Pulipati   | [Pranav Pulipati](https://github.com/PulipatiPranav)  | 
| Jatin Kanduri | [Jatin Kanduri](https://github.com/jatinkanduri)  |
| B Shreyas Reddy  | [B Shreyas Reddy](https://github.com/shreyasreddy21) | 
| Anish Peddi | [Anish Peddi](https://github.com/sAnishPeddi)  |









To run the code
first do "npm i"
then
open 2 terminals: 
1. npm run dev
2. npm run genkit:watch
