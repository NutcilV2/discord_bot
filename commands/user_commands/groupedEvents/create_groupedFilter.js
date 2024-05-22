const { SlashCommandBuilder } = require('discord.js');
const { sanitizeInput } = require('../../../utility/inputSanitizer.js');
const mysqlFunctions = require('../../../utility/mysqlFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create_grouped_filter')
        .setDescription('Adds specified filter(s) from your list')
        .addStringOption(option =>
            option.setName('group_name')
                .setDescription('The name of the group')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('filters')
                .setDescription('The filters you want to add, separated by commas')
                .setRequired(true)), // Make sure the filter is required for command execution
    async execute(interaction, connection, cachedUsers) {
        const user_id = interaction.user.id;
        const user_username = interaction.user.username;
        const isCached = await cachedUsers.isUserCached(user_id, user_username);
        const group_name = interaction.options.getString('group_name');
        const rawInput = interaction.options.getString('filters');
        let filtersToGroup = sanitizeInput(rawInput)

        try {
            const group_id = mysqlFunctions.getNextGroupId();
            console.log(group_id);
            await mysqlFunctions.createGroupedFilter(group_id, group_name, filtersToGroup, user_id);
            await interaction.reply(`The specified filters have been turned into a group`);
        } catch (error) {
            console.error('An error occurred:', error);
            await interaction.reply(`An error occurred while adding the specified filter(s) to the list.`);
        }
    },
};
