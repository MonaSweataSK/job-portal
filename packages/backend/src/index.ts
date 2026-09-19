import express from 'express';

import config from './config/env';
import corsHandler from './middleware/corsHandler';
import errorHandler from './middleware/errorHandler';
import applicationsRouter from './routes/applications';
import jobsRouter from './routes/jobs';
import uploadsRouter from './routes/uploads';
import { connect, disconnect } from './services/db.service';
import { close as closeS3 } from './services/s3.service';

const app = express();

app.use(express.json());
app.use(corsHandler);
app.get('/', (_request, response) => {
	response.json({ status: 'ok' });
});
app.use(jobsRouter);
app.use(uploadsRouter);
app.use(applicationsRouter);

app.use(errorHandler);

const startServer = async (): Promise<void> => {
	await connect();

	const server = app.listen(config.PORT, () => {
		console.log(`Server listening on port ${config.PORT}`);
	});

	const shutdown = async (): Promise<void> => {
		server.close(async () => {
			await disconnect();
			closeS3();
			console.log('Server shut down');
		});
	};

	process.once('SIGINT', () => void shutdown());
	process.once('SIGTERM', () => void shutdown());
};

startServer().catch((error: unknown) => {
	console.error('Failed to start server', error);
	process.exitCode = 1;
});
