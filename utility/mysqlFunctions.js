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

module.exports = {
    parseFilter,
    fetchUserFilters,
    fetchUserBlacklists,
};
