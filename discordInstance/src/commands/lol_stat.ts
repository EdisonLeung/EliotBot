import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { getLatestMatches, ID_TO_SUMMONER_SPELL, MatchInfo, matchInfoMarkdown } from "../api/riot";

export async function lol_stat(interaction: ChatInputCommandInteraction<CacheType>) {
    await interaction.reply('Retrieving Match Info...');

    const options = interaction.options.data;
    const riotId = options[0].value as string;
    const numEntries = options[1]?.value as number;
    const { matches: latestMatches, puuid } = await getLatestMatches(riotId, numEntries);

    if (latestMatches.length === 0) {
        await interaction.channel.send("No Recent Matches Found For " + riotId);
        return;
    }

    await interaction.channel.send(`
        **${riotId}'s Most Recent League Game Results**
        ${matchInfoMarkdown(latestMatches, puuid)}
    `);
}
