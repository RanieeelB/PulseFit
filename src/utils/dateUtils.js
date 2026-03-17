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

/**
 * Formats a YYYY-MM-DD date string into a user-friendly label.
 * Returns "Hoje" for today, "Ontem" for yesterday, or "DD/MM" for older dates.
 */
export const formatDayLabel = (dateStr) => {
    const today = getLocalDate();
    if (dateStr === today) return 'Hoje';

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    if (dateStr === yesterdayStr) return 'Ontem';

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    if (dateStr === tomorrowStr) return 'Amanhã';

    // Format as DD/MM
    const [, month, day] = dateStr.split('-');
    return `${day}/${month}`;
};

/**
 * Returns an array of the last 7 days + tomorrow, each with { date, label, dayOfWeek }.
 * Ordered from oldest to newest (Tomorrow being the last).
 */
export const getDietDays = () => {
    const days = [];
    // From 6 days ago to tomorrow (total 8 days)
    for (let i = -6; i <= 1; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

        days.push({
            date: dateStr,
            label: formatDayLabel(dateStr),
            dayOfWeek: weekdays[d.getDay()]
        });
    }
    return days;
};
