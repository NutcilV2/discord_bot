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

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
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
