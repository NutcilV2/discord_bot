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



function isUserCached(userId) {
    return userCache.has(userId);
}

function cacheUser(userId) {
    userCache.add(userId);
}
