const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add_filter')
        .setDescription('Adds specified filters from your list')
        .addStringOption(option =>
            option.setName('filter')
                .setDescription('The filter(s) you want to add, separated by commas')
                .setRequired(true)), // Make sure the filter is required for command execution
    async execute(interaction, connection) {
        const user_id = interaction.user.id; // Get the user's ID
        let filtersToRemove = interaction.options.getString('filter').replace(/'/g, ""); // Get the filter(s) to remove
        filtersToRemove = filtersToRemove.split(',').map(filter => filter.trim()); // Convert to array and trim whitespace

        // Fetch the current filters for the user
        const fetchFilters = () => new Promise((resolve, reject) => {
            const sql = `SELECT User_Filter FROM users WHERE User_Id = ?;`;
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
            const sql = `UPDATE users SET User_Filter = ? WHERE User_Id = ?;`;
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
            let currentFiltersArray = currentFiltersString.split(',').filter(Boolean).map(filter => filter.trim()); // Split into array and remove any empty strings

            // Remove each specified filter from the current filters array
            filtersToRemove.forEach(filter => {
                if (!currentFiltersArray.includes(filter)) {
                    currentFiltersArray.push(filter); // Add the filter if not found
                }
            });

            await updateFilters(currentFiltersArray.join(',')); // Update the database with the new filters list
            await interaction.reply(`The specified filter(s) have been added.`);
        } catch (error) {
            console.error('An error occurred:', error);
            await interaction.reply('An error occurred while adding your filter(s).');
        }
    },
};
