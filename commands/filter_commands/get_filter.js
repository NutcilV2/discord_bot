const { SlashCommandBuilder } = require('discord.js');

function parseFilter(input) {
    const regex = /(?!\s*$)\s*(?:(?:"([^"]*)")|([^,]+))\s*(?:,|$)/g;
    let result = [];
    let match;
    while ((match = regex.exec(input)) !== null) {
        // Add matched group 1 or group 2 to the result
        result.push(match[1] || match[2]);
    }
    return result.filter(Boolean); // Filter out any empty strings just in case
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get_filter')
        .setDescription('Adds you to the private messaging list'),
    async execute(interaction, connection, cachedUsers) {
			const user_id = interaction.user.id;
			const user_username = interaction.user.username;
      const isCached = await cachedUsers.isUserCached(user_id, user_username);

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
					const results = await queryPromise();
          let filterString;
          console.log(results[0].User_Filter);
          if(results[0].User_Filter) {
            const filter = results[0].User_Filter;
            const parsed = parseFilter(filter);
            filterString = parsed.map(item => `${item}`).join('\n') + '\n';
          }

          const messageContent = filterString ? `Your Filters:\n${filterString}` : 'You dont have any Filters';
          console.log(messageContent);
					await interaction.reply(messageContent);
			} catch (error) {
					console.error('An error occurred:', error);
					await interaction.reply('An error occurred while fetching your filter.');
			}
    },
};
