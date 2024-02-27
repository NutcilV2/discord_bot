const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get_filter')
        .setDescription('Adds you to the private messaging list'),
    async execute(interaction, connection) {
			const user_id = interaction.user.id;
			const user_username = interaction.user.username;

			const queryPromise = () => new Promise((resolve, reject) => {
					const sql = `
              SELECT User_Filter FROM users WHERE User_Id = '${user_id}';
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
          await interaction.reply("Balls");
					const results = await queryPromise();
          const filterString = results.map(item => `${item.User_Filter}`).join('\n') + '\n';
          console.log(results);

          const messageContent = filterString ? `Your Filters:\n${filterString}` : 'You dont have any Filters';
          console.log(messageContent);
					//await interaction.reply(replyMessage);
			} catch (error) {
					console.error('An error occurred:', error);
					await interaction.reply('An error occurred while fetching your filter.');
			}
    },
};
