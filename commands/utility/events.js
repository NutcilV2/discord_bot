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
        .setDescription('Scheduled Event that will delete all events before the current date'),
    async execute(interaction, connection) {

        const today = new Date();
        const formattedDate = (today.getMonth() + 1).toString().padStart(2, '0') + '/' + today.getDate().toString().padStart(2, '0') + '/' + today.getFullYear();

        try {
            const users = await fetchUsersWithDirectMsgEnabled(connection, interaction.user.id);
            for (const user of users) {
                const events = await fetchRelevantEventsForUserWithoutFilter(connection, formattedDate);
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

async function fetchRelevantEventsForUserWithoutFilter(connection, beforeDate) {
    // Assuming `User_Filter` affects the event selection; adjust query as needed
		let queryString = `SELECT Event_Id, Event_Title FROM events WHERE Event_Date = '${beforeDate}'`;
		console.log(queryString);

    return new Promise((resolve, reject) => {
        connection.query(queryString, (error, results) => {
            if (error) reject(error);
            else resolve(results); // Filter these results based on `user.User_Filter` if necessary
        });
    });
}
