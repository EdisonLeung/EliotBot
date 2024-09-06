import { Client, IntentsBitField } from "discord.js"
import OpenAI from "openai";
import { config } from "dotenv";

config()
const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_API_KEY
});

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ]
});

client.on('messageCreate', async (message) => {
    if (message.content === 'hello') {
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    {
                        role: "user",
                        content: "Write a haiku about recursion in programming.",
                    },
                ],
            });
            console.log(completion.choices);
            message.reply(completion.choices[0].message);
        } catch (e) {
            console.log(e)
        }
        message.reply("Hello!");
    }
})
client.login(process.env.DISCORD_TOKEN)