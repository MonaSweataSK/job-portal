export interface Job {
	id: string;
	title: string;
	description: string;
	location: string;
	salary_min: number;
	salary_max: number;
	posted_at: string;
	created_at: string;
}

export interface JobsResponse {
	jobs: Job[];
	total: number;
	page: number;
	limit: number;
}

export interface JobResponse {
	job: Job;
}

export interface GenerateUploadUrlRequest {
	jobId: string;
	fileName: string;
	fileType: string;
	fileSize: number;
}

export interface PresignedUploadResponse {
	uploadUrl: string;
	photoKey: string;
}

export interface ApplicationSubmitRequest {
	jobId: string;
	fullName: string;
	email: string;
	phone: string;
	coverLetter: string;
	photoKey: string;
}

export interface ApplicationSubmitResponse {
	applicationId: string;
}

export interface ApiError {
	error: string;
	code?: string;
	statusCode?: number;
}
