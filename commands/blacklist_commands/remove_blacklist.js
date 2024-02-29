const { SlashCommandBuilder } = require('discord.js');
const { sanitizeInput } = require('../../utility/inputSanitizer.js');
const mysqlFunctions = require('../../utility/mysqlFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove_blacklist')
        .setDescription('Removes specified blacklist(s) from your list')
        .addStringOption(option =>
            option.setName('blacklist')
                .setDescription('The blacklist(s) you want to remove, separated by commas')
                .setRequired(true)), // Make sure the filter is required for command execution
    async execute(interaction, connection, cachedUsers) {
        const user_id = interaction.user.id;
        const user_username = interaction.user.username;
        const isCached = await cachedUsers.isUserCached(user_id, user_username);

        const rawInput = interaction.options.getString('blacklist');
        let filtersToRemove = sanitizeInput(rawInput).split(',').map(filter => sanitizeInput(filter)); // Convert to array and trim whitespace

        try {
            const blacklistString = await mysqlFunctions.fetchUserBlacklists(user_id);
            let currentBlacklistsArray = blacklistString.split(',').filter(Boolean).map(filter => sanitizeInput(filter)); // Split into array and remove any empty strings

            // Remove each specified filter from the current filters array
            console.log(currentBlacklistsArray);
            filtersToRemove.forEach(filter => {
                console.log(filter)
                const index = currentBlacklistsArray.indexOf(filter);
                if (index > -1) {
                    currentBlacklistsArray.splice(index, 1); // Remove the filter if found
                }
            });

            await mysqlFunctions.updateUserBlacklist(user_id, user_username, currentBlacklistsArray.join(','));
            await interaction.reply(`The specified blacklist(s) have been removed.`);
        } catch (error) {
            console.error('An error occurred:', error);
            await interaction.reply('An error occurred while removing your blacklist(s).');
        }
    },
};
