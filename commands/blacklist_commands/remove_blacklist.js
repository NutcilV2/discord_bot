const { SlashCommandBuilder } = require('discord.js');
const { sanitizeInput } = require('../../utility/inputSanitizer.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove_blacklist')
        .setDescription('Removes specified filters from your list')
        .addStringOption(option =>
            option.setName('blacklist')
                .setDescription('The blacklist(s) you want to remove, separated by commas')
                .setRequired(true)), // Make sure the filter is required for command execution
    async execute(interaction, connection) {
        const user_id = interaction.user.id; // Get the user's ID
        const rawInput = interaction.options.getString('filter');
        let filtersToRemove = sanitizeInput(rawInput).split(',').map(filter => sanitizeInput(filter)); // Convert to array and trim whitespace

        // Fetch the current filters for the user
        const fetchFilters = () => new Promise((resolve, reject) => {
            const sql = `SELECT User_Blacklist FROM users WHERE User_Id = ?;`;
            connection.query(sql, [user_id], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results.length > 0 ? results[0].User_Filter : '');
                }
            });
        });

        // Update the user's filters in the database
        const updateFilters = (updatedFilters) => new Promise((resolve, reject) => {
            const sql = `UPDATE users SET User_Blacklist = ? WHERE User_Id = ?;`;
            connection.query(sql, [updatedFilters, user_id], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });

        try {
            const currentFiltersString = await fetchFilters();
            let currentFiltersArray = currentFiltersString.split(',').filter(Boolean).map(filter => sanitizeInput(filter)); // Split into array and remove any empty strings

            // Remove each specified filter from the current filters array
            console.log(currentFiltersArray);
            filtersToRemove.forEach(filter => {
                console.log(filter)
                const index = currentFiltersArray.indexOf(filter);
                if (index > -1) {
                    currentFiltersArray.splice(index, 1); // Remove the filter if found
                }
            });

            await updateFilters(currentFiltersArray.join(',')); // Update the database with the new filters list
            await interaction.reply(`The specified filter(s) have been removed.`);
        } catch (error) {
            console.error('An error occurred:', error);
            await interaction.reply('An error occurred while removing your filter(s).');
        }
    },
};
