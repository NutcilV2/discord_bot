const { SlashCommandBuilder } = require('discord.js');
const { sanitizeInput } = require('../../utility/inputSanitizer.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set_blacklist')
        .setDescription('Adds you to the private messaging list')
        .addStringOption(option =>
            option.setName('blacklist')
                .setDescription('The Blacklist that you want for events')
                .setRequired(true) // This makes the parameter optional
        ),
    async execute(interaction, connection) {
			const user_id = interaction.user.id;
			const user_username = interaction.user.username;

      const filter = sanitizeInput(interaction.options.getString('blacklist'));
			const queryPromise = () => new Promise((resolve, reject) => {
					const sql = `
							INSERT INTO users (User_Id, User_Username, User_DirectMsg, User_Filter, User_Blacklist)
							VALUES (?, ?, 'F', '', '')
							ON DUPLICATE KEY UPDATE User_Blacklist = ?;
					`;
					connection.query(sql, [user_id, user_username, filter], (error, results, fields) => {
							if (error) {
									reject(error);
							} else {
									resolve(results);
							}
					});
			});

			try {
					const results = await queryPromise();
					const replyMessage = `You've set your filter`;
					await interaction.reply(replyMessage);
			} catch (error) {
					console.error('An error occurred:', error);
					await interaction.reply('An error occurred while updating your filter.');
			}
    },
};
