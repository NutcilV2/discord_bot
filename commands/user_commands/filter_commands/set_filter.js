const { SlashCommandBuilder } = require('discord.js');
const { sanitizeInput } = require('../../utility/inputSanitizer.js');
const mysqlFunctions = require('../../utility/mysqlFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set_filter')
        .setDescription('Sets your list of filters to filter(s)')
        .addStringOption(option =>
            option.setName('filter')
                .setDescription('The Filter that you want for events')
                .setRequired(true) // This makes the parameter optional
        ),
    async execute(interaction, connection, cachedUsers) {
      const user_id = interaction.user.id;
			const user_username = interaction.user.username;
      const isCached = await cachedUsers.isUserCached(user_id, user_username);
      const filter = sanitizeInput(interaction.options.getString('filter'));

			try {
          const result = await mysqlFunctions.updateUserFilter(user_id, user_username, filter);
					const replyMessage = `You've set your filter`;
					await interaction.reply(replyMessage);
			} catch (error) {
					console.error('An error occurred:', error);
					await interaction.reply('An error occurred while updating your filter.');
			}
    },
};
