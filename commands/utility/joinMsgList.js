const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('joinMsgList')
        .setDescription('Adds you to the private messaging list'),
    async execute(interaction, connection) {
        const user_id = interaction.user.id;
        const user_username = interaction.user.username;
        // Convert connection.query to use Promises for checking user and inserting if not exists
        const checkAndInsertUser = async () => {
            return new Promise((resolve, reject) => {
                connection.query(`SELECT User_Id FROM users WHERE User_Id = ?`, [user_id], (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    if (results.length === 0) {
                        // User does not exist, insert them
                        connection.query(`INSERT INTO users (User_Id, User_Username, User_DirectMsg, User_Filter) VALUES (?, ?, 'F', '')`, [user_id, user_username], (error, results) => {
                            if (error) {
                                return reject(error);
                            }
                            resolve('User added and DirectMsg set to F');
                        });
                    } else {
                        resolve('User already exists');
                    }
                });
            });
        };

        // Update User_DirectMsg to 'T'
        const updateUserDirectMsg = async () => {
            return new Promise((resolve, reject) => {
                connection.query(`UPDATE users SET User_DirectMsg = 'T' WHERE User_Id = ?`, [user_id], (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve('User_DirectMsg set to T');
                    }
                });
            });
        };

        try {
            // Check if user exists and insert if not
            const userStatus = await checkAndInsertUser();
            console.log(userStatus); // For debugging
            // Update user's DirectMsg status
            const updateStatus = await updateUserDirectMsg();
            console.log(updateStatus); // For debugging

            const replyMessage = `You've been added to the list`;
            await interaction.reply(replyMessage);
        } catch (error) {
            console.error('An error occurred:', error);
            await interaction.reply('An error occurred while fetching events.');
        }
    },
};
