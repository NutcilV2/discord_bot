const { SlashCommandBuilder } = require('discord.js');
const mysqlFunctions = require('../../utility/mysqlFunctions');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('get_filter')
        .setDescription('Adds filter(s) to your filter list'),
    async execute(interaction, connection, cachedUsers) {
        const user_id = interaction.user.id;
        const user_username = interaction.user.username;
        const isCached = await cachedUsers.isUserCached(user_id, user_username);

        try {
            // Use fetchUserFilters to get the user's filters
            const filterString = await mysqlFunctions.fetchUserFilters(user_id);
            let messageContent;

            if (filterString) {
                const parsed = mysqlFunctions.parseFilter(filterString);
                const formattedFilterString = parsed.map(item => `${item}`).join('\n') + '\n';
                messageContent = `Your Filters:\n${formattedFilterString}`;
            } else {
                messageContent = 'You don\'t have any Filters';
            }

            console.log(messageContent);
            await interaction.reply(messageContent);
        } catch (error) {
            console.error('An error occurred:', error);
            await interaction.reply('An error occurred while fetching your filter.');
        }
    },
};
