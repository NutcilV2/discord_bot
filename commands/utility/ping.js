const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction, db) {
		await interaction.reply('Pong!');

    db.query('SELECT * FROM your_table LIMIT 1', (error, results) => {
      if (error) throw error;

      // Assuming 'results' is not empty and your table has columns you want to display
      if (results.length > 0) {
        const firstRow = results[0];
        // Customize this message format as per your table structure
        let replyMessage = `First Row:\n`;
        Object.keys(firstRow).forEach(column => {
          replyMessage += `${column}: ${firstRow[column]}\n`;
        });

        message.channel.send(replyMessage);
      } else {
        message.channel.send("No data found.");
      }
    });
	},
};
