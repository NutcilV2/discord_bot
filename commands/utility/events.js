const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('events')
		.setDescription('Gives you all the events for a specific date')
		.addBooleanOption(option =>
		    option.setName('apply_filter')
		        .setDescription('Select if you want your filter applied or not. Default = True')
		        .setRequired(false) // This makes the parameter optional
		)
		.addStringOption(option =>
        option.setName('count')
            .setDescription('The amount of events returned')
            .setRequired(false) // This makes the parameter optional
    )
		.addStringOption(option =>
        option.setName('date')
            .setDescription('The date to filter events')
            .setRequired(false) // This makes the parameter optional
    ),
	async execute(interaction, connection) {
		let count = 10;
    if(interaction.options.getString('count')) { count = interaction.options.getString('count'); }

		let apply_filter = true;
		if(interaction.options.getString('apply_filter')) { apply_filter = interaction.options.getString('apply_filter'); }

		let formattedDate;
    if (!interaction.options.getString('date')) {
			const today = new Date();
			formattedDate = (today.getMonth() + 1).toString().padStart(2, '0') + '/' + today.getDate().toString().padStart(2, '0') + '/' + today.getFullYear();
    } else {
			const tempDate = interaction.options.getString('date');
			const date = tempDate.replace(/-/g, '/');

			const parts = date.split('/');
			const formattedMonth = parts[0].padStart(2, '0');
			const formattedDay = parts[1].padStart(2, '0');
			let formattedYear = parts[2];

			if (formattedYear.length === 2) {
			    formattedYear = parseInt(formattedYear, 10) < 50 ? '20' + formattedYear : '19' + formattedYear;
			}

			formattedDate = [formattedMonth, formattedDay, formattedYear].join('/');
		}

    // Convert connection.query to use Promises
    const queryPromise = () => new Promise((resolve, reject) => {
        connection.query(`SELECT Event_Id, Event_Title FROM events WHERE Event_Date = '${formattedDate}' LIMIT ${count}`, (error, results, fields) => {
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
