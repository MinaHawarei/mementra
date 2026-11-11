export interface MediaItem {
    id: number;
    original_filename: string;
    url?: string;
    download_url?: string;
    is_owner?: boolean;
    user_id?: number;
    mime_type?: string;
    size_bytes?: number;
}

export interface JournalBlockItem {
    id?: number;
    type?: string;
    position?: number;
    content?: unknown;
    content_json?: unknown;
    created_by?: number;
    creator?: { id: number; name: string };
}

/**
 * Normalizes props that may arrive as a raw array or wrapped in a `{ data: T[] }` object.
 */
export function normalizeList<T>(val: T[] | { data?: T[] } | undefined | null): T[] {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'object' && Array.isArray((val as { data?: T[] }).data)) {
        return (val as { data?: T[] }).data ?? [];
    }
    return [];
}

/**
 * Extracts plain text from a journal block regardless of serialization format.
 */
export function getBlockText(block?: JournalBlockItem | null): string {
    if (!block) return '';
    const content = block.content !== undefined ? block.content : block.content_json;
    return extractTextFromContent(content);
}

export function extractTextFromContent(content: unknown): string {
    if (content === null || content === undefined) return '';
    if (typeof content === 'string') {
        const trimmed = content.trim();
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
            try {
                const parsed = JSON.parse(trimmed);
                return extractTextFromContent(parsed);
            } catch {
                return content;
            }
        }
        return content;
    }
    if (typeof content === 'object') {
        const obj = content as Record<string, unknown>;
        if (typeof obj.text === 'string') return obj.text;
        if (typeof obj.body === 'string') return obj.body;
        if (typeof obj.content === 'string') return obj.content;
        if (typeof obj.quote === 'string') return obj.quote;
        if (typeof obj.value === 'string') return obj.value;
        if (typeof obj.markdown === 'string') return obj.markdown;
        for (const val of Object.values(obj)) {
            if (typeof val === 'string' && val.trim().length > 0) {
                return val;
            }
        }
    }
    return '';
}

/**
 * Resolves the safest URL for viewing or displaying a media item.
 * Prioritizes relative proxy paths (/media/{id}/file) if hostnames differ,
 * preventing cross-origin DNS or SSL mismatch issues in local and deployed environments.
 */
export function getMediaUrl(media: { id: number; url?: string }): string {
    if (media.url) {
        if (media.url.startsWith('/')) {
            return media.url;
        }
        if (typeof window !== 'undefined') {
            try {
                const parsed = new URL(media.url);
                if (parsed.origin === window.location.origin) {
                    return media.url;
                }
                return parsed.pathname + parsed.search;
            } catch {
                // fall through
            }
        }
    }
    return `/media/${media.id}/file`;
}

/**
 * Resolves the download URL for a media item.
 */
export function getMediaDownloadUrl(media: { id: number; download_url?: string }): string {
    if (media.download_url) {
        if (media.download_url.startsWith('/')) {
            return media.download_url;
        }
        if (typeof window !== 'undefined') {
            try {
                const parsed = new URL(media.download_url);
                if (parsed.origin === window.location.origin) {
                    return media.download_url;
                }
                return parsed.pathname + parsed.search;
            } catch {
                // fall through
            }
        }
    }
    return `/media/${media.id}/download`;
}

