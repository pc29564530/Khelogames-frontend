export const formattedDate = (item) => {
    if (!item) return '--';
    const timestampDate = new Date(item);
    if (isNaN(timestampDate.getTime())) return '--';
    const optionsDate = { weekday: 'long', month: 'long', day: '2-digit' };
    return timestampDate.toLocaleDateString('en-US', optionsDate);
}

export const formattedTime = (item) => {
    const dt = new Date(item);
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

//Local to UTC
export const localToUTC = (localDate) => {
    if (!localDate) return null;
    return new Date(localDate).toISOString();
}

export const localToUTCTimestamp = (localDate) => {
    if (!localDate) return null;
    return Math.floor(new Date(localDate).getTime() / 1000);
}

export const utcToLocalDate = (utcString) => {
    if(!utcString) return null;
    return new Date(utcString);
}

export const utcTimestampToLocalDate = (timestamp) => {
    if (!timestamp) return null;
    return new Date(timestamp * 1000); // Multiply by 1000 for milliseconds
};

// Formatted outputs
export const formatLocalTime = (date) => {
    if (!date) return '--';
    return new Date(date).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};

export const formatLocalDate = (date) => {
    if (!date) return '--';
    return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: '2-digit'
    });
};

export const formatUTCTime = (date) => {
    if (!date) return '--';
    const d = new Date(date);
    const hours = d.getUTCHours();
    const minutes = d.getUTCMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period} UTC`;
};