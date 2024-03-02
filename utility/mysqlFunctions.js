const connection = require('./dbConnection');



function parseFilter(input) {
    const regex = /(?!\s*$)\s*(?:(?:"([^"]*)")|([^,]+))\s*(?:,|$)/g;
    let result = [];
    let match;
    while ((match = regex.exec(input)) !== null) {
        result.push(match[1] || match[2]);
    }
    return result.filter(Boolean);
}

function parseDate(input) {
  const date = input.replace(/-/g, '/');

  const parts = date.split('/');
  const formattedMonth = parts[0].padStart(2, '0');
  const formattedDay = parts[1].padStart(2, '0');
  let formattedYear = parts[2];

  if (formattedYear.length === 2) {
      formattedYear = parseInt(formattedYear, 10) < 50 ? '20' + formattedYear : '19' + formattedYear;
  }

  return [formattedMonth, formattedDay, formattedYear].join('/');
}

function runQuery(customQuery, formattedDate) {
    return new Promise((resolve, reject) => {
        connection.query(customQuery, [formattedDate], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}





// Inside mysqlFunctions module
function fetchUserFilters(user_id) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT User_Filter FROM users WHERE User_Id = ?;`;
        connection.query(sql, [user_id], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results.length > 0 ? results[0].User_Filter : '');
            }
        });
    });
}

function updateUserFilter(user_id, user_username, filter) {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO users (User_Id, User_Username, User_DirectMsg, User_Filter, User_Blacklist)
            VALUES (?, ?, 'F', ?, '')
            ON DUPLICATE KEY UPDATE User_Filter = ?;
        `;
        connection.query(sql, [user_id, user_username, filter, filter], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}





function fetchUserBlacklists(user_id) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT User_Blacklist FROM users WHERE User_Id = ?;`;
        connection.query(sql, [user_id], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results.length > 0 ? results[0].User_Blacklist : '');
            }
        });
    });
}

function updateUserBlacklist(user_id, user_username, blacklist) {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO users (User_Id, User_Username, User_DirectMsg, User_Filter, User_Blacklist)
            VALUES (?, ?, 'F', '', ?)
            ON DUPLICATE KEY UPDATE User_Blacklist = ?;
        `;
        connection.query(sql, [user_id, user_username, blacklist, blacklist], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}





function updateUserDirectMsg(user_id, user_username, user_directmsg) {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO users (User_Id, User_Username, User_DirectMsg, User_Filter, User_Blacklist)
            VALUES (?, ?, ?, '', '')
            ON DUPLICATE KEY UPDATE User_DirectMsg = ?;
        `;
        connection.query(sql, [user_id, user_username, user_directmsg, user_directmsg], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}





function addEvent(event_date, event_time, event_name) {
  return new Promise((resolve, reject) => {
      const sql = `
          INSERT INTO events (Event_Date, Event_Time, Event_Title, Event_Link, Event_Description, Event_Price, Event_Tags)
          VALUES (?, ?, ?, '', '', '', '');
      `;
      connection.query(sql, [event_date, event_time, event_name], (error, results) => {
          if (error) {
              reject(error);
          } else {
              resolve(results);
          }
      });
  });
}





function updateServerPrefix(server_id, server_prefix) {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO servers (Server_Id, Server_Prefix)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE Server_Prefix = ?;
        `;
        connection.query(sql, [server_id, server_prefix, server_prefix], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

function updateServerEventNames(server_id, server_prefix) {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO servers (Server_Id, Server_Prefix)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE Server_Prefix = ?;
        `;
        connection.query(sql, [server_id, server_prefix, server_prefix], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

function getServerPrefix(server_id) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT Server_Prefix FROM servers WHERE Server_Id = ?;`;
        connection.query(sql, [server_id], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}





module.exports = {
    parseFilter,
    parseDate,
    runQuery,

    fetchUserFilters,
    updateUserFilter,

    fetchUserBlacklists,
    updateUserBlacklist,

    updateUserDirectMsg,

    addEvent,

    updateServerPrefix,
    getServerPrefix,
};
