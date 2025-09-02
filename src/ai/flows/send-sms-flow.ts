
'use server';

/**
 * @fileOverview An AI agent that constructs and sends an emergency SMS using Twilio.
 *
 * - sendSms - A function that constructs the SMS and sends it.
 * - SendSmsInput - The input type for the sendSms function.
 * - SendSmsOutput - The return type for the sendSms function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import Twilio from 'twilio';

const SendSmsInputSchema = z.object({
  userName: z.string().describe("The name of the user in crisis."),
  emergencyContactPhone: z.string().describe("The phone number of the emergency contact."),
});
export type SendSmsInput = z.infer<typeof SendSmsInputSchema>;

const SendSmsOutputSchema = z.object({
  success: z.boolean().describe("Whether the SMS was sent successfully."),
  message: z.string().describe("The content of the SMS message that was sent."),
});
export type SendSmsOutput = z.infer<typeof SendSmsOutputSchema>;

export async function sendSms(
  input: SendSmsInput
): Promise<SendSmsOutput> {
  return sendSmsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sendSmsPrompt',
  input: { schema: SendSmsInputSchema },
  output: { schema: z.object({ message: z.string() }) },
  prompt: `Generate a concise, 4 to 5-line SMS message to be sent to an emergency contact. The user, {{userName}}, is having a mental health crisis and may be considering self-harm. The message should be calm, clear, and urgent. It must state that {{userName}} is going through a difficult time and encourage the contact to reach out to them immediately. It must also state that this is an automated message from the CounselAI app. Do not include any phone numbers or links.`,
});

const sendSmsFlow = ai.defineFlow(
  {
    name: 'sendSmsFlow',
    inputSchema: SendSmsInputSchema,
    outputSchema: SendSmsOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);

      if (!output || !output.message) {
        throw new Error("AI failed to generate an SMS message.");
      }
      
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

      if (!accountSid || !authToken || !twilioPhone) {
        console.error("Twilio credentials are not configured in .env file.");
        // We will log a simulation, but return failure to the client.
        console.log("==================================================");
        console.log("EMERGENCY SMS SIMULATION (Twilio not configured)");
        console.log(`Intended recipient: ${input.emergencyContactPhone}`);
        console.log(`Message: ${output.message}`);
        console.log("==================================================");
        return {
          success: false,
          message: "SMS sending is not configured on the server."
        };
      }

      const client = Twilio(accountSid, authToken);
      
      await client.messages.create({
         body: output.message,
         from: twilioPhone,
         to: input.emergencyContactPhone
       });

      return {
        success: true,
        message: output.message,
      };

    } catch (error) {
       console.error("Error in sendSmsFlow:", error);
       return { 
         success: false,
         message: "Failed to construct or send SMS."
       };
    }
  }
);
