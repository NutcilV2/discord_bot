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
		const count = parseInt(interaction.options.getString('count'), 10) || 10;
		const applyFilter = interaction.options.getBoolean('apply_filter') ?? true;
		const user = interaction.user;

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
    try {
				const users = await fetchUsersWithDirectMsgEnabled(connection);
				const user = users[0];

				let events;
				if (applyFilter) {
						events = await fetchRelevantEventsForUser(interaction, user, formattedDate, count);
				} else {
						events = await fetchEventsWithoutFilter(interaction, formattedDate, count);
				}

				if (events.length === 0) {
            await interaction.reply('No events found for the specified criteria.');
            return;
        }

        // Ensure results are formatted in a way that can be sent in a message
        // For example, converting the results to a string or formatting them as needed
				const eventString = events.map(item => `${item.Event_Id}: ${item.Event_Title}`).join('\n');
        await interaction.reply(`Events: \n${eventString}`);
    } catch (error) {
        console.error('An error occurred:', error);
        await interaction.reply('An error occurred while fetching events.');
    }
	},
};

function parseFilter(input) {
    const regex = /(?!\s*$)\s*(?:(?:"([^"]*)")|([^,]+))\s*(?:,|$)/g;
    let result = [];
    let match;
    while ((match = regex.exec(input)) !== null) {
        // Add matched group 1 or group 2 to the result
        result.push(match[1] || match[2]);
    }
    return result.filter(Boolean); // Filter out any empty strings just in case
}

async function fetchUser(connection, User_Id) {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT User_Id, User_Username, User_Filter FROM users WHERE User_Id = ${User_Id}`, (error, results) => {
            if (error) reject(error);
            else resolve(results);
        });
    });
}

async function fetchRelevantEventsForUser(connection, user, beforeDate) {
    // Assuming `User_Filter` affects the event selection; adjust query as needed
		const input = user.User_Filter;
		const parsed = parseFilter(input);
		const likeConditions = parsed.map(term  => `Event_Title LIKE '%${term}%'`);
		let queryString;
		if(!likeConditions) {
				queryString = `SELECT Event_Id, Event_Title FROM events WHERE Event_Date = '${beforeDate}'`;
		} else {
				queryString = `SELECT Event_Id, Event_Title FROM events WHERE Event_Date = '${beforeDate}' AND (${likeConditions.join(' OR ')})`;
		}
		console.log(queryString);

    return new Promise((resolve, reject) => {
        connection.query(queryString, (error, results) => {
            if (error) reject(error);
            else resolve(results); // Filter these results based on `user.User_Filter` if necessary
        });
    });
}

async function fetchEventsWithoutFilter(connection, user, beforeDate) {
    // Assuming `User_Filter` affects the event selection; adjust query as needed
		queryString = `SELECT Event_Id, Event_Title FROM events WHERE Event_Date = '${beforeDate}' AND (${likeConditions.join(' OR ')})`;
		console.log(queryString);

    return new Promise((resolve, reject) => {
        connection.query(queryString, (error, results) => {
            if (error) reject(error);
            else resolve(results); // Filter these results based on `user.User_Filter` if necessary
        });
    });
}
