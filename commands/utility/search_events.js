const { SlashCommandBuilder } = require('discord.js');
const { sanitizeInput } = require('../../utility/inputSanitizer.js');

function parseFilterString(filter) {
    const terms = [];
    let currentTerm = '';
    let inQuotes = false;

    // Iterate over each character in the filter string
    for (let char of filter) {
        if (char === '"' && inQuotes) {
            // End of quoted term
            terms.push(currentTerm);
            currentTerm = '';
            inQuotes = false;
        } else if (char === '"' && !inQuotes) {
            // Beginning of quoted term
            inQuotes = true;
        } else if (char.match(/[ ,]/) && !inQuotes) {
            // Space or comma outside of quotes, indicating a term boundary
            if (currentTerm) {
                terms.push(currentTerm);
                currentTerm = '';
            }
        } else {
            // Part of a term
            currentTerm += char;
        }
    }

    // Add the last term if there is one
    if (currentTerm) terms.push(currentTerm);

    return terms;
}

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
	async execute(interaction, connection) {
		let formattedDate;
		let queryPromise;

    const filter = interaction.options.getString('filter').replace(/'/g, "");
    const terms = parseFilterString(sanitizeInput(filter)).map(term => sanitizeInput(term)); // Remove quotes from terms
    const likeConditions = terms.map(term  => `Event_Title LIKE '%${term}%'`);

    let count = 10;
    if(interaction.options.getString('count')) { count = interaction.options.getString('count'); }


    if (!interaction.options.getString('date')) {
      const today = new Date();
      const formattedDate = (today.getMonth() + 1).toString().padStart(2, '0') + '/' + today.getDate().toString().padStart(2, '0') + '/' + today.getFullYear();
			const queryString = `SELECT Event_Id, Event_Title, Event_Date FROM events WHERE Event_Date >= '${formattedDate}' AND (${likeConditions.join(' OR ')}) LIMIT ${count}`;

			queryPromise = () => new Promise((resolve, reject) => {
			    connection.query(queryString, (error, results, fields) => {
			        if (error) {
			            reject(error);
			        } else {
			            resolve(results);
			        }
			    });
			});
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
      const queryString = `SELECT Event_Id, Event_Title FROM events WHERE Event_Date = '${formattedDate}' AND ${likeConditions.join(' AND ')} LIMIT ${count}`;

			queryPromise = () => new Promise((resolve, reject) => {
			    connection.query(queryString, (error, results, fields) => {
			        if (error) {
			            reject(error);
			        } else {
			            resolve(results);
			        }
			    });
			});
		}

    try {
        const results = await queryPromise();
				const eventString = results.map(item => `${item.Event_Id}: ${item.Event_Title} on ${item.Event_Date}`).join('\n');
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
