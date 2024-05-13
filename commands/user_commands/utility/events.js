const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mysqlFunctions = require('../../../utility/mysqlFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('events')
        .setDescription('Scheduled Event that will delete all events before the current date')
				.addBooleanOption(option =>
            option.setName('apply_filter')
                .setDescription('Select if you want your filter applied or not. Default = True')
                .setRequired(false) // This makes the parameter optional
        )
        .addStringOption(option =>
            option.setName('date')
                .setDescription('The date to filter events')
                .setRequired(false) // This makes the parameter optional
        ),
    async execute(interaction, connection, cachedUsers) {
        const user_id = interaction.user.id;
  			const user_username = interaction.user.username;
        const isCached = await cachedUsers.isUserCached(user_id, user_username);

        const applyFilter = interaction.options.getBoolean('apply_filter') ?? true;

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

        try {
            let queryString = `SELECT Event_Id, Event_Title, Event_Date FROM events WHERE Event_Date = ?`;

            if(applyFilter) {
                const filterString = await mysqlFunctions.fetchUserFilters(user_id);
                if(filterString) {
                    const parsed = mysqlFunctions.parseFilter(filterString);
                    const likeConditions = parsed.map(term  => `Event_Title LIKE '%${term}%'`);
                    queryString += ` AND (${likeConditions.join(' OR ')})`;
                }

                const blacklistString = await mysqlFunctions.fetchUserBlacklists(user_id);
                if(blacklistString) {
                    const parsed = mysqlFunctions.parseFilter(blacklistString);
                    const likeConditions = parsed.map(term  => `Event_Title NOT LIKE '%${term}%'`);
                    queryString += ` AND (${likeConditions.join(' AND ')})`;
                }
            }

            const result = await mysqlFunctions.runQuery(queryString, formattedDate);
            console.log(result);

            // Format the result for display
            //const formattedResult = result.map(row => `${row.Event_Id}: ${row.Event_Title}`).join('\n');
            const eventsArray = result.map(item => ({
    				    id: item.Event_Id,
    				    name: item.Event_Title,
    				    date: item.Event_Date
    				}));

    				// Create an array of just the ids
    				const idsArray = eventsArray.map(event => event.id);
    				const titlesArray = eventsArray.map(event => event.name);
    				const datesArray = eventsArray.map(event => event.date);

    				const idsArrayString    = idsArray.map(item    => `${item}`).join('\n');
    				const titlesArrayString = titlesArray.map(item => `${item}`).join('\n');
    				const datesArrayString  = datesArray.map(item  => `${item}`).join('\n');

    				let embedMessage = new EmbedBuilder();
            if(idsArrayString.length == 0) {
              embedMessage.setColor('#DD6253')
              embedMessage.addFields({ name:`Alert: `, value:`No Events for ${formattedDate}`, inline:false});
            }
            else {
              embedMessage.setColor('#5E35B1')
              embedMessage.addFields({ name:`IDs`, value:idsArrayString, inline:true});
      				embedMessage.addFields({ name:`TITLEs`, value:titlesArrayString, inline:true});
      				embedMessage.addFields({ name:`DATEs`, value:datesArrayString, inline:true});
            }


            // Ensure results are formatted in a way that can be sent in a message
            // For example, converting the results to a string or formatting them as needed
            //const replyMessage = eventString ? `Events:\n${eventString}` : 'No upcoming events for that criteria.';
            //await interaction.reply(replyMessage);
    				await interaction.reply({ embeds: [embedMessage] });

        } catch (error) {
            console.error('An error occurred while Sending Direct Messages:', error);
        }
    }
};
