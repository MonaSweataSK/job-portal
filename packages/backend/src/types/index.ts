export interface Job {
	id: string;
	title: string;
	description: string;
	location: string;
	salary_min: number;
	salary_max: number;
	posted_at: Date;
	created_at: Date;
}

export interface Application {
	id: number;
	job_id: number;
	full_name: string;
	email: string;
	phone: string;
	cover_letter: string;
	photo_url: string;
	photo_key: string;
	applied_at: Date;
	created_at: Date;
}

export interface PresignedUrlResponse {
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

export interface ErrorResponse {
	error: string;
	code: string;
	statusCode: number;
}
