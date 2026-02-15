/**
 * Returns the current date in YYYY-MM-DD format based on the user's local timezone.
 * This avoids issues where new Date().toISOString() returns the previous day (UTC)
 * when it's still the current day locally.
 */
export const getLocalDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
