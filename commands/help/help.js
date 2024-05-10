const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mysqlFunctions = require('../../utility/mysqlFunctions');

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
            .setColor('#5E35B1') // Error color
            .add_field(name="📅 Get Events", value="`!events [date]` - Retrieves events for a specific date.", inline=false)
            .add_field(name="🔍 Set Filters", value="`!setfilter [type]` - Sets a filter to customize the events you see.", inline=false)
            .add_field(name="🚫 Manage Blacklist", value="`!blacklist [add/remove] [keyword]` - Manages your blacklist of unwanted event types.", inline=false)
            .add_field(name="📢 Daily Digest", value="`!daily` - Opt in/out of daily event notifications.", inline=false)
            .add_field(name="🔖 Event Prefix", value="`!prefix [prefix]` - Sets a prefix for events from your server.", inline=false)
            .add_field(name="ℹ️ Your Settings", value="`!info` - Displays your current filters and blacklist settings.", inline=false)
            .add_field(name="🆘 Help", value="`!help` - Shows this message. Use `!help [command]` for detailed info on a command.", inline=false)
            .set_footer(text="Need more help? Reply here or contact the admin!");
j
        await interaction.reply({ embeds: [embed] });
    },
};
