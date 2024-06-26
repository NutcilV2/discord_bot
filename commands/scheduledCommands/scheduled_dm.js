const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mysqlFunctions = require('../../utility/mysqlFunctions');
const colors = require('../../utility/colors');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('scheduled_dm')
        .setDescription('Sends all users a list of events that are confined to their filters'),
    async execute(client, connection, cachedUsers, isScheduled = false) {
        if (!isScheduled) {
            return;
        }

        const today = new Date();
        const formattedDate = (today.getMonth() + 1).toString().padStart(2, '0') + '/' + today.getDate().toString().padStart(2, '0') + '/' + today.getFullYear();

        let queryString = `SELECT Event_Id FROM events WHERE Event_Date = ?`;
        const unfilteredSQL = await mysqlFunctions.runQuery(queryString, formattedDate);

        const unfilteredArrayList = unfilteredSQL.map(item => ({
            id: item.Event_Id
        }));

        try {
            const users = await fetchUsersWithDirectMsgEnabled(connection);
            for (const user of users) {
                let queryString = `SELECT Event_Id, Event_Title, Event_Date, Event_Time FROM events WHERE Event_Date = ?`;
                const filterString = user.User_Filter;
                if(filterString) {
                    const parsed = mysqlFunctions.parseFilter(filterString);
                    const likeConditions = parsed.map(term  => `Event_Title LIKE '%${term}%'`);
                    queryString += ` AND (${likeConditions.join(' OR ')})`;
                }

                const blacklistString = user.User_Blacklist;
                if(blacklistString) {
                    const parsed = mysqlFunctions.parseFilter(blacklistString);
                    const likeConditions = parsed.map(term  => `Event_Title NOT LIKE '%${term}%'`);
                    queryString += ` AND (${likeConditions.join(' AND ')})`;
                }

                const result = await mysqlFunctions.runQuery(queryString, formattedDate);
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

                const idAndShortTitleArray = eventsArray.map(event => `${event.id}: ${event.name.slice(0, 17).trim()}...`);


        				const idsArrayString    = idsArray.map(item    => `${item}`).join('\n');
        				const titlesArrayString = titlesArray.map(item => `${item}`).join('\n');
        				const datesArrayString  = datesArray.map(item  => `${item}`).join('\n');
                const timesArrayString  = timesArray.map(item  => `${item}`).join('\n');

                const idAndShortTitleArrayString  = idAndShortTitleArray.map(item  => `${item}`).join('\n');

        				let embedMessage = new EmbedBuilder();
                embedMessage.setTitle('Your Daily Report');
                embedMessage.setColor(colors.dailyReportMessage);

                if(idAndShortTitleArrayString) {
                    embedMessage.addFields({ name:`IDs - EVENTs`, value:idAndShortTitleArrayString, inline:true});
                    embedMessage.addFields({ name:`TIMEs`, value:timesArrayString, inline:true});
                }
                else {
                    if(unfilteredArrayList.length - idsArray.length > 0) {
                        embedMessage.addFields({ name:`📢 **Alert: **`, value:`🚫 No Events for you today, ${formattedDate}`, inline:false});
                    } else {
                        embedMessage.addFields({ name:`📢 **Alert: **`, value:`🚫 No Events today, ${formattedDate}`, inline:false});
                    }
                }

                if(unfilteredArrayList.length - idsArray.length > 0) {
                    embedMessage.setFooter({text:`There are ${unfilteredArrayList.length - idsArray.length} other events going on today`});
                }

        				//embedMessage.addFields({ name:`IDs`, value:idsArrayString, inline:true});
        				//embedMessage.addFields({ name:`EVENTs`, value:titlesArrayString, inline:true});

        				//embedMessage.addFields({ name:`DATEs`, value:datesArrayString, inline:true});

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
