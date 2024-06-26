const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mysqlFunctions = require('../../utility/mysqlFunctions');
const colors = require('../../utility/colors');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Teaches you how to use the bot'),
    async execute(interaction, connection, cachedUsers) {
        const user_id = interaction.user.id;
        const user_username = interaction.user.username;
        const isCached = await cachedUsers.isUserCached(user_id, user_username);

        const embed = new EmbedBuilder()
            .setTitle('EventBot Help Guide')
            .setDescription('Heres how you can use me to find and manage events:')
            .setColor(colors.defaultColor) // Error color
            .addFields({name:"📅 Get Events", value:"`!events [date]` - Retrieves events for a specific date.", inline:false})
            .addFields({name:"🔍 Set Filters", value:"`!setfilter [type]` - Sets a filter to customize the events you see.", inline:false})
            .addFields({name:"🚫 Manage Blacklist", value:"`!blacklist [add/remove] [keyword]` - Manages your blacklist of unwanted event types.", inline:false})
            .addFields({name:"📢 Daily Digest", value:"`!daily` - Opt in/out of daily event notifications.", inline:false})
            .addFields({name:"🔖 Event Prefix", value:"`!prefix [prefix]` - Sets a prefix for events from your server.", inline:false})
            .addFields({name:"ℹ️ Your Settings", value:"`!info` - Displays your current filters and blacklist settings.", inline:false})
            .addFields({name:"🆘 Help", value:"`!help` - Shows this message. Use `!help [command]` for detailed info on a command.", inline:false})
            .setFooter({text:"MessageID:HelpGuide; Need more help? Reply here or contact the admin!"});

        const replyMessage = await interaction.reply({ embeds: [embed], fetchReply: true });
    },
};
