import { Client, IntentsBitField } from "discord.js"
import "dotenv/config";
import { InstallGlobalCommands } from "./util"
import { getLatestMatches } from "./api/riot";

const BLACK_LISTED_USERS = [
    "270687113677242368",
    "500476750812151808"
]
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ]
});

const commands = [
    {
        name: 'lol_stat',
        description: 'Gets league stats of given user',
        options: [
            {
                type: 3,
                name: 'riot_id',
                description: 'Riot Games Id (ex: Qwerty106#NA1)',
                required: true,
            },
            {
                type: 4,
                name: "num_games",
                description: "number of games to query",
            }
        ],
    }
];
  
InstallGlobalCommands(process.env.APP_ID, commands);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'lol_stat') {
        await interaction.reply('Retrieving Match Info...');
        const options = interaction.options.data;
        const riotId = options[0].value as string;
        const numEntries = options[1]?.value as number;
        const matchInfo = await getLatestMatches(riotId, numEntries);
        // console.log(JSON.stringify(matchInfo, undefined, 2))
        setTimeout(async () => {
            interaction.channel.send("fetched")
        }, 10000)
        
    }
});

client.on('messageCreate', async (message) => {
    // don't respond to own message
    if (message.author.id === process.env.APP_ID) {
        return;
    }

    // if user is not on blacklist, don't message them
    if (!BLACK_LISTED_USERS.includes(message.author.id)) {
        return;
    }

    // console.log("Received Message", message);
    if (message.content === 'hello') {
        message.channel.send("Bello")
    }
})
client.login(process.env.DISCORD_TOKEN)