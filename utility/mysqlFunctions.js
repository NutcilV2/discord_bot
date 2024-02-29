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
                resolve(results.length > 0 ? results[0].User_Filter : '');
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



module.exports = {
    parseFilter,

    fetchUserFilters,
    updateUserFilter,

    fetchUserBlacklists,
    updateUserBlacklist,
};
