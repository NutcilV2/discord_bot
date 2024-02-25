const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
		.addStringOption(option =>
        option.setName('date')
            .setDescription('The date to filter events')
            .setRequired(false) // This makes the parameter optional
    ),
	async execute(interaction, connection) {
		const date = interaction.options.getString('date'); // This will be null if not provided

    if (date) {
        // Handle the case where a date is provided
        console.log(`Fetching events for date: ${date}`);
        // Fetch and list events for the specified date...
    } else {
        // Handle the case where no date is provided
        console.log('Fetching all events');
        // Fetch and list all events...
    }

    // Convert connection.query to use Promises
    const queryPromise = () => new Promise((resolve, reject) => {
        connection.query('SELECT Event_Id, Event_Title FROM events LIMIT 3', (error, results, fields) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });

    try {
        const results = await queryPromise();
				const eventString = results.map(item => `${item.Event_Id}: ${item.Event_Title}`).join('\n') + '\n';
        // Ensure results are formatted in a way that can be sent in a message
        // For example, converting the results to a string or formatting them as needed
        const replyMessage = `Events: \n${eventString}`;
        await interaction.reply(replyMessage);
    } catch (error) {
        console.error('An error occurred:', error);
        await interaction.reply('An error occurred while fetching events.');
    }
	},
};
