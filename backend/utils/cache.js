/**
 * Simple in-memory cache utility for frequently accessed data
 * Reduces database load for static or rarely-changing data
 */

class SimpleCache {
    constructor(ttl = 3600000) { // Default: 1 hour
        this.cache = new Map();
        this.ttl = ttl;
    }

    /**
     * Store a value in cache with automatic expiry
     * @param {string} key - Cache key
     * @param {*} value - Value to cache
     */
    set(key, value) {
        this.cache.set(key, {
            value,
            expiry: Date.now() + this.ttl
        });
    }

    /**
     * Retrieve a value from cache
     * @param {string} key - Cache key
     * @returns {*} Cached value or null if expired/not found
     */
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        // Check if expired
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    /**
     * Check if a key exists and is not expired
     * @param {string} key - Cache key
     * @returns {boolean}
     */
    has(key) {
        return this.get(key) !== null;
    }

    /**
     * Remove a specific key from cache
     * @param {string} key - Cache key
     */
    delete(key) {
        this.cache.delete(key);
    }

    /**
     * Clear all cached data
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache stats
     */
    getStats() {
        let validEntries = 0;
        let expiredEntries = 0;

        for (const [key, item] of this.cache.entries()) {
            if (Date.now() > item.expiry) {
                expiredEntries++;
            } else {
                validEntries++;
            }
        }

        return {
            total: this.cache.size,
            valid: validEntries,
            expired: expiredEntries
        };
    }
}

// Cache instances for different data types
export const citiesCache = new SimpleCache(3600000); // 1 hour - cities rarely change
export const pharmacyCache = new SimpleCache(300000); // 5 minutes - pharmacy data updates
export const nearbyCache = new SimpleCache(180000); // 3 minutes - location-based queries

export default SimpleCache;
