// Require the necessary discord.js classes
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const schedule = require('node-schedule');
const scheduled_dm = require('./commands/scheduledCommands/scheduled_dm.js');
const { token } = require('./config.json');
const { config } = require('dotenv');
const fs = require('node:fs');
const path = require('node:path');
const connection = require('./utility/dbConnection');
const cachedUsers = require('./utility/cachedUsers');
const cachedServers = require('./utility/cachedServers');

config();

// Create a new client instance
const client = new Client({
		intents: [
				GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages
		],
		partials: [
				'MESSAGE', 'CHANNEL', 'REACTION'
		], // Uncomment if you need to handle uncached messages or reactions
});
const TOKEN = process.env.DISCORD_TOKEN;

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

function loadCommands(directory) {
    const items = fs.readdirSync(directory, { withFileTypes: true }); // Read directory contents

    for (const item of items) {
        const itemPath = path.join(directory, item.name); // Full path to the item

        if (item.isDirectory()) {
            // If the item is a directory, recurse into it
            loadCommands(itemPath);
        } else if (item.isFile() && item.name.endsWith('.js')) {
            // If the item is a .js file, load the command
            const command = require(itemPath);
            if ('data' in command && 'execute' in command) {
                // Set a new item in the Collection with the key as the command name and the value as the exported module
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${itemPath} is missing a required "data" or "execute" property.`);
            }
        }
    }
}

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    loadCommands(commandsPath);
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction, connection, cachedUsers);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
		console.log(`Ready! Logged in as ${readyClient.user.tag}`);
	  console.log(`${TOKEN}`)

		// Schedule a task to run at 14:00 every day
		schedule.scheduleJob('00 00 * * *', function() {
    //schedule.scheduleJob('* * * * *', function() {
        console.log('Running scheduled Direct Message task...');
        scheduled_dm.execute(client, connection, cachedUsers, true);
    });
});

// Log in to Discord with your client's token
client.login(TOKEN);
