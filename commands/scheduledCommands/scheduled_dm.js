const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

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
        .setName('scheduled_dm')
        .setDescription('Scheduled Event that will delete all events before the current date'),
    async execute(client, connection, cachedUsers, isScheduled = false) {
        if (!isScheduled) {
            return;
        }

        const today = new Date();
        const formattedDate = (today.getMonth() + 1).toString().padStart(2, '0') + '/' + today.getDate().toString().padStart(2, '0') + '/' + today.getFullYear();

        try {
            const users = await fetchUsersWithDirectMsgEnabled(connection);
            for (const user of users) {
                const result = await fetchRelevantEventsForUser(connection, user, formattedDate);
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
        				embedMessage.setAuthor({ name: user.name, iconUrl: user.avatarURL()});
                embedMessage.setTitle('Your Daily Report');

        				embedMessage.addFields({ name:`IDs`, value:idsArrayString, inline:true});
        				embedMessage.addFields({ name:`TITLEs`, value:titlesArrayString, inline:true});
        				embedMessage.addFields({ name:`DATEs`, value:datesArrayString, inline:true});

								client.users.fetch(user.User_Id)
							  .then(user => {
							    user.send({ embeds: [embedMessage] })
							      .then(() => console.log(`Successfully sent a DM to ${user.tag}.`))
							      .catch(error => console.error(`Could not send DM to ${user.tag}.`, error));
							  })
							  .catch(error => console.error(`Could not fetch user with ID ${userId}.`, error));
            }
						console.error('Sent all the Direct messages');
        } catch (error) {
            console.error('An error occurred while Sending Direct Messages:', error);
            // Since this command is not user-invoked, consider logging this error instead of replying to an interaction
        }
    }
};

async function fetchUsersWithDirectMsgEnabled(connection) {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT User_Id, User_Username, User_Filter FROM users WHERE User_DirectMsg = 'T'`, (error, results) => {
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
