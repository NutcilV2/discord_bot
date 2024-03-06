const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mysqlFunctions = require('../../utility/mysqlFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Adds filter(s) to your filter list'),
    async execute(interaction, connection, cachedUsers) {
        const user_id = interaction.user.id;
        const user_username = interaction.user.username;
        const isCached = await cachedUsers.isUserCached(user_id, user_username);

        try {
            const filterString = await mysqlFunctions.fetchUserFilters(user_id);
            const blacklistString = await mysqlFunctions.fetchUserBlacklists(user_id);

            let embedMessage = new EmbedBuilder();
            embedMessage.setAuthor({ name: user_username, iconUrl: interaction.user.avatarURL()});

            if (filterString) {
                const parsed = mysqlFunctions.parseFilter(filterString);
                const formattedFilterString = parsed.map(item => `${item}`).join('\n') + '\n';

                embedMessage.addFields(
                    { name:`Filters`, value:formattedFilterString, inline:true}
                );
            } else {
                embedMessage.addFields(
                    { name:`Filters`, value:'Empty', inline:true}
                );
            }


            embedMessage.addFields(
                { name:`     `, value:`     `, inline:true}
            );


            if (blacklistString) {
                const parsed = mysqlFunctions.parseFilter(blacklistString);
                const formattedBlacklistString = parsed.map(item => `${item}`).join('\n') + '\n';

                embedMessage.addFields(
                    { name:`Blacklist`, value:formattedBlacklistString, inline:true}
                );
            } else {
                embedMessage.addFields(
                    { name:`Blacklist`, value:`Empty`, inline:true}
                );
            }

            console.log(embedMessage);
            await interaction.reply({ embeds: [embedMessage] });
        } catch (error) {
            console.error('An error occurred:', error);
            const errorEmbed = new EmbedBuilder()
                .setTitle('Error')
                .setDescription('An error occurred while fetching your filters.')
                .setColor('#ff0000'); // Error color
            await interaction.reply({ embeds: [errorEmbed] });
        }
    },
};
