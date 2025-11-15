export function getDateRange(range: string | undefined, dateIso?: string) {
    const now = dateIso ? new Date(dateIso) : new Date();
    const start = new Date(now);
    const end = new Date(now);

    function startOfDay(d: Date) {
        const x = new Date(d);
        x.setHours(0, 0, 0, 0);
        return x;
    }
    function endOfDay(d: Date) {
        const x = new Date(d);
        x.setHours(23, 59, 59, 999);
        return x;
    }

    switch (range) {
        case 'day': {
            return { start: startOfDay(now), end: endOfDay(now) };
        }
        case 'week': {
            const day = now.getDay();
            const isoDay = day === 0 ? 7 : day;
            const diffToMon = isoDay - 1;
            const monday = new Date(now);
            monday.setDate(now.getDate() - diffToMon);
            return { start: startOfDay(monday), end: endOfDay(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6)) };
        }
        case 'month': {
            const first = new Date(now.getFullYear(), now.getMonth(), 1);
            const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            return { start: startOfDay(first), end: endOfDay(last) };
        }
        case 'quarter': {
            const q = Math.floor((now.getMonth()) / 3);
            const first = new Date(now.getFullYear(), q * 3, 1);
            const last = new Date(now.getFullYear(), q * 3 + 3, 0);
            return { start: startOfDay(first), end: endOfDay(last) };
        }
        case 'year': {
            const first = new Date(now.getFullYear(), 0, 1);
            const last = new Date(now.getFullYear(), 11, 31);
            return { start: startOfDay(first), end: endOfDay(last) };
        }
        case 'all':
        default:
            return { start: new Date(0), end: endOfDay(now) };
    }
}
