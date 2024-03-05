const { SlashCommandBuilder } = require('discord.js');
const { sanitizeInput } = require('../../../utility/inputSanitizer.js');
const mysqlFunctions = require('../../../utility/mysqlFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set_blacklist')
        .setDescription('Sets your list of blacklist to blacklist(s)')
        .addStringOption(option =>
            option.setName('blacklist')
                .setDescription('The Blacklist that you want for events')
                .setRequired(true) // This makes the parameter optional
        ),
    async execute(interaction, connection, cachedUsers) {
      const user_id = interaction.user.id;
			const user_username = interaction.user.username;
      const isCached = await cachedUsers.isUserCached(user_id, user_username);
      const filter = sanitizeInput(interaction.options.getString('blacklist'));

			try {
          const result = await mysqlFunctions.updateUserBlacklist(user_id, user_username, filter);
					const replyMessage = `You've set your blacklist`;
					await interaction.reply(replyMessage);
			} catch (error) {
					console.error('An error occurred:', error);
					await interaction.reply('An error occurred while updating your blacklist.');
			}
    },
};
