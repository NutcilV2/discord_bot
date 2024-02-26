const { SlashCommandBuilder } = require('discord.js');

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
        option.setName('date')
            .setDescription('The date to filter events')
            .setRequired(false)
    ),
	async execute(interaction, connection) {
		let formattedDate;
		let queryPromise;
    if (!interaction.options.getString('date')) {
			const filter = interaction.options.getString('filter');

			queryPromise = () => new Promise((resolve, reject) => {
			    // Parse the filter string to separate terms
			    const terms = parseFilterString(filter).map(term => term.replace(/"/g, '')); // Remove quotes from terms

			    // Construct the LIKE conditions for each term
			    const likeConditions = terms.map(() => `Event_Title LIKE '%?%'`);
			    const queryString = `SELECT Event_Id, Event_Title FROM events WHERE ${likeConditions.join(' AND ')} LIMIT 5`;

			    // Map each term to its respective LIKE pattern
			    const queryParameters = terms.map(term => `%${term}%`);

			    connection.query(queryString, queryParameters, (error, results, fields) => {
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

			queryPromise = () => new Promise((resolve, reject) => {
			    // Parse the filter string to separate terms
			    const terms = parseFilterString(filter).map(term => term.replace(/"/g, '')); // Remove quotes from terms

			    // Construct the LIKE conditions for each term
			    const likeConditions = terms.map(() => `Event_Title LIKE '%?%'`);
			    const queryString = `SELECT Event_Id, Event_Title FROM events WHERE Event_Date = '${formattedDate}' AND ${likeConditions.join(' AND ')} LIMIT 5`;

			    // Map each term to its respective LIKE pattern
			    const queryParameters = terms.map(term => `%${term}%`);

			    connection.query(queryString, queryParameters, (error, results, fields) => {
			        if (error) {
			            reject(error);
			        } else {
			            resolve(results);
			        }
			    });
			});
		}

    // Convert connection.query to use Promises
    queryPromise = () => new Promise((resolve, reject) => {
        connection.query(`SELECT Event_Id, Event_Title FROM events WHERE Event_Date = '${formattedDate}' LIMIT 5`, (error, results, fields) => {
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
