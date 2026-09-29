import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiClientError } from './client';

interface ApiRequestState<T> {
	data: T | undefined;
	error: ApiClientError | null;
	loading: boolean;
	execute: (request: (signal: AbortSignal) => Promise<T>) => Promise<T | undefined>;
	cancel: () => void;
}

const normalizeError = (error: unknown): ApiClientError =>
	error instanceof ApiClientError
		? error
		: new ApiClientError(error instanceof Error ? error.message : 'Request failed');

export const useApiRequest = <T,>(): ApiRequestState<T> => {
	const [data, setData] = useState<T>();
	const [error, setError] = useState<ApiClientError | null>(null);
	const [loading, setLoading] = useState(false);
	const controllerRef = useRef<AbortController | null>(null);

	const cancel = useCallback((): void => {
		controllerRef.current?.abort();
		controllerRef.current = null;
		setLoading(false);
	}, []);

	const execute = useCallback(async (
		request: (signal: AbortSignal) => Promise<T>,
	): Promise<T | undefined> => {
		controllerRef.current?.abort();
		const controller = new AbortController();
		controllerRef.current = controller;
		setLoading(true);
		setError(null);

		try {
			const result = await request(controller.signal);
			if (controller.signal.aborted) {
				return undefined;
			}
			setData(result);
			return result;
		} catch (requestError) {
			if (controller.signal.aborted) {
				return undefined;
			}
			const normalizedError = normalizeError(requestError);
			setError(normalizedError);
			return undefined;
		} finally {
			if (controllerRef.current === controller) {
				controllerRef.current = null;
				setLoading(false);
			}
		}
	}, []);

	useEffect(() => () => {
		controllerRef.current?.abort();
		controllerRef.current = null;
	}, []);

	return { data, error, loading, execute, cancel };
};
