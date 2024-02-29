const { SlashCommandBuilder } = require('discord.js');
const mysqlFunctions = require('../../utility/mysqlFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join_msg_list')
        .setDescription('Adds you to the private messaging list'),
    async execute(interaction, connection, cachedUsers) {
      const user_id = interaction.user.id;
			const user_username = interaction.user.username;
      const isCached = await cachedUsers.isUserCached(user_id, user_username);

			try {
					const result = await mysqlFunctions.updateUserDirectMsg(user_id, user_username, 'T');
					const replyMessage = `You've been ADDED to the list`;
					await interaction.reply(replyMessage);
			} catch (error) {
					console.error('An error occurred:', error);
					await interaction.reply('An error occurred while updating your status.');
			}
    },
};
