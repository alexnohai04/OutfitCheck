// services/logoService.js
import Constants from 'expo-constants';

/**
 * Fetches the brand logo URL from Logo.dev given a brand name.
 * Reads API key from expo "extra" in app.json (or manifest).
 * @param {string} brandName
 * @returns {Promise<string|null>}
 */
export async function fetchBrandLogo(brandName) {
    // Read from expoConfig.extra first (new SDKs), fallback to manifest.extra
    const API_KEY =
        Constants.expoConfig?.extra?.logoDevKey ||
        Constants.manifest?.extra?.logoDevKey;
    if (!API_KEY) {
        console.error('Logo.dev API key not found in Constants.extra.logoDevKey');
        return null;
    }

    const endpoint = `https://api.logo.dev/search?q=${encodeURIComponent(brandName)}`;
    try {
        const response = await fetch(endpoint, {
            headers: {
                Authorization: `Bearer ${API_KEY}`,
            },
        });
        if (!response.ok) {
            console.log(`Logo.dev fetch error: ${response.status}`);
            return null;
        }
        const data = await response.json();
        // Logo.dev returns an array of results
        if (Array.isArray(data) && data.length > 0 && data[0].logo_url) {
            return data[0].logo_url;
        }
        return null;
    } catch (error) {
        console.error('Logo.dev request failed:', error);
        return null;
    }
}
