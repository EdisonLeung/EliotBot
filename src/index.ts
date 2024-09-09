import { Client, IntentsBitField, messageLink } from "discord.js"
import "dotenv/config";
import { InstallGlobalCommands } from "./util"
import { lol_stat } from "./commands/lol_stat";
import { openAIClient } from "./api/openai";
import { roast } from "./commands/roast";

const BLACK_LISTED_USERS = [
    "270687113677242368",
    "500476750812151808"
]
const QUICK_REPLY_ACTIVE = true;
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ]
});

export const COMMAND_NAMES = {
    LOL_STAT: "lol_stat",
    ROAST: "roast"
}
const commands = [
    {
        name: COMMAND_NAMES.LOL_STAT,
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
    },
    {
        name: COMMAND_NAMES.ROAST,
        description: 'Roast the league stats of a given user',
        options: [
            {
                type: 3,
                name: 'riot_id',
                description: 'Riot Games Id (ex: Qwerty106#NA1)',
                required: true,
            }
        ]
    }
];
  
InstallGlobalCommands(process.env.APP_ID, commands);

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    switch (interaction.commandName) {
        case COMMAND_NAMES.LOL_STAT:
            lol_stat(interaction);
            break;
        case COMMAND_NAMES.ROAST:
            roast(interaction)
            break;
        default:
            await interaction.reply("Not Valid Command")
            break;
    }
});

// General Channel ID: 836813902305165346
client.on('messageCreate', async (message) => {
    // don't respond to own message
    if (message.author.id === process.env.APP_ID) {
        return;
    }

    // if user is not on blacklist, don't message them
    if (!BLACK_LISTED_USERS.includes(message.author.id)) {
        return;
    }

    if (QUICK_REPLY_ACTIVE) {
        console.log(process.env.QUICK_REPLY_ACTIVE);
        const response = await openAIClient.getResponse("Come up with a sassy, snarky, and rude response to the following message: " + message.content);
        message.channel.send(response)
    }
})
client.login(process.env.DISCORD_TOKEN)