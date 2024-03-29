const { SlashCommandBuilder } = require('discord.js');
const { sanitizeInput } = require('../../utility/inputSanitizer.js');
const mysqlFunctions = require('../../utility/mysqlFunctions');
const cachedServers = require('../../utility/cachedServers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get_server_prefix')
        .setDescription('Sets your servers prefix for all events'),
    async execute(interaction, connection, cachedUsers) {
      const user_id = interaction.user.id;
			const user_username = interaction.user.username;
      const guildId = interaction.guildId;
      const isCached = await cachedUsers.isUserCached(user_id, user_username);
      const isServerCached = await cachedServers.isServerCached(guildId);

			try {
          const result = await mysqlFunctions.getServerPrefix(guildId);
					const replyMessage = `Servers Prefix: ${result[0].Server_Prefix}`;
					await interaction.reply(replyMessage);
			} catch (error) {
					console.error('An error occurred:', error);
					await interaction.reply('An error occurred while updating your Servers Prefix.');
			}
    },
};
