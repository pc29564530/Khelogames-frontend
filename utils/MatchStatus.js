export const displayMatchStatus = (status) => {
    if(status === 'in_progress') {
        return 'Live';
    } else if(status === 'not_started') {
        return 'Upcoming';
    } else if(status === 'finished') {
        return 'End'
    }
}