import type {
	ApiError,
	ApplicationSubmitRequest,
	ApplicationSubmitResponse,
	GenerateUploadUrlRequest,
	JobResponse,
	JobsResponse,
	PresignedUploadResponse,
} from '../types/api';
import type { RequestOptions } from '../types/api-options';
import { allowedFileTypes, apiBaseUrl, maxFileSize } from './constants';

export class ApiClientError extends Error {
	readonly statusCode?: number;
	readonly code?: string;

	constructor(
		message: string,
		statusCode?: number,
		code?: string,
	) {
		super(message);
		this.name = 'ApiClientError';
		this.statusCode = statusCode;
		this.code = code;
	}
}

const request = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
	let response: Response;

	try {
		response = await fetch(url, options);
	} catch (error) {
		if (error instanceof Error && error.name === 'AbortError') {
			throw error;
		}
		throw new ApiClientError('Unable to reach the server.');
	}

	const body: unknown = await response.json().catch(() => undefined);
	if (!response.ok) {
		const apiError = body && typeof body === 'object' ? (body as ApiError) : undefined;
		throw new ApiClientError(
			apiError?.error || response.statusText || 'Request failed.',
			response.status,
			apiError?.code,
		);
	}
	if (body === undefined) {
		throw new ApiClientError('The server returned an invalid response.', response.status);
	}

	return body as T;
};

const postJson = <T>(path: string, body: unknown, { signal }: RequestOptions = {}): Promise<T> =>
	request<T>(`${apiBaseUrl}${path}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
		signal,
	});

export const getJobs = (
	{ page = 1, limit = 10 }: { page?: number; limit?: number } = {},
	{ signal }: RequestOptions = {},
): Promise<JobsResponse> => {
	const query = new URLSearchParams({ page: String(page), limit: String(limit) });
	return request<JobsResponse>(`${apiBaseUrl}/api/jobs?${query}`, { signal });
};

export const getJob = (jobId: string, { signal }: RequestOptions = {}): Promise<JobResponse> =>
	request<JobResponse>(`${apiBaseUrl}/api/jobs/${encodeURIComponent(jobId)}`, { signal });

export const generateUploadUrl = (
	data: GenerateUploadUrlRequest,
	options: RequestOptions = {},
): Promise<PresignedUploadResponse> => postJson('/api/generate-upload-url', data, options);

const putPhoto = (url: string, file: File, { signal, onProgress }: RequestOptions): Promise<void> =>
	new Promise((resolve, reject) => {
		const request = new XMLHttpRequest();
		let settled = false;

		const finish = (error?: Error): void => {
			if (settled) return;
			settled = true;
			signal?.removeEventListener('abort', abort);
			if (error) reject(error);
			else resolve();
		};

		const abort = (): void => {
			request.abort();
			finish(new DOMException('Upload cancelled.', 'AbortError'));
		};

		if (signal?.aborted) {
			finish(new DOMException('Upload cancelled.', 'AbortError'));
			return;
		}

		request.open('PUT', url);
		request.setRequestHeader('Content-Type', file.type);
		request.upload.onprogress = (event) => {
			if (event.lengthComputable) {
				onProgress?.(Math.round((event.loaded / event.total) * 100));
			}
		};
		request.onload = () => {
			if (request.status >= 200 && request.status < 300) {
				onProgress?.(100);
				finish();
			} else {
				finish(new ApiClientError('Image upload failed.', request.status));
			}
		};
		request.onerror = () => finish(new ApiClientError('Unable to upload the image.'));
		request.onabort = () => finish(new DOMException('Upload cancelled.', 'AbortError'));
		signal?.addEventListener('abort', abort, { once: true });
		request.send(file);
	});

export const uploadPhoto = async (
	jobId: string,
	file: File,
	options: RequestOptions = {},
): Promise<string> => {
	if (!allowedFileTypes.includes(file.type)) {
		throw new ApiClientError('Choose a JPEG, PNG, or WebP image.');
	}
	if (file.size <= 0 || file.size >= maxFileSize) {
		throw new ApiClientError('The image must be smaller than 5 MB.');
	}

	const upload = await generateUploadUrl({
		jobId,
		fileName: file.name,
		fileType: file.type,
		fileSize: file.size,
	}, options);

	await putPhoto(upload.uploadUrl, file, options);
	return upload.photoKey;
};

export const submitApplication = (
	application: ApplicationSubmitRequest,
	options: RequestOptions = {},
): Promise<ApplicationSubmitResponse> => postJson('/api/applications', application, options);
