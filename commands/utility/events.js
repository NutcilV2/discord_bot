const { SlashCommandBuilder } = require('discord.js');

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
    async execute(interaction, connection) {
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
            const users = await fetchUsersWithDirectMsgEnabled(connection, interaction.user.id);
            for (const user of users) {
								let events;
								if(applyFilter) {
										events = await fetchRelevantEventsForUser(connection, user, formattedDate);
								} else {
										events = await fetchRelevantEventsForUserWithoutFilter(connection, formattedDate);
								}

                const eventString = events.map(e => `${e.Event_Id}: ${e.Event_Title}`).join('\n');
                const messageContent = eventString ? `Your events:\n${eventString}` : 'No upcoming events for you.';
                // Placeholder for sending DM; implement based on your bot's functionality
								await interaction.reply(messageContent);
                console.log(`Sending to ${user.User_Username}: ${messageContent}`);
            }
						console.error('Sent all the Direct messages');
        } catch (error) {
            console.error('An error occurred while Sending Direct Messages:', error);
            // Since this command is not user-invoked, consider logging this error instead of replying to an interaction
        }
    }
};

async function fetchUsersWithDirectMsgEnabled(connection, user_id) {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT User_Id, User_Username, User_Filter FROM users WHERE User_Id = '${user_id}'`, (error, results) => {
            if (error) reject(error);
            else resolve(results);
        });
    });
}

async function fetchRelevantEventsForUser(connection, user, filterDate) {
    // Assuming `User_Filter` affects the event selection; adjust query as needed
		const input = user.User_Filter;
		const parsed = parseFilter(input);
		const likeConditions = parsed.map(term  => `Event_Title LIKE '%${term}%'`);
		let queryString;
		if(!likeConditions) {
				queryString = `SELECT Event_Id, Event_Title FROM events WHERE Event_Date = '${filterDate}'`;
		} else {
				queryString = `SELECT Event_Id, Event_Title FROM events WHERE Event_Date = '${filterDate}' AND (${likeConditions.join(' OR ')})`;
		}
		console.log(queryString);

    return new Promise((resolve, reject) => {
        connection.query(queryString, (error, results) => {
            if (error) reject(error);
            else resolve(results); // Filter these results based on `user.User_Filter` if necessary
        });
    });
}

async function fetchRelevantEventsForUserWithoutFilter(connection, filterDate) {
    // Assuming `User_Filter` affects the event selection; adjust query as needed
		let queryString = `SELECT Event_Id, Event_Title FROM events WHERE Event_Date = '${filterDate}'`;
		console.log(queryString);

    return new Promise((resolve, reject) => {
        connection.query(queryString, (error, results) => {
            if (error) reject(error);
            else resolve(results); // Filter these results based on `user.User_Filter` if necessary
        });
    });
}
