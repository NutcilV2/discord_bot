const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction, connection) {
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
        const replyMessage = `Events: ${eventString}`;
        await interaction.reply(replyMessage);
    } catch (error) {
        console.error('An error occurred:', error);
        await interaction.reply('An error occurred while fetching events.');
    }
	},
};
