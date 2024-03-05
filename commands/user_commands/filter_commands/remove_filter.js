const { SlashCommandBuilder } = require('discord.js');
const { sanitizeInput } = require('../../../utility/inputSanitizer.js');
const mysqlFunctions = require('../../../utility/mysqlFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove_filter')
        .setDescription('Removes specified filter(s) from your list')
        .addStringOption(option =>
            option.setName('filter')
                .setDescription('The filter(s) you want to remove, separated by commas')
                .setRequired(true)), // Make sure the filter is required for command execution
    async execute(interaction, connection, cachedUsers) {
        const user_id = interaction.user.id;
        const user_username = interaction.user.username;
        const isCached = await cachedUsers.isUserCached(user_id, user_username);

        const rawInput = interaction.options.getString('filter');
        let filtersToRemove = sanitizeInput(rawInput).split(',').map(filter => sanitizeInput(filter)); // Convert to array and trim whitespace

        try {
            const filterString = await mysqlFunctions.fetchUserFilters(user_id);
            let currentFiltersArray = filterString.split(',').filter(Boolean).map(filter => sanitizeInput(filter)); // Split into array and remove any empty strings

            // Remove each specified filter from the current filters array
            console.log(currentFiltersArray);
            filtersToRemove.forEach(filter => {
                console.log(filter)
                const index = currentFiltersArray.indexOf(filter);
                if (index > -1) {
                    currentFiltersArray.splice(index, 1); // Remove the filter if found
                }
            });

            await mysqlFunctions.updateUserFilter(user_id, user_username, currentFiltersArray.join(','));
            await interaction.reply(`The specified filter(s) have been removed.`);
        } catch (error) {
            console.error('An error occurred:', error);
            await interaction.reply('An error occurred while removing your filter(s).');
        }
    },
};
