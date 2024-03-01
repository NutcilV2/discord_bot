const { SlashCommandBuilder } = require('discord.js');
const mysqlFunctions = require('../../utility/mysqlFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get_server_events')
        .setDescription('get all events under a specific prefix')
				.addStringOption(option =>
            option.setName('server_prefix')
                .setDescription('The server you are looking for')
                .setRequired(false) // This makes the parameter optional
        ),
    async execute(interaction, connection, cachedUsers) {
        const user_id = interaction.user.id;
  			const user_username = interaction.user.username;
        const isCached = await cachedUsers.isUserCached(user_id, user_username);

        let server_prefix = sanitizeInput(interaction.options.getString('server_prefix')).replace(/\[|\]/g, '');
        if(!server_prefix && !interaction.guild) {
            interaction.reply(`You must specify a Servers Prefix`);
            return;
        } else {
            const guildId = interaction.guildId;
            const result = await mysqlFunctions.getServerPrefix(guildId);
  					server_prefix = `${result[0].Server_Prefix}`;
        }

        if(!server_prefix) {
            interaction.reply(`Your Server does not have a Prefix`);
            return;
        } else {
            server_prefix = `[${server_prefix}] - %`;
        }


        try {
            let queryString = `SELECT Event_Id, Event_Title FROM events WHERE Event_Title LIKE ?`;
            const result = await mysqlFunctions.runQuery(queryString, server_prefix);
            console.log(result);

            // Format the result for display
            const formattedResult = result.map(row => `${row.Event_Id}: ${row.Event_Title}`).join('\n');
            await interaction.reply(`Results: \n${formattedResult}`);

        } catch (error) {
            console.error('An error occurred while Sending Direct Messages:', error);
        }
    }
};
