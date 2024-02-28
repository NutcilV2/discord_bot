const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear_filter')
        .setDescription('Adds you to the private messaging list'),
    async execute(interaction, connection, cachedUsers) {
      const user_id = interaction.user.id;
			const user_username = interaction.user.username;
      const isCached = await cachedUsers.isUserCached(user_id, user_username);

			const queryPromise = () => new Promise((resolve, reject) => {
					const sql = `
              INSERT INTO users (User_Id, User_Username, User_DirectMsg, User_Filter, User_Blacklist)
              VALUES (?, ?, 'F', '', '')
              ON DUPLICATE KEY UPDATE User_Filter = '';
					`;
					connection.query(sql, [user_id, user_username], (error, results, fields) => {
							if (error) {
									reject(error);
							} else {
									resolve(results);
							}
					});
			});

			try {
					const results = await queryPromise();
					const replyMessage = `You've cleared your filter`;
					await interaction.reply(replyMessage);
			} catch (error) {
					console.error('An error occurred:', error);
					await interaction.reply('An error occurred while clearing your filter.');
			}
    },
};
