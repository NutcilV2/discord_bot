const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('scheduled_dm')
        .setDescription('Scheduled Event that will delete all events before the current date'),
    async execute(interaction, connection, isScheduled = false) {
        //if (!isScheduled) {
        //    await interaction.reply('This command can only be run automatically.');
        //    return;
        //}

        const today = new Date();
        const formattedDate = today.toISOString().slice(0, 10); // YYYY-MM-DD format

        try {
            const users = await fetchUsersWithDirectMsgEnabled(connection);
            for (const user of users) {
                const events = await fetchRelevantEventsForUser(connection, user, formattedDate);
                const eventString = events.map(e => `${e.Event_Id}: ${e.Event_Title}`).join('\n');
                const messageContent = eventString ? `Your events:\n${eventString}` : 'No upcoming events for you.';
                // Placeholder for sending DM; implement based on your bot's functionality
                console.log(`Sending to ${user.User_Username}: ${messageContent}`);
            }
        } catch (error) {
            console.error('An error occurred:', error);
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
    return new Promise((resolve, reject) => {
        connection.query(`SELECT Event_Id, Event_Title FROM events WHERE Event_Date < '${beforeDate}'`, (error, results) => {
            if (error) reject(error);
            else resolve(results); // Filter these results based on `user.User_Filter` if necessary
        });
    });
}
