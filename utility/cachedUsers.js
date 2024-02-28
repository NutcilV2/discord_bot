const connection = require('./dbConnection');

const userCache = new Set();

// Query to select all user IDs from the database
const query = 'SELECT User_Id FROM users';

connection.query(query, (error, results, fields) => {
  if (error) throw error;

  // Iterate over the results and add each user ID to the Set
  results.forEach(row => {
    userCache.add(row.User_Id);
  });

  // Log the Set to see the user IDs
  console.log(userCache);

  // Remember to close the database connection when you're done
  connection.end();
});



function isUserCached(userId) {
    return userCache.has(userId);
}

function cacheUser(userId) {
    userCache.add(userId);
}
