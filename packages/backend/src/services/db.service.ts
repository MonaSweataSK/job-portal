import { Pool, QueryResult, QueryResultRow } from 'pg';

import config from '../config/env';

const pool = new Pool({
	host: config.DB.host,
	port: config.DB.port,
	database: config.DB.database,
	user: config.DB.user,
	password: config.DB.password,
});

export const query = <Row extends QueryResultRow = QueryResultRow>(
	text: string,
	values?: unknown[],
): Promise<QueryResult<Row>> => pool.query<Row>(text, values);

export const close = (): Promise<void> => pool.end();

export default pool;
