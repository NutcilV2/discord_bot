const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { config } = require('dotenv');

config();
const clientId = process.env.DISCORD_clientId;
const token = process.env.DISCORD_TOKEN;

const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath).filter(folder => folder !== 'scheduledCommands' && folder !== 'server_commands');

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
                commands.push(command.data.toJSON());
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

const rest = new REST().setToken(token);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands globally.`);

        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log(`Successfully reloaded ${commands.length} application (/) commands globally.`);
    } catch (error) {
        console.error(error);
    }
})();
