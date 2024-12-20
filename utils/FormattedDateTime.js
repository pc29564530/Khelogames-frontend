export const formattedDate = (item) => {
    const timestampStrDate = item;
    const timestampDate = new Date(timestampStrDate);
    const optionsDate = { weekday: 'long', month: 'long', day: '2-digit' };
    const formattedDate = timestampDate.toLocaleDateString('en-US', optionsDate);
    return formattedDate;
}

export const formattedTime = (item) => {
    const timestampStr = item;
    const [datePart, timePart] = timestampStr.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    let adjustedHour = hour;
    if (adjustedHour > 12) {
        adjustedHour = adjustedHour%12;
    } else if (adjustedHour < 12) {
        adjustedHour = adjustedHour;
    }
    const period = hour < 12 ? 'AM' : 'PM';
    const formattedTime = `${adjustedHour}:${minute < 10 ? '0' + minute : minute} ${period}`;
    return formattedTime;
}

export const convertToISOString = (item) => {
    const date = new Date(item*1000);
    const isoString = date.toISOString();
    return isoString;
}

export const formatToDDMMYY = (item) => {
    const timestampStrDate = item;
    const timestampDate = new Date(timestampStrDate);
    const day = String(timestampDate.getDate()).padStart(2,'0');
    const month = String(timestampDate.getMonth() + 1).padStart(2, '0');
    const year = String(timestampDate.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`
}