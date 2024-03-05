const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { config } = require('dotenv');

config();
const clientId = process.env.DISCORD_clientId;
const guildId = process.env.guildId;
const token = process.env.DISCORD_TOKEN;

const commands = [];
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath).filter(folder => folder !== 'scheduledCommands');
//const commandFolders = fs.readdirSync(foldersPath);


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


// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
