const connection = require('./dbConnection');

const userCache = new Set();

// Query to select all user IDs from the database
const query = 'SELECT User_Id FROM users';

connection.query(query, (error, results, fields) => {
  if (error) throw error;

  results.forEach(row => {
    userCache.add(row.User_Id);
  });
});



function isUserCached(user_id, user_username) {
    const cached = userCache.has(userId);
    if(!cached) {
        const sql = `
              INSERT INTO users (User_Id, User_Username, User_DirectMsg, User_Filter, User_Blacklist)
              VALUES (?, ?, 'F', '', '');
        `;
        connection.query(sql, [user_id, user_username], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });

        cacheUser(user_id)
    }
}

function cacheUser(user_id) {
    userCache.add(user_id);
}
