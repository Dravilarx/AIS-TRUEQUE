/**
 * Utility to sanitize data before sending to Firestore.
 * Firestore rejects 'undefined' values. This function recursively
 * replaces 'undefined' with 'null' (or removes keys if preferRemove is true).
 */
export const sanitizeData = (data: any, preferRemove: boolean = true): any => {
    if (data === null || data === undefined) {
        return null;
    }

    if (Array.isArray(data)) {
        return data.map(item => sanitizeData(item, preferRemove)).filter(item => item !== undefined);
    }

    if (typeof data === 'object' && !(data instanceof Date)) {
        // Handle Firestore server timestamps or other special objects if needed, 
        // but generally we want to traverse plain objects.
        // If it's a Firestore Timestamp-like object (sanity check), leave it.
        if (data.seconds !== undefined && data.nanoseconds !== undefined) return data;

        const sanitized: any = {};
        for (const [key, value] of Object.entries(data)) {
            const cleanValue = sanitizeData(value, preferRemove);

            // If preferRemove is true, we skip keys with undefined/null result (except explicit nulls if logic dictates)
            // But for Firestore, standardizing on NULL for "empty" is safer than missing keys for updates sometimes.
            // However, typical behavior: undefined -> ignore/remove key. null -> store null.

            if (cleanValue !== undefined) {
                sanitized[key] = cleanValue;
            } else if (!preferRemove) {
                sanitized[key] = null;
            }
        }
        return sanitized;
    }

    return data;
};

/**
 * Specifically prepares data for Firestore .add() or .set()
 * Converts all undefineds to nulls to ensure fields exist but are empty,
 * OR removes them entirely (default) to save space.
 */
export const prepareForFirestore = (data: any) => {
    // We remove undefined keys entirely. 
    // If you explicitly want a field to be "empty" in DB, pass null from the form.
    // If you pass undefined, it won't be saved.
    // BUT, to fix your specific error: "Unsupported field value: undefined", we just need to ensure NO undefined reaches invalid functions.

    // Simple deep clone JSON approach works for primitives but kills Dates/Timestamps.
    // So we use the recursive function above.
    return sanitizeData(data, true);
};
