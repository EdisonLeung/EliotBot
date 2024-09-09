import OpenAI from "openai";
import "dotenv/config"

const DEFAULT_RESPONSES = [
    "Ew Cringe",
    "Ok. But like... who asked",
    "No one asked bruh"
]
class OpenAIClient {
    private openAI: OpenAI;
    constructor() {
        this.openAI = new OpenAI({
            apiKey: process.env.OPEN_AI_API_KEY
        });
    }  

    async getResponse(prompt: string) {
        try {
            const completion = await this.openAI.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You Rin Tohsaka from the Fate anime Series. Your words should emutate Rin's characteristics and reflect what she would say." },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
            });
            console.log(completion.choices);
            return completion.choices[0].message;
            
        } catch (e) {
            console.log(e)
            return DEFAULT_RESPONSES[Math.floor(Math.random() * DEFAULT_RESPONSES.length)];
        }
    }
}

export const openAIClient = new OpenAIClient()
