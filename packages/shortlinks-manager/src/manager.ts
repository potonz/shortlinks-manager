import { generateUniqueShortIds } from "./utils";

export interface IShortLinksManagerBackend {
    init?: () => unknown;
    getTargetUrl: (shortId: string) => string | null | Promise<string | null>;
    createShortLink: (shortId: string, targetUrl: string) => void | Promise<void>;
    checkShortIdsExist: (shortIds: string[]) => string[] | Promise<string[]>;
    updateShortLinkLastAccessTime(shortId: string): void | Promise<void>;
    cleanUnusedLinks(maxAge: number): void | Promise<void>;
}

interface IManagerProps {
    backend: IShortLinksManagerBackend;
    shortIdLength: number;
    onShortIdLengthUpdated: (newLength: number) => unknown;
}

export interface IShortLinksManager {
    /**
     * Generate a short ID linking to the target URL
     * @param {string} targetUrl targetUrl
     * @returns {Promise<string>} short ID
     * @throws Error if failed
     */
    createShortLink(targetUrl: string): Promise<string>;

    /**
     * Get a target URL from the given short ID
     * @param shortId
     * @returns the target URL as string or null if not found
     * @throws Error if failed
     */
    getTargetUrl(shortId: string): Promise<string | null>;
}

export async function createManager({ backend, shortIdLength, onShortIdLengthUpdated }: IManagerProps): Promise<IShortLinksManager> {
    await backend.init?.();

    return {
        async createShortLink(targetUrl: string): Promise<string> {
            let shortId = "";

            for (let i = 0; i < 10; i++) {
                // Generate multiple IDs to check if any of them are not already taken
                // Then use the first one that is not
                const listToTest = generateUniqueShortIds(50, shortIdLength);
                const existed = await backend.checkShortIdsExist(listToTest);
                const uniqueShortId = listToTest.find(id => !existed.includes(id));

                if (!uniqueShortId) {
                    ++shortIdLength;
                    await onShortIdLengthUpdated(shortIdLength);
                }
                else {
                    shortId = uniqueShortId;
                    break;
                }
            }

            await backend.createShortLink(shortId, targetUrl);

            return shortId;
        },

        async getTargetUrl(shortId) {
            return await backend.getTargetUrl(shortId);
        },
    };
}
