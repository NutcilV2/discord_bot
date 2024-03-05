const { SlashCommandBuilder } = require('discord.js');
const mysqlFunctions = require('../../../utility/mysqlFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear_filter')
        .setDescription('Clears your entire Filter List'),
    async execute(interaction, connection, cachedUsers) {
      const user_id = interaction.user.id;
			const user_username = interaction.user.username;
      const isCached = await cachedUsers.isUserCached(user_id, user_username);

			try {
					const result = await mysqlFunctions.updateUserFilter(user_id, user_username, '');
					const replyMessage = `You've cleared your filter`;
					await interaction.reply(replyMessage);
			} catch (error) {
					console.error('An error occurred:', error);
					await interaction.reply('An error occurred while clearing your filter.');
			}
    },
};
