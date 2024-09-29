export const formatPeriod = (period) => {
    switch (period) {
        case 'first_half':
            return '1st Half';
        case 'second_half':
            return '2nd Half';
        case 'extra_time_first_half':
            return 'ET 1st Half';
        case 'extra_time_second_half':
            return 'ET 2nd Half';
        case 'full_time':
            return 'Full Time';
        default:
            return '';
    }
}
