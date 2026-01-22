'use server';
/**
 * @fileOverview AI-powered content moderation flow to identify and flag inappropriate content.
 *
 * - moderateContent - A function that moderates content and flags inappropriate material.
 * - ModerateContentInput - The input type for the moderateContent function.
 * - ModerateContentOutput - The return type for the moderateContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateContentInputSchema = z.object({
  text: z.string().optional().describe('The text content to be moderated.'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      'A photo to be checked, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
  title: z.string().optional().describe('The title of the content being moderated.'),
  description: z.string().optional().describe('A detailed description of the content.'),
});

export type ModerateContentInput = z.infer<typeof ModerateContentInputSchema>;

const ModerateContentOutputSchema = z.object({
  isAppropriate: z.boolean().describe('Whether the content is appropriate or not.'),
  flagReasons: z.array(
    z.string().describe('Reasons why the content might be inappropriate.')
  ),
});

export type ModerateContentOutput = z.infer<typeof ModerateContentOutputSchema>;

export async function moderateContent(input: ModerateContentInput): Promise<ModerateContentOutput> {
  return moderateContentFlow(input);
}

const moderateContentPrompt = ai.definePrompt({
  name: 'moderateContentPrompt',
  input: {schema: ModerateContentInputSchema},
  output: {schema: ModerateContentOutputSchema},
  prompt: `You are an AI content moderation expert. Your task is to determine if the provided content is appropriate for a family-friendly cultural experience marketplace.

  Consider the following:
  - Inappropriate Language: Check for offensive, hateful, or explicit language.
  - Fake Photos: Determine if the photo seems genuine and relevant to the content.
  - Misleading content: Determines whether the title and description matches the photo.

  Content to moderate:
  Title: {{{title}}}
  Description: {{{description}}}
  Text: {{{text}}}
  Photo: {{#if photoDataUri}}{{media url=photoDataUri}}{{else}}No photo provided{{/if}}

  Based on your analysis, provide a determination of whether the content is appropriate and, if not, list the reasons why.
  Ensure that your response is formatted according to the output schema, paying particular attention to the descriptions provided for each field.
`,
});

const moderateContentFlow = ai.defineFlow(
  {
    name: 'moderateContentFlow',
    inputSchema: ModerateContentInputSchema,
    outputSchema: ModerateContentOutputSchema,
  },
  async input => {
    const {output} = await moderateContentPrompt(input);
    return output!;
  }
);
