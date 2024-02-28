const connection = require('./dbConnection');
const schedule = require('node-schedule');

const userCache = new Set();

function refreshUserCache() {
    userCache.clear(); // Clear the current cache to refresh it
    const query = 'SELECT User_Id FROM users';

    connection.query(query, (error, results, fields) => {
        if (error) throw error;

        results.forEach(row => {
            userCache.add(row.User_Id);
        });

        console.log('Users Cached: ', userCache.size);
    });
}

// Refresh the cache immediately upon starting the application
refreshUserCache();

schedule.scheduleJob('0 * * * *', function() {
    console.log('Refreshing user cache...');
    refreshUserCache();
});



function isUserCached(user_id, user_username) {
    return new Promise((resolve, reject) => {
        const cached = userCache.has(user_id);
        if (!cached) {
            console.log('Caching the users: ', user_id);
            const sql = `
                INSERT INTO users (User_Id, User_Username, User_DirectMsg, User_Filter, User_Blacklist)
                VALUES (?, ?, 'F', '', '');
            `;
            connection.query(sql, [user_id, user_username], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    cacheUser(user_id); // Add to cache after successful insertion
                    resolve(results);
                }
            });
        } else {
            resolve('User already cached'); // Or resolve with an appropriate value/message
        }
    });
}



function cacheUser(user_id) {
    userCache.add(user_id);
}



module.exports = {
    isUserCached,
    cacheUser
};
