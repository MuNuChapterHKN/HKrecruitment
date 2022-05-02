import {Pool} from 'pg';
const url =`postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
console.log(url)
const pool = new Pool({
    max: 20,
    connectionString: url,
    idleTimeoutMillis: 30000,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 2000,
});
export default pool;
