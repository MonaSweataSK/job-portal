import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { getJob } from '../api/client';
import { useApiRequest } from '../api/useApiRequest';
import type { JobResponse } from '../types/api';

const salaryFormat = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' });

function JobDetailPage() {
	const { jobId = '' } = useParams();
	const { data, error, loading, execute } = useApiRequest<JobResponse>();

	useEffect(() => {
		void execute((signal) => getJob(jobId, { signal }));
	}, [execute, jobId]);

	if ((!data && !error) || (loading && !data)) {
		return <div className="page-wrap"><div className="state-panel" role="status">Loading role details<span className="loading-dots">...</span></div></div>;
	}

	if (error || !data) {
		const isMissing = error?.statusCode === 400 || error?.statusCode === 404;
		return (
			<div className="page-wrap narrow-page">
				<div className="state-panel state-error" role="alert">
					<strong>{isMissing ? 'This role is no longer available.' : 'We could not load this role.'}</strong>
					{!isMissing && <span>{error?.message ?? 'Please try again.'}</span>}
					<Link className="button button-dark" to="/jobs">Back to all roles</Link>
				</div>
			</div>
		);
	}

	const { job } = data;
	const postedDate = new Date(job.posted_at);
	const postedLabel = Number.isNaN(postedDate.getTime()) ? 'Recently' : dateFormat.format(postedDate);

	return (
		<div className="page-wrap detail-page">
			<Link className="back-link" to="/jobs">← All roles</Link>
			<section className="detail-hero">
				<div className="eyebrow"><span className="eyebrow-line" /> Role details <span aria-hidden="true">/</span> Posted {postedLabel}</div>
				<h1>{job.title}</h1>
				<div className="detail-meta">
					<span>{job.location}</span>
					<span>₹{salaryFormat.format(Number(job.salary_min))} – ₹{salaryFormat.format(Number(job.salary_max))} / year</span>
				</div>
				<Link className="button button-dark apply-cta" to={`/jobs/${job.id}/apply`}>Apply for this role <span aria-hidden="true">↗</span></Link>
			</section>

			<section className="description-layout">
				<div className="description-label">THE ROLE</div>
				<div className="description-copy">
					<h2>A little more about the work.</h2>
					<p>{job.description}</p>
					<Link className="text-link" to={`/jobs/${job.id}/apply`}>Ready to apply? <span aria-hidden="true">↗</span></Link>
				</div>
			</section>
		</div>
	);
}

export default JobDetailPage;
