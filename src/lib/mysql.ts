import mysql from 'mysql2/promise';

const db = mysql.createPool({
    host: '106.54.28.147',
    port: 3306,
    user: 'maimai',
    password: 'WhtPEpnkNcBkwSWH',
    database: 'maimai',
    waitForConnections: true,
    connectionLimit: 10,
});

export default db;