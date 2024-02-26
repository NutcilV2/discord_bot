const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('delete_old_events')
		.setDescription('Scheduled Event that will delete all events before the current date'),
	async execute(interaction, connection, isScheduled = false) {
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
