import { Router } from 'express';

import { query } from '../services/db.service';
import { Job } from '../types';

const router = Router();

router.get('/api/jobs/:id', async (request, response) => {
	const { id } = request.params;

	if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
		response.status(400).json({
			error: 'Invalid job ID',
			code: 'INVALID_JOB_ID',
			statusCode: 400,
		});
		return;
	}

	try {
		const result = await query<Job>('SELECT * FROM jobs WHERE id = $1', [id]);

		if (result.rows.length === 0) {
			response.status(404).json({
				error: 'Job not found',
				code: 'JOB_NOT_FOUND',
				statusCode: 404,
			});
			return;
		}

		response.json({ job: result.rows[0] });
	} catch (error) {
		console.error('Failed to fetch job', error);
		response.status(500).json({
			error: 'Internal server error',
			code: 'JOB_FETCH_FAILED',
			statusCode: 500,
		});
	}
});

router.get('/api/jobs', async (request, response) => {
	const page = Math.max(Number.parseInt(String(request.query.page || '1'), 10), 1);
	const limit = Math.max(Number.parseInt(String(request.query.limit || '10'), 10), 1);
	const offset = (page - 1) * limit;

	try {
		const [jobsResult, totalResult] = await Promise.all([
			query<Job>(
				'SELECT * FROM jobs ORDER BY posted_at DESC LIMIT $1 OFFSET $2',
				[limit, offset],
			),
			query<{ count: string }>('SELECT COUNT(*)::text AS count FROM jobs'),
		]);

		response.json({
			jobs: jobsResult.rows,
			total: Number.parseInt(totalResult.rows[0]?.count || '0', 10),
			page,
			limit,
		});
	} catch (error) {
		console.error('Failed to fetch jobs', error);
		response.status(500).json({
			error: 'Internal server error',
			code: 'JOBS_FETCH_FAILED',
			statusCode: 500,
		});
	}
});

export default router;
