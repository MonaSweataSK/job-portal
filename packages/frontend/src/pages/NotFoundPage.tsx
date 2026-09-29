import { Link } from 'react-router-dom';

function NotFoundPage() {
	return (
		<div className="page-wrap not-found-page">
			<p className="section-kicker">404 / Not found</p>
			<h1>This page took<br /><em>another path.</em></h1>
			<p>The page you’re looking for isn’t here. Let’s get you back to the open roles.</p>
			<Link className="button button-dark" to="/jobs">Browse open roles <span aria-hidden="true">↗</span></Link>
		</div>
	);
}

export default NotFoundPage;
