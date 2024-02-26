const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join_msg_list')
        .setDescription('Adds you to the private messaging list'),
    async execute(interaction, connection) {
			const user_id = interaction.user.id;
			const user_username = interaction.user.username;

			const queryPromise = () => new Promise((resolve, reject) => {
					const sql = `
							INSERT INTO users (User_Id, User_Username, User_DirectMsg, User_Filter)
							VALUES (?, ?, 'T', '')
							ON DUPLICATE KEY UPDATE User_DirectMsg = 'T';
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
					const replyMessage = `You've been ADDED to the list`;
					await interaction.reply(replyMessage);
			} catch (error) {
					console.error('An error occurred:', error);
					await interaction.reply('An error occurred while updating your status.');
			}
    },
};
