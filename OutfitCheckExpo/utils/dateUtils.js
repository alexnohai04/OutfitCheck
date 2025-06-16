import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

/**
 * Returnează o descriere prietenoasă a datei ultimei utilizări.
 */
export const formatLastUsedDate = (dateStr) => {
    const date = dayjs(dateStr);

    if (date.isToday()) return 'Today';
    if (date.isYesterday()) return 'Yesterday';

    const daysAgo = dayjs().diff(date, 'day');
    if (daysAgo <= 6) return `${daysAgo} days ago`;

    return date.format('D MMM YYYY');
};

/**
 * Returnează un mesaj de donație dacă articolul nu a fost purtat de peste o lună.
 */
export const getDonationSuggestion = (dateStr) => {
    if (!dateStr) return null;

    const daysAgo = dayjs().diff(dayjs(dateStr), 'day');
    if (daysAgo > 30) {
        return "It looks like this item hasn’t been worn in a while. You might consider donating it 💖";
    }

    return null;
};