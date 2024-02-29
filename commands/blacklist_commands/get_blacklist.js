const { SlashCommandBuilder } = require('discord.js');
const mysqlFunctions = require('../../utility/mysqlFunctions');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('get_blacklist')
        .setDescription('Adds blacklist(s) to your filter list'),
    async execute(interaction, connection, cachedUsers) {
        const user_id = interaction.user.id;
  			const user_username = interaction.user.username;
        const isCached = await cachedUsers.isUserCached(user_id, user_username);

  			try {
            const blacklistString = await mysqlFunctions.fetchUserFilters(user_id);
            let messageContent;

            if (blacklistString) {
                const parsed = mysqlFunctions.parseFilter(blacklistString);
                const formattedBlacklistString = parsed.map(item => `${item}`).join('\n') + '\n';
                messageContent = `Your Blacklists:\n${formattedBlacklistString}`;
            } else {
                messageContent = 'You don\'t have any Blacklists';
            }

            console.log(messageContent);
  					await interaction.reply(messageContent);
  			} catch (error) {
  					console.error('An error occurred:', error);
  					await interaction.reply('An error occurred while fetching your blacklist.');
  			}
    },
};
