const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('event_info')
        .setDescription('Returns all the information on the Event by ID')
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('The ID of the Event you want more info on')
                .setRequired(true) // This makes the parameter optional
        ),
    async execute(client, connection, cachedUsers, isScheduled = false) {
        if (!isScheduled) {
            return;
        }

        const today = new Date();
        const formattedDate = (today.getMonth() + 1).toString().padStart(2, '0') + '/' + today.getDate().toString().padStart(2, '0') + '/' + today.getFullYear();

        const result = await fetchRelevantEventsForUser(connection, interaction.options.getInteger('id'));
        const eventsArray = result.map(item => ({
            id: item.Event_Id,
            name: item.Event_Title,
            date: item.Event_Date,
            time: item.Event_Time
        }));

        // Create an array of just the ids
        const idsArray = eventsArray.map(event => event.id);
        const titlesArray = eventsArray.map(event => event.name);
        const datesArray = eventsArray.map(event => event.date);
        const timesArray = eventsArray.map(event => event.time);

        const idsArrayString    = idsArray.map(item    => `${item}`).join('\n');
        const titlesArrayString = titlesArray.map(item => `${item}`).join('\n');
        const datesArrayString  = datesArray.map(item  => `${item}`).join('\n');
        const timesArrayString  = timesArray.map(item  => `${item}`).join('\n');

        let embedMessage = new EmbedBuilder();
        embedMessage.setTitle('Your Daily Report');

        embedMessage.addFields({ name:`ID`, value:idsArrayString, inline:true});
        embedMessage.addFields({ name:`EVENT`, value:titlesArrayString, inline:true});
        embedMessage.addFields({ name:`TIME`, value:timesArrayString, inline:true});
        embedMessage.addFields({ name:`DATE`, value:datesArrayString, inline:true});

        console.log(embedMessage);

        await interaction.reply({ embeds: [embedMessage] });
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

async function fetchRelevantEventsForUser(connection, id) {
    // Assuming `User_Filter` affects the event selection; adjust query as needed
		let queryString = `SELECT Event_Id, Event_Title, Event_Date, Event_Time FROM events WHERE Event_Id = '${id}'`;
		console.log(queryString);

    return new Promise((resolve, reject) => {
        connection.query(queryString, (error, results) => {
            if (error) reject(error);
            else resolve(results); // Filter these results based on `user.User_Filter` if necessary
        });
    });
}
