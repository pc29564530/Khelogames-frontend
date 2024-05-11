export const determineMatchStatus = (item) => {
    startTimeStr = item.start_time;
    endTimeStr = item.end_time;
    const [datePart, timePart] = startTimeStr.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute, second] = timePart.slice(0,-1).split(':').map(Number);
    const matchStartDateTime = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

    const [datePartEnd, timePartEnd] = endTimeStr.split('T');
    const [yearEnd, monthEnd, dayEnd] = datePartEnd.split('-').map(Number);
    const [hourEnd, minuteEnd, secondEnd] = timePartEnd.slice(0,-1).split(':').map(Number);
    const matchEndDateTime = new Date(Date.UTC(yearEnd, monthEnd - 1, dayEnd, hourEnd, minuteEnd, secondEnd));


    const currentDateTime = new Date();
    const localDate = new Date(currentDateTime.getTime()-currentDateTime.getTimezoneOffset()*60*1000)
    if (isNaN(matchStartDateTime) || isNaN(matchEndDateTime)) {
        console.error("date time format error")
        return "";
    }

    let status;
    if (localDate < matchStartDateTime ) {
        status = "Not Started";
    } else if (localDate > matchEndDateTime) {
        status = "End";
    } else {
        status = "Live";
    }
    return status;
};