import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { getJob, submitApplication, uploadPhoto } from '../api/client';
import { useApiRequest } from '../api/useApiRequest';
import type { ApplicationSubmitResponse, JobResponse } from '../types/api';
import { validateApplication, type FieldErrors } from '../validation';

function ApplyPage() {
	const { jobId = '' } = useParams();
	const navigate = useNavigate();
	const jobRequest = useApiRequest<JobResponse>();
	const applicationRequest = useApiRequest<ApplicationSubmitResponse>();
	const { data: jobData, error: jobError, loading: jobLoading, execute: loadJob } = jobRequest;
	const [photo, setPhoto] = useState<File | null>(null);
	const [coverLetter, setCoverLetter] = useState('');
	const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
	const [uploadProgress, setUploadProgress] = useState(0);
	const [submissionStage, setSubmissionStage] = useState<'idle' | 'uploading' | 'submitting'>('idle');

	useEffect(() => {
		void loadJob((signal) => getJob(jobId, { signal }));
	}, [jobId, loadJob]);

	const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const application = {
			jobId,
			fullName: String(formData.get('fullName')).trim(),
			email: String(formData.get('email')).trim().toLowerCase(),
			phone: String(formData.get('phone')).trim(),
			coverLetter: String(formData.get('coverLetter')).trim(),
		};
		const errors = validateApplication(application, photo);
		setFieldErrors(errors);
		if (Object.keys(errors).length > 0 || !photo) return;

		setUploadProgress(0);
		setSubmissionStage('uploading');
		const result = await applicationRequest.execute(async (signal) => {
			const photoKey = await uploadPhoto(jobId, photo, {
				signal,
				onProgress: setUploadProgress,
			});
			setSubmissionStage('submitting');
			return submitApplication({
				...application,
				photoKey,
			}, { signal });
		});
		setSubmissionStage('idle');

		if (result) {
			navigate(`/jobs/${jobId}/success?applicationId=${result.applicationId}`);
		}
	};

	if ((!jobData && !jobError) || (jobLoading && !jobData)) {
		return <div className="page-wrap"><div className="state-panel" role="status">Preparing your application<span className="loading-dots">...</span></div></div>;
	}

	if (jobError || !jobData) {
		return (
			<div className="page-wrap narrow-page">
				<div className="state-panel state-error" role="alert">
					<strong>This role could not be found.</strong>
					<Link className="button button-dark" to="/jobs">Browse all roles</Link>
				</div>
			</div>
		);
	}

	const job = jobData.job;

	return (
		<div className="page-wrap form-page">
			<Link className="back-link" to={`/jobs/${jobId}`}>← Back to role</Link>
			<div className="form-heading">
				<div className="eyebrow"><span className="eyebrow-line" /> Your next chapter</div>
				<h1>Apply for<br /><em>{job.title}.</em></h1>
				<p>Tell us a little about yourself and what you would bring to the role.</p>
			</div>

			<form className="application-form" noValidate onSubmit={(event) => void submit(event)}>
				<div className="form-section-title"><span>01</span><h2>Your details</h2></div>
				<div className="form-grid">
					<label className="field">
						<span>Full name</span>
						<input autoComplete="name" name="fullName" required disabled={applicationRequest.loading} aria-invalid={Boolean(fieldErrors.fullName)} aria-describedby={fieldErrors.fullName ? 'full-name-error' : undefined} placeholder="Your name" />
						{fieldErrors.fullName && <span className="field-error" id="full-name-error">{fieldErrors.fullName}</span>}
					</label>
					<label className="field">
						<span>Email address</span>
						<input autoComplete="email" name="email" type="email" maxLength={254} required disabled={applicationRequest.loading} aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'email-error' : undefined} placeholder="you@example.com" />
						{fieldErrors.email && <span className="field-error" id="email-error">{fieldErrors.email}</span>}
					</label>
					<label className="field field-full">
						<span>Phone number</span>
						<input autoComplete="tel" name="phone" type="tel" maxLength={32} required disabled={applicationRequest.loading} aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? 'phone-error' : undefined} placeholder="e.g. +1 (555) 123-4567" />
						{fieldErrors.phone && <span className="field-error" id="phone-error">{fieldErrors.phone}</span>}
					</label>
				</div>

				<div className="form-section-title form-section-spaced"><span>02</span><h2>Make your introduction</h2></div>
				<label className="field">
					<span>Cover letter</span>
						<textarea name="coverLetter" required disabled={applicationRequest.loading} aria-invalid={Boolean(fieldErrors.coverLetter)} aria-describedby={fieldErrors.coverLetter ? 'cover-letter-error' : undefined} minLength={100} rows={7} value={coverLetter} onChange={(event) => {
							setCoverLetter(event.currentTarget.value);
							setFieldErrors((current) => ({ ...current, coverLetter: undefined }));
						}} placeholder="What draws you to this role?" />
						<span className="character-count" aria-live="polite">{coverLetter.trim().length} / 100 characters minimum</span>
						{fieldErrors.coverLetter && <span className="field-error" id="cover-letter-error">{fieldErrors.coverLetter}</span>}
				</label>
				<label className="field photo-field">
					<span>Profile photo</span>
					<span className="photo-hint">JPEG, PNG, or WebP. Smaller than 5 MB.</span>
					<input
						accept="image/jpeg,image/png,image/webp"
						name="photo"
						required
						disabled={applicationRequest.loading}
						aria-invalid={Boolean(fieldErrors.photo)}
						aria-describedby={fieldErrors.photo ? 'photo-error' : undefined}
						type="file"
						onChange={(event) => {
							setPhoto(event.currentTarget.files?.[0] ?? null);
							setFieldErrors((current) => ({ ...current, photo: undefined }));
						}}
					/>
					{photo && <span className="file-name">Selected: {photo.name}</span>}
					{fieldErrors.photo && <span className="field-error" id="photo-error">{fieldErrors.photo}</span>}
				</label>

				{applicationRequest.loading && submissionStage === 'uploading' && (
					<div className="upload-status" role="status">
						<label htmlFor="photo-progress">Uploading profile photo · {uploadProgress}%</label>
						<progress id="photo-progress" max="100" value={uploadProgress} />
					</div>
				)}
				{applicationRequest.loading && submissionStage === 'submitting' && <p className="upload-status" role="status">Photo uploaded. Submitting your application…</p>}
				{applicationRequest.error && (
					<p className="form-error" role="alert">
						{applicationRequest.error.statusCode === 409
							? 'You have already applied to this role with this email address.'
							: applicationRequest.error.message}
					</p>
				)}
				<button className="button button-dark submit-button" disabled={applicationRequest.loading} type="submit">
					{applicationRequest.loading
						? submissionStage === 'uploading' ? `Uploading photo · ${uploadProgress}%` : 'Submitting application…'
						: 'Submit application'} <span aria-hidden="true">↗</span>
				</button>
				<p className="form-footnote">Your application will be sent directly to the hiring team.</p>
			</form>
		</div>
	);
}

export default ApplyPage;
