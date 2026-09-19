import { Router } from 'express';

import { query } from '../services/db.service';
import { generatePresignedUploadUrl } from '../services/s3.service';
import { PresignedUrlResponse } from '../types';

const router = Router();
const maxFileSize = 5 * 1024 * 1024;
const allowedFileTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const isUuid = (value: unknown): value is string =>
	typeof value === 'string' &&
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

router.post('/api/generate-upload-url', async (request, response) => {
	const { jobId, fileName, fileType, fileSize } = request.body as {
		jobId?: unknown;
		fileName?: unknown;
		fileType?: unknown;
		fileSize?: unknown;
	};

	if (
		!isUuid(jobId) ||
		typeof fileName !== 'string' ||
		fileName.trim().length === 0 ||
		typeof fileType !== 'string' ||
		!allowedFileTypes.has(fileType) ||
		typeof fileSize !== 'number' ||
		!Number.isFinite(fileSize) ||
		fileSize <= 0 ||
		fileSize >= maxFileSize
	) {
		response.status(400).json({ error: 'Invalid upload request' });
		return;
	}

	try {
		const jobResult = await query<{ id: string }>('SELECT 1 AS id FROM jobs WHERE id = $1', [jobId]);

		if (jobResult.rows.length === 0) {
			response.status(400).json({ error: 'Job does not exist' });
			return;
		}

		const upload = await generatePresignedUploadUrl(jobId, fileName, fileType);
		const result: PresignedUrlResponse = upload;
		response.json(result);
	} catch (error) {
		console.error('Failed to generate upload URL', error);
		response.status(500).json({ error: 'Internal server error' });
	}
});

export default router;
