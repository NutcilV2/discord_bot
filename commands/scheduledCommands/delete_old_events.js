const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('events')
		.setDescription('Gives you all the events for a specific date')
		.addStringOption(option =>
        option.setName('date')
            .setDescription('The date to filter events')
            .setRequired(false) // This makes the parameter optional
    ),
	async execute(interaction, connection, { isScheduled = false }) {
		if (!isScheduled) {
        console.log("This command can only be run by the scheduler.");
    		return;
    }

		let formattedDate = (today.getMonth() + 1).toString().padStart(2, '0') + '/' + today.getDate().toString().padStart(2, '0') + '/' + today.getFullYear();

    // Convert connection.query to use Promises
		const deleteEventsBeforeDate = (formattedDate) => new Promise((resolve, reject) => {
    connection.query(`DELETE FROM events WHERE Event_Date < '${formattedDate}'`, (error, results, fields) => {
        if (error) {
            reject(error);
        } else {
            resolve(results);
        }
    });
});

    try {
        console.log('Deleted Events before: ', formattedDate)
    } catch (error) {
        console.error('An error occurred:', error);
        await interaction.reply('An error occurred while deleting events before: ', formattedDate);
    }
	},
};
