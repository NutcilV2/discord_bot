const { SlashCommandBuilder } = require('discord.js');
const { sanitizeInput } = require('../../utility/inputSanitizer.js');
const mysqlFunctions = require('../../utility/mysqlFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add_filter')
        .setDescription('Adds specified filter(s) from your list')
        .addStringOption(option =>
            option.setName('filter')
                .setDescription('The filter(s) you want to add, separated by commas')
                .setRequired(true)), // Make sure the filter is required for command execution
    async execute(interaction, connection, cachedUsers) {
        const user_id = interaction.user.id;
        const user_username = interaction.user.username;
        const isCached = await cachedUsers.isUserCached(user_id, user_username);

        const rawInput = interaction.options.getString('filter');
        let filtersToAdd = sanitizeInput(rawInput).split(',').map(filter => sanitizeInput(filter)); // Convert to array and trim whitespace

        try {
            const filterString = await mysqlFunctions.fetchUserFilters(user_id);
            let currentFiltersArray = filterString.split(',').filter(Boolean).map(filter => sanitizeInput(filter)); // Split into array and remove any empty strings

            // Remove each specified filter from the current filters array
            filtersToAdd.forEach(filter => {
                if (!currentFiltersArray.includes(filter)) {
                    currentFiltersArray.push(filter); // Add the filter if not found
                }
            });

            await mysqlFunctions.updateUserFilter(user_id, user_username, currentFiltersArray.join(','));
            await interaction.reply(`The specified filter(s) have been added.`);
        } catch (error) {
            console.error('An error occurred:', error);
            await interaction.reply(`The specified filter(s) have been added.`);
        }
    },
};
