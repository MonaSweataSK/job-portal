import { ErrorRequestHandler } from 'express';

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
	console.error('Unhandled server error', error);

	if (response.headersSent) {
		return;
	}

	response.status(500).json({ error: 'Internal server error' });
};

export default errorHandler;
