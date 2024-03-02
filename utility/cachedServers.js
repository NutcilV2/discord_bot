const connection = require('./dbConnection');
const schedule = require('node-schedule');

const userCache = new Set();

function refreshServerCache() {
    userCache.clear(); // Clear the current cache to refresh it
    const query = 'SELECT Server_Id FROM servers';

    connection.query(query, (error, results, fields) => {
        if (error) throw error;

        results.forEach(row => {
            userCache.add(row.User_Id);
        });

        console.log('Servers Cached: ', userCache.size);
    });
}

// Refresh the cache immediately upon starting the application
refreshServerCache();

schedule.scheduleJob('0 * * * *', function() {
    console.log('Refreshing server cache...');
    refreshUserCache();
});



function isServerCached(server_id) {
    return new Promise((resolve, reject) => {
        const cached = userCache.has(server_id);
        if (!cached) {
            console.log('Caching the server: ', server_id);
            const sql = `
                INSERT INTO servers (Server_Id, Server_Prefix)
                VALUES (?, '');
            `;
            connection.query(sql, [server_id], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    cacheUser(server_id); // Add to cache after successful insertion
                    resolve(results);
                }
            });
        } else {
            resolve('Server already cached'); // Or resolve with an appropriate value/message
        }
    });
}



function cacheServer(user_id) {
    userCache.add(user_id);
}



module.exports = {
    isUserCached,
    cacheUser
};
