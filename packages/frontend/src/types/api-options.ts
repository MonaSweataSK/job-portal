export interface RequestOptions {
	signal?: AbortSignal;
	onProgress?: (percentage: number) => void;
}