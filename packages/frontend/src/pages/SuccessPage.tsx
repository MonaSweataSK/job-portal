import { Link, useParams, useSearchParams } from 'react-router-dom';

function SuccessPage() {
	const { jobId = '' } = useParams();
	const [searchParams] = useSearchParams();
	const applicationId = searchParams.get('applicationId');

	return (
		<div className="page-wrap success-page">
			<div className="success-mark" aria-hidden="true">✓</div>
			<p className="section-kicker">Application received</p>
			<h1>That’s a good<br /><em>first step.</em></h1>
			<p className="success-copy">Your application has been sent to the hiring team. Thank you for taking the time to introduce yourself.</p>
			{applicationId && <p className="application-reference">APPLICATION <strong>#{applicationId}</strong></p>}
			<div className="success-actions">
				<Link className="button button-dark" to="/jobs">Explore more roles</Link>
				<Link className="text-link" to={`/jobs/${jobId}`}>Return to role</Link>
			</div>
		</div>
	);
}

export default SuccessPage;
