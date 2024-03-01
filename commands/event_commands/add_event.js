const { SlashCommandBuilder } = require('discord.js');
const { sanitizeInput } = require('../../utility/inputSanitizer.js');
const mysqlFunctions = require('../../utility/mysqlFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add_event')
        .setDescription('Adds Event to database')
        .addStringOption(option =>
            option.setName('event_date')
                .setDescription('The date of the event')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('event_time')
                .setDescription('The time of the event')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('event_name')
                .setDescription('The name of the event')
                .setRequired(true)), // Make sure the filter is required for command execution
    async execute(interaction, connection, cachedUsers) {
        const user_id = interaction.user.id;
        const user_username = interaction.user.username;
        const isCached = await cachedUsers.isUserCached(user_id, user_username);

        const event_date = mysqlFunctions.parseDate(sanitizeInput(interaction.options.getString('event_date')));
        const event_time = sanitizeInput(interaction.options.getString('event_time'));
        const event_name = sanitizeInput(interaction.options.getString('event_name')).replace(/\[|\]/g, '');

        try {
            await mysqlFunctions.addEvent(event_date, event_time, event_name);
            await interaction.reply(`The Event has been added.`);
        } catch (error) {
            console.error('An error occurred:', error);
            await interaction.reply(`An error occurred while adding the specified filter(s) to the list.`);
        }
    },
};
