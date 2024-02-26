const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('joinMsgList')
		.setDescription('Adds you to the private messaging list'),
	async execute(interaction, connection) {
    // Convert connection.query to use Promises
    const queryPromise = () => new Promise((resolve, reject) => {
        connection.query(`SELECT Event_Id, Event_Title FROM events WHERE Event_Date = '${formattedDate}' LIMIT 5`, (error, results, fields) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });

    try {
        const replyMessage = `You've been added to the list`;
        await interaction.reply(replyMessage);
    } catch (error) {
        console.error('An error occurred:', error);
        await interaction.reply('An error occurred while fetching events.');
    }
	},
};
