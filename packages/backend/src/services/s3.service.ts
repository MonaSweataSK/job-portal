import {
	DeleteObjectCommand,
	DeleteObjectCommandOutput,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import config from '../config/env';

const bucket = config.AWS.s3Bucket;
const endpoint = config.AWS.s3Endpoint || undefined;

const s3Client = new S3Client({
	region: config.AWS.region,
	endpoint,
	forcePathStyle: Boolean(endpoint),
	credentials: {
		accessKeyId: config.AWS.accessKeyId,
		secretAccessKey: config.AWS.secretAccessKey,
	},
});

export const generatePresignedUploadUrl = async (
	jobId: string,
	fileName: string,
	fileType: string,
): Promise<{ uploadUrl: string; photoKey: string }> => {
	const safeFileName = fileName.replace(/\\/g, '/').split('/').pop() || 'upload';
	const photoKey = `jobs/${jobId}/${Date.now()}-${safeFileName}`;

	try {
		const uploadUrl = await getSignedUrl(
			s3Client,
			new PutObjectCommand({
				Bucket: bucket,
				Key: photoKey,
				ContentType: fileType,
			}),
			{ expiresIn: 3600 },
		);

		return { uploadUrl, photoKey };
	} catch (error) {
		console.error('Failed to generate S3 upload URL', error);
		throw error;
	}
};

export const getPhotoUrl = (photoKey: string): string => {
	try {
		const baseUrl = config.AWS.s3BaseUrl.replace(/\/$/, '');
		const encodedKey = photoKey.split('/').map(encodeURIComponent).join('/');

		return `${baseUrl}/${bucket}/${encodedKey}`;
	} catch (error) {
		console.error('Failed to generate S3 photo URL', error);
		throw error;
	}
};

export const deletePhoto = async (photoKey: string): Promise<DeleteObjectCommandOutput> => {
	try {
		return await s3Client.send(
			new DeleteObjectCommand({
				Bucket: bucket,
				Key: photoKey,
			}),
		);
	} catch (error) {
		console.error('Failed to delete S3 photo', error);
		throw error;
	}
};

export const close = (): void => s3Client.destroy();

export default s3Client;
