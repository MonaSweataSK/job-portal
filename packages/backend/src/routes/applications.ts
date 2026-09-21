import { Router } from 'express';

import { query } from '../services/db.service';
import { getPhotoUrl } from '../services/s3.service';
import { ApplicationSubmitRequest } from '../types';

const router = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ValidationResult =
	| { data: ApplicationSubmitRequest }
	| { error: string; code?: string; statusCode?: number };

const parseApplicationRequest = (body: unknown): ValidationResult => {
	if (typeof body !== 'object' || body === null) {
		return { error: 'Request body is required' };
	}

	const value = body as Record<string, unknown>;
	const jobId = typeof value.jobId === 'string' ? value.jobId.trim() : '';
	const fullName = typeof value.fullName === 'string' ? value.fullName.trim() : '';
	const email = typeof value.email === 'string' ? value.email.trim().toLowerCase() : '';
	const phone = typeof value.phone === 'string' ? value.phone.trim() : '';
	const coverLetter = typeof value.coverLetter === 'string' ? value.coverLetter.trim() : '';
	const photoKey = typeof value.photoKey === 'string' ? value.photoKey.trim() : '';

	if (!uuidPattern.test(jobId)) {
		return { error: 'Job not found', code: 'JOB_NOT_FOUND', statusCode: 400 };
	}

	if (!fullName || !email || !phone || !coverLetter || !photoKey) {
		return { error: 'All application fields are required' };
	}

	if (!emailPattern.test(email)) {
		return { error: 'A valid email is required' };
	}

	return {
		data: {
			jobId,
			fullName,
			email,
			phone,
			coverLetter,
			photoKey,
		},
	};
};

router.post('/api/applications', async (request, response) => {
	const validation = parseApplicationRequest(request.body);

	if ('error' in validation) {
		response.status(400).json({
			error: validation.error,
			code: validation.code || 'INVALID_APPLICATION',
			statusCode: 400,
		});
		return;
	}

	const { data } = validation;

	try {
		const jobResult = await query<{ id: string }>('SELECT id FROM jobs WHERE id = $1', [data.jobId]);

		if (jobResult.rows.length === 0) {
			response.status(400).json({
				error: 'Job not found',
				code: 'JOB_NOT_FOUND',
				statusCode: 400,
			});
			return;
		}

		const duplicateResult = await query<{ id: string }>(
			'SELECT id FROM applications WHERE job_id = $1 AND email = $2',
			[data.jobId, data.email],
		);

		if (duplicateResult.rows.length > 0) {
			response.status(409).json({ error: 'Application already exists' });
			return;
		}

		const photoUrl = getPhotoUrl(data.photoKey);
		const applicationResult = await query<{ id: number }>(
			`INSERT INTO applications
				(job_id, full_name, email, phone, cover_letter, photo_url, photo_key)
			 VALUES ($1, $2, $3, $4, $5, $6, $7)
			 RETURNING id`,
			[
				data.jobId,
				data.fullName,
				data.email,
				data.phone,
				data.coverLetter,
				photoUrl,
				data.photoKey,
			],
		);

		response.status(201).json({ applicationId: applicationResult.rows[0].id });
	} catch (error) {
		console.error('Failed to create application', error);
		response.status(500).json({ error: 'Internal server error' });
	}
});

export default router;
