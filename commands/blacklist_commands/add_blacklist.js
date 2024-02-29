const { SlashCommandBuilder } = require('discord.js');
const { sanitizeInput } = require('../../utility/inputSanitizer.js');
const mysqlFunctions = require('../../utility/mysqlFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add_blacklist')
        .setDescription('Adds specified blacklist(s) to your list')
        .addStringOption(option =>
            option.setName('blacklist')
                .setDescription('The blacklist(s) you want to add, separated by commas')
                .setRequired(true)), // Make sure the filter is required for command execution
    async execute(interaction, connection, cachedUsers) {
        const user_id = interaction.user.id;
        const user_username = interaction.user.username;
        const isCached = await cachedUsers.isUserCached(user_id, user_username);
        const rawInput = interaction.options.getString('blacklist');
        let blacklistToAdd = sanitizeInput(rawInput).split(',').map(filter => sanitizeInput(filter)); // Convert to array and trim whitespace

        try {
            const blacklistString = await mysqlFunctions.fetchUserBlacklists(user_id);
            console.log(blacklistString);
            let currentBlacklistArray = blacklistString.split(',').filter(Boolean).map(filter => sanitizeInput(filter)); // Split into array and remove any empty strings

            // Remove each specified filter from the current filters array
            blacklistToAdd.forEach(blacklist => {
                if (!currentBlacklistArray.includes(blacklist)) {
                    currentBlacklistArray.push(blacklist); // Add the filter if not found
                }
            });

            await mysqlFunctions.updateUserBlacklist(user_id, user_username, currentBlacklistArray.join(','));
            await interaction.reply(`The specified blacklist(s) have been added.`);
        } catch (error) {
            console.error('An error occurred:', error);
            await interaction.reply(`An error occurred while adding the specified blacklist(s) to the list.`);
        }
    },
};
