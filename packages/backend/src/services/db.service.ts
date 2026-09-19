import { Pool, QueryResult, QueryResultRow } from 'pg';

import config from '../config/env';

const pool = new Pool({
	host: config.DB.host,
	port: config.DB.port,
	database: config.DB.database,
	user: config.DB.user,
	password: config.DB.password,
});

pool.on('error', (error) => {
	console.error('Unexpected PostgreSQL pool error', error);
});

export const connect = async (): Promise<void> => {
	const client = await pool.connect();

	try {
		await client.query('SELECT 1');
		console.log('PostgreSQL connected successfully');
	} catch (error) {
		console.error('PostgreSQL connection test failed', error);
		throw error;
	} finally {
		client.release();
	}
};

export const query = <Row extends QueryResultRow = QueryResultRow>(
	text: string,
	values?: unknown[],
): Promise<QueryResult<Row>> =>
	pool.query<Row>(text, values).catch((error: unknown) => {
		console.error('PostgreSQL query failed', error);
		throw error;
	});

export const disconnect = async (): Promise<void> => {
	await pool.end();
	console.log('PostgreSQL disconnected');
};

export const close = disconnect;

export default pool;
