import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getJobs } from '../api/client';
import { useApiRequest } from '../api/useApiRequest';
import type { Job, JobsResponse } from '../types/api';

const pageSize = 10;
const dateFormat = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' });
const salaryFormat = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

const formatSalary = (minimum: number, maximum: number): string =>
	`₹${salaryFormat.format(Number(minimum))} – ₹${salaryFormat.format(Number(maximum))}`;

const formatDate = (value: string): string => {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? 'Recently posted' : dateFormat.format(date);
};

const JobListing = ({ job }: { job: Job }) => (
	<article className="job-row">
		<div className="job-main">
			<div className="job-row-meta">
				<span>{job.location}</span>
				<span aria-hidden="true">/</span>
				<span>{formatDate(job.posted_at)}</span>
			</div>
			<h2><Link to={`/jobs/${job.id}`}>{job.title}</Link></h2>
			<p className="job-summary">{job.description}</p>
			<div className="job-row-bottom">
				<span className="salary-range">{formatSalary(job.salary_min, job.salary_max)}</span>
				<Link className="text-link" to={`/jobs/${job.id}`}>
					View role <span aria-hidden="true">↗</span>
				</Link>
			</div>
		</div>
	</article>
);

function JobsPage() {
	const [page, setPage] = useState(1);
	const { data, error, loading, execute } = useApiRequest<JobsResponse>();

	useEffect(() => {
		void execute((signal) => getJobs({ page, limit: pageSize }, { signal }));
	}, [execute, page]);

	const pageCount = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

	return (
		<div className="page-wrap jobs-page">
			<section className="page-intro">
				<div className="eyebrow"><span className="eyebrow-line" /> Independent work, considered carefully</div>
				<div className="intro-grid">
					<h1>Find work<br /><em>worth doing.</em></h1>
					<p className="intro-copy">A considered collection of roles for people who want their work to matter. Explore what is open now.</p>
				</div>
				<div className="intro-bottom">
					<span>OPEN POSITIONS</span>
					<span>{data ? `${data.total.toString().padStart(2, '0')} roles` : 'Across good teams'}</span>
				</div>
			</section>

			<section className="listing-section" aria-labelledby="listing-title">
				<div className="section-heading">
					<div>
						<p className="section-kicker">The opportunity list</p>
						<h2 id="listing-title">Current openings</h2>
					</div>
					{data && <span className="result-count">{data.total} {data.total === 1 ? 'position' : 'positions'}</span>}
				</div>

				{loading && !data && <div className="state-panel" role="status">Finding open roles<span className="loading-dots">...</span></div>}

				{error && !data && (
					<div className="state-panel state-error" role="alert">
						<strong>We could not load the roles.</strong>
						<span>{error.message}</span>
						<button className="button button-secondary" onClick={() => void execute((signal) => getJobs({ page, limit: pageSize }, { signal }))}>Try again</button>
					</div>
				)}

				{!loading && !error && data?.jobs.length === 0 && (
					<div className="state-panel"><strong>No openings right now.</strong><span>Please check back soon.</span></div>
				)}

				{data && data.jobs.length > 0 && (
					<div className={loading ? 'job-list is-refreshing' : 'job-list'}>
						{data.jobs.map((job) => <JobListing key={job.id} job={job} />)}
					</div>
				)}

				{error && data && <p className="inline-error" role="alert">Could not refresh: {error.message}</p>}

				{data && data.total > 0 && (
					<div className="pagination" aria-label="Job listing pages">
						<span>Page {page} of {pageCount}</span>
					<div className="pagination-actions">
						<button className="page-button" type="button" onClick={() => setPage((current) => current - 1)} disabled={page <= 1 || loading} aria-label="Previous page">←</button>
						<button className="page-button" type="button" onClick={() => setPage((current) => current + 1)} disabled={page >= pageCount || loading} aria-label="Next page">→</button>
					</div>
					</div>
				)}
			</section>
		</div>
	);
}

export default JobsPage;
