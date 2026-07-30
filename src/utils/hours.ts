/**
 * Operating Hours: 4:00 PM (16:00) to 2:00 AM (02:00) daily
 */
export function getStoreStatus(): {
  isOpen: boolean;
  statusText: string;
  badgeColor: string;
  nextChangeText: string;
} {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Store is open from 16:00 (4 PM) through midnight to 02:00 (2 AM)
  const isOpen = currentHour >= 16 || currentHour < 2;

  if (isOpen) {
    let closingMinutesLeft = 0;
    if (currentHour >= 16) {
      // Hours remaining until midnight + 2 hours
      closingMinutesLeft = (24 - currentHour + 1) * 60 + (60 - currentMinute);
    } else {
      // Hours remaining until 2 AM
      closingMinutesLeft = (1 - currentHour) * 60 + (60 - currentMinute);
    }

    const hoursLeft = Math.floor(closingMinutesLeft / 60);
    const minsLeft = closingMinutesLeft % 60;

    return {
      isOpen: true,
      statusText: 'Open Now • Closes at 2:00 AM',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
      nextChangeText: `Open for another ${hoursLeft > 0 ? `${hoursLeft}h ` : ''}${minsLeft}m`,
    };
  } else {
    // Closed. Opens at 4:00 PM today.
    const openingMinutesLeft = (15 - currentHour) * 60 + (60 - currentMinute);
    const hoursLeft = Math.floor(openingMinutesLeft / 60);
    const minsLeft = openingMinutesLeft % 60;

    return {
      isOpen: false,
      statusText: 'Opens Today at 4:00 PM',
      badgeColor: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
      nextChangeText: `Opens in ${hoursLeft > 0 ? `${hoursLeft}h ` : ''}${minsLeft}m`,
    };
  }
}
