const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const formatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "numeric",
  hour12: true,
  timeZone: "UTC",
});
/**
 *  Takes the hours object from the backend and returns a string representation of the hours
 * @param {object} hours - Hours object from the backend
 * @returns The string representation of the hours
 */
export function stringifyHours(hours) {
  if (hours[0]?.end !== undefined) {
    return hours.map((hour, index) => {
      let startHours = new Date(hour.start);
      let endHours = new Date(hour.end);
      let hours = "";
      if (startHours.toUTCString() === endHours.toUTCString()) {
        hours = "N/A";
      } else {
        hours = `${formatter.format(startHours)} - ${formatter.format(
          endHours
        )}`;
      }
      return { name: days[index], value: hours };
    });
  }
  return "";
}

/**
 * Takes a time object and converts it to a date string to be returned to the backend
 * + Time objects should be in the format of {hours, minutes, amPm}
 * @param {obj} time - The time object to convert to a date
 * @returns {string} - The date string
 */

export function createDatetimeString(time) {
  const amPm = time.amPm;
  const hours =
    amPm === "am" ? parseInt(time.hours) : parseInt(time.hours) + 12;
  const minutes = parseInt(time.minutes);
  const date = new Date(Date.UTC(0, 0, 0, hours || 0, minutes || 0));
  return date.toISOString();
}
