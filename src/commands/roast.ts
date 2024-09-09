import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { getLatestMatches, matchInfoMarkdown } from "../api/riot";
import { openAIClient } from "../api/openai";

export async function roast(interaction: ChatInputCommandInteraction<CacheType>) {
    await interaction.reply('Lets take a look at your latest league matches');

    const options = interaction.options.data;
    const riotId = options[0].value as string;
    const { matches: latestMatches, puuid } = await getLatestMatches(riotId);

    if (latestMatches.length === 0) {
        await interaction.channel.send("Wow ur so bad that you don't even have any games");
        return;
    }
    const matchMarkdown =  matchInfoMarkdown(latestMatches, puuid);
    await interaction.channel.send(matchMarkdown);
    
    const response = await openAIClient.getResponse("Given the following league game stats, Critique the stats and point out areas of improvement. Be as harsh and rude as possible: " + matchInfoMarkdown(latestMatches, puuid))

    await interaction.channel.send(response);
}