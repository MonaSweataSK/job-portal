import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../../.env.local');
dotenv.config({ path: envPath });

const getRequired = (name: string): string => {
	const value = process.env[name];

	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}

	return value;
};

const getOptional = (name: string): string | undefined => process.env[name] || undefined;

const getPort = (name: string): number => {
	const value = Number.parseInt(getRequired(name), 10);

	if (Number.isNaN(value)) {
		throw new Error(`Environment variable ${name} must be a number`);
	}

	return value;
};

export interface AppConfig {
	PORT: number;
	NODE_ENV: string;
	DB: {
		host: string;
		port: number;
		database: string;
		user: string;
		password: string;
	};
	AWS: {
		region: string;
		accessKeyId: string;
		secretAccessKey: string;
		s3Endpoint?: string;
		s3Bucket: string;
		s3BaseUrl: string;
	};
	CORS_ORIGIN: string;
	LOG_LEVEL: string;
}

const config: AppConfig = {
	PORT: getPort('PORT'),
	NODE_ENV: getRequired('NODE_ENV'),
	DB: {
		host: getRequired('DB_HOST'),
		port: getPort('DB_PORT'),
		database: getRequired('DB_NAME'),
		user: getRequired('DB_USER'),
		password: getRequired('DB_PASSWORD'),
	},
	AWS: {
		region: getRequired('AWS_REGION'),
		accessKeyId: getRequired('AWS_ACCESS_KEY_ID'),
		secretAccessKey: getRequired('AWS_SECRET_ACCESS_KEY'),
		s3Endpoint: getOptional('S3_ENDPOINT'),
		s3Bucket: getRequired('S3_BUCKET'),
		s3BaseUrl: getRequired('S3_BASE_URL'),
	},
	CORS_ORIGIN: getRequired('CORS_ORIGIN'),
	LOG_LEVEL: getRequired('LOG_LEVEL'),
};

export default config;
