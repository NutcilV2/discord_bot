const { SlashCommandBuilder } = require('discord.js');
const { sanitizeInput } = require('../../utility/inputSanitizer.js');
const mysqlFunctions = require('../../utility/mysqlFunctions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('search_events')
		.setDescription('Gives you all the events for a specific date')
		.addStringOption(option =>
        option.setName('filter')
            .setDescription('Words to search for')
            .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('count')
            .setDescription('The amount of events returned')
            .setRequired(false)
    )
		.addStringOption(option =>
        option.setName('date')
            .setDescription('The date to filter events')
            .setRequired(false)
    ),
	async execute(interaction, connection, cachedUsers) {
    const user_id = interaction.user.id;
    const user_username = interaction.user.username;
    const isCached = await cachedUsers.isUserCached(user_id, user_username);

    const today = new Date();
		let formattedDate = (today.getMonth() + 1).toString().padStart(2, '0') + '/' + today.getDate().toString().padStart(2, '0') + '/' + today.getFullYear();;

    const filter = interaction.options.getString('filter').replace(/'/g, "");
    const terms = mysqlFunctions.parseFilter(sanitizeInput(filter)).map(term => sanitizeInput(term)); // Remove quotes from terms
    const likeConditions = terms.map(term  => `Event_Title LIKE '%${term}%'`);

    let count = 10;
    if(interaction.options.getString('count')) { count = interaction.options.getString('count'); }


    let queryString = `SELECT Event_Id, Event_Title, Event_Date FROM events WHERE Event_Date = ?`;
    if(likeConditions) { queryString += ` AND (${likeConditions.join(' OR ')})`; }
    queryString += `LIMIT ${count}`


    if (interaction.options.getString('date')) {
			formattedDate = mysqlFunctions.parseDate(interaction.options.getString('date'));
		}

    try {
        const result = await mysqlFunctions.runQuery(queryString, formattedDate);
				const eventString = result.map(item => `${item.Event_Id}: ${item.Event_Title} on ${item.Event_Date}`).join('\n');
        // Ensure results are formatted in a way that can be sent in a message
        // For example, converting the results to a string or formatting them as needed
        const replyMessage = eventString ? `Events:\n${eventString}` : 'No upcoming events for that criteria.';
        await interaction.reply(replyMessage);
    } catch (error) {
        console.error('An error occurred:', error);
        await interaction.reply('An error occurred while fetching events.');
    }
	},
};
