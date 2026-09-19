import {
	DeleteObjectCommand,
	DeleteObjectCommandOutput,
	S3Client,
} from '@aws-sdk/client-s3';
import { createHash, createHmac } from 'node:crypto';

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

const hmac = (key: string | Buffer, value: string): Buffer =>
	createHmac('sha256', key).update(value).digest();

const generatePresignedUrl = (key: string, contentType: string): string => {
	const now = new Date();
	const amzDate = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
	const date = amzDate.slice(0, 8);
	const region = config.AWS.region;
	const service = 's3';
	const base = endpoint ? new URL(endpoint) : new URL(`https://${bucket}.s3.${region}.amazonaws.com`);
	const host = base.host;
	const path = `${endpoint ? `/${bucket}` : ''}/${key.split('/').map(encodeURIComponent).join('/')}`;
	const scope = `${date}/${region}/${service}/aws4_request`;
	const query = new URLSearchParams({
		'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
		'X-Amz-Credential': `${config.AWS.accessKeyId}/${scope}`,
		'X-Amz-Date': amzDate,
		'X-Amz-Expires': '3600',
		'X-Amz-SignedHeaders': 'content-type;host',
	});
	const canonicalQuery = [...query.entries()]
		.sort(([a, av], [b, bv]) => a.localeCompare(b) || av.localeCompare(bv))
		.map(([name, value]) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
		.join('&');
	const canonicalHeaders = `content-type:${contentType}\nhost:${host}\n`;
	const canonicalRequest = `PUT\n${path}\n${canonicalQuery}\n${canonicalHeaders}\ncontent-type;host\nUNSIGNED-PAYLOAD`;
	const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${scope}\n${createHash('sha256').update(canonicalRequest).digest('hex')}`;
	const signingKey = hmac(hmac(hmac(hmac(`AWS4${config.AWS.secretAccessKey}`, date), region), service), 'aws4_request');
	const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex');
	return `${base.origin}${path}?${query.toString()}&X-Amz-Signature=${signature}`;
};

export const generatePresignedUploadUrl = async (
	jobId: string,
	fileName: string,
	fileType: string,
): Promise<{ uploadUrl: string; photoKey: string }> => {
	const safeFileName = fileName.replace(/\\/g, '/').split('/').pop() || 'upload';
	const photoKey = `jobs/${jobId}/${Date.now()}-${safeFileName}`;

	try {
		const uploadUrl = generatePresignedUrl(photoKey, fileType);

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
