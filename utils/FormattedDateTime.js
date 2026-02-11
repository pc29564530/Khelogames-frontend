export const formattedDate = (item) => {
    if (!item) return '--';
    const timestampDate = new Date(item);
    if (isNaN(timestampDate.getTime())) return '--';
    const optionsDate = { weekday: 'long', month: 'long', day: '2-digit' };
    return timestampDate.toLocaleDateString('en-US', optionsDate);
}

export const formattedTime = (item) => {
    if (!item || typeof item !== 'string' || !item.includes('T')) return '--';
    try {
        const [datePart, timePart] = item.split('T');
        const [hour, minute] = timePart.split(':').map(Number);
        if (isNaN(hour) || isNaN(minute)) return '--';
        let adjustedHour = hour;
        if (adjustedHour === 0) {
            adjustedHour = 12;
        } else if (adjustedHour > 12) {
            adjustedHour = adjustedHour % 12;
        }
        const period = hour < 12 ? 'AM' : 'PM';
        return `${adjustedHour}:${minute < 10 ? '0' + minute : minute} ${period}`;
    } catch (e) {
        return '--';
    }
}

export const convertToISOString = (item) => {
    if (!item && item !== 0) return null;
    try {
        const date = new Date(item * 1000);
        if (isNaN(date.getTime())) return null;
        return date.toISOString();
    } catch (e) {
        return null;
    }
}

export const formatToDDMMYY = (item) => {
    if (!item) return '--';
    const timestampDate = new Date(item);
    if (isNaN(timestampDate.getTime())) return '--';
    const day = String(timestampDate.getDate()).padStart(2, '0');
    const month = String(timestampDate.getMonth() + 1).padStart(2, '0');
    const year = String(timestampDate.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
}