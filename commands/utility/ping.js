const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction, connection) {
		//await interaction.reply('Pong!');

    connection.query('SELECT * FROM events', (error, results, fields) => {
    if (error) {
      console.error('An error occurred while fetching users:', error);
      return;
    }
    await interaction.reply('Events: ', results);
  });
	},
};
