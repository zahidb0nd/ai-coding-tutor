/**
 * 
 * @param {number} currentStreak - The user's current streak count.
 * @param {Date|null} lastActiveDate - The date the user last successfully completed a challenge.
 * @param {Date} nowDate - The current submission date.
 * @param {number} clientTimezoneOffsetMinutes - Client timezone offset from UTC in minutes. Optional.
 * @returns {number} The newly calculated streak.
 */
function calculateStreak(currentStreak, lastActiveDate, nowDate, clientTimezoneOffsetMinutes = null) {
    if (currentStreak === undefined || currentStreak === null) currentStreak = 0;

    const offsetMinutes = clientTimezoneOffsetMinutes !== null && clientTimezoneOffsetMinutes !== undefined
        ? clientTimezoneOffsetMinutes
        : nowDate.getTimezoneOffset();

    const getLocalStartOfDay = (date) => {
        const localDate = new Date(date.getTime() - (offsetMinutes * 60000));
        localDate.setUTCHours(0, 0, 0, 0);
        return localDate.getTime();
    };

    const todayLocalStart = getLocalStartOfDay(nowDate);
    let lastActiveLocalStart = lastActiveDate ? getLocalStartOfDay(lastActiveDate) : null;
    let newStreak = currentStreak;

    const oneDayMs = 24 * 60 * 60 * 1000;

    if (!lastActiveLocalStart || todayLocalStart - lastActiveLocalStart > oneDayMs) {
        // Missed a day or first time
        newStreak = 1;
    } else if (todayLocalStart - lastActiveLocalStart === oneDayMs) {
        // Streak continues!
        newStreak = currentStreak + 1;
    } // else: Same day submission, streak stays the same

    return newStreak;
}

module.exports = { calculateStreak };
