/* eslint-disable consistent-return */
/* eslint-disable no-else-return */
/* eslint-disable no-restricted-globals */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable arrow-body-style */
import moment from 'moment-timezone';

import { localStorageGet } from 'src/localStorageUtils/localStorageUtils';

/**
 * Format a date string to 'YYYY-MM-DD HH:mm:ss'
 * @param {string} dateStr - The date string in ISO 8601 format
 * @returns {string} - The formatted date string
 */
export const formatUTCDateString = (dateStr) => {
  return moment(dateStr).format('YYYY-MM-DD HH:mm:ss');
};
export const humanReadableDate = (dateStr) => {
  return moment(dateStr).format('MMMM D, YYYY');
};
export const MUIFormatDate = (dateStr) => {
  return moment(dateStr).format('MM/DD/YYYY');
};
// export const formattedTime = (timeStr) => {
//   // Check if the time string is empty or invalid
//   if (!timeStr || timeStr?.trim() === '') {
//     return ''; // Return empty string for invalid or empty input
//   }

//   // Specify the input format to parse correctly
//   const timeFormat = 'HH:mm'; // 24-hour format

//   // Parse the time string and format it to 'hh:mm A' (12-hour format with AM/PM)
//   const formatted = moment(timeStr, timeFormat).format('hh:mm A');

//   // Check if the result is an invalid date
//   if (moment(formatted, 'hh:mm A', true).isValid()) {
//     return formatted;
//   }
//   return ''; // Return empty string if the date is invalid
// };

export const formattedTime = (timeStr) => {
  // Ensure timeStr is a string or a valid time format
  if (!timeStr || typeof timeStr !== 'string') {
    return ''; // Return empty string for invalid or non-string input
  }

  // Parse the time string in 'HH:mm' format
  const time = moment(timeStr, 'HH:mm');

  if (time.isValid()) {
    const formatted = time.format('hh:mm A');
    return formatted;
  } else {
    // console.log('Invalid time format for timeStr:', timeStr);
  }

  return '';
  // // Ensure timeStr is a string or a valid date object
  // if (!timeStr || typeof timeStr !== 'string') {
  //   return ''; // Return empty string for invalid or non-string input
  // }

  // // Parse the ISO date-time string and format it to 'hh:mm A' (12-hour format with AM/PM)
  // const formatted = moment(timeStr).format('hh:mm A');

  // // Check if the result is an invalid date
  // if (moment(formatted, 'hh:mm A', true).isValid()) {
  //   return formatted;
  // }

  // return ''; // Return empty string if the date is invalid
};

export const convertToTimeFormat = (dateStr) => {
  return moment(dateStr).format('hh:mm A');
};
export const convertDateToTimeFormat = (dateStr) => {
  const parsedDate = moment.utc(dateStr); // Parse as UTC first

  // Apply the local timezone offset and format it to hh:mm A
  return parsedDate.format('hh:mm A');
  // return parsedDate.utcOffset('+05:30').format('hh:mm A');
};

export const convertToUTC = (date) => {
  const dateObj = new Date(date);
  return dateObj.toISOString(); // Converts the date to UTC in ISO 8601 format
};

export const parseTimeString = (timeString) => {
  if (!timeString) return null;

  const [time, period] = timeString.split(' ');
  if (!time || !period) return null;

  const [hours, minutes] = time.split(':').map(Number);

  if (isNaN(hours) || isNaN(minutes)) return null;

  const date = new Date();
  const isPM = period.toUpperCase() === 'PM';

  // eslint-disable-next-line no-nested-ternary
  date.setHours(isPM ? (hours === 12 ? 12 : hours + 12) : hours === 12 ? 0 : hours);
  date.setMinutes(minutes);
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date;
};
export const formatDateToISO = (date) => {
  if (date instanceof Date && !isNaN(date.getTime())) {
    return date.toISOString();
  }
  console.error('Invalid Date:', date);
  return null;
};

export const getMomentDateTimeFormat = (format) => {
  // Create a map to store the Moment.js format equivalents
  const formatMap = {
    'dd/MM/yyyy': 'DD/MM/YYYY',
    'dd MM yyyy': 'DD MM YYYY',
    'dd-MM-yyyy': 'DD-MM-YYYY',
    'dd/MMM/yyyy': 'DD/MMM/YYYY',
    'dd MMM yyyy': 'DD MMM YYYY',
    'dd-MMM-yyyy': 'DD-MMM-YYYY',
    'MM/dd/yyyy': 'MM/DD/YYYY',
    'MM dd yyyy': 'MM DD YYYY',
    'MM-dd-yyyy': 'MM-DD-YYYY',
    'MMM/dd/yyyy': 'MMM/DD/YYYY',
    'MMM dd yyyy': 'MMM DD YYYY',
    'MMM-dd-yyyy': 'MMM-DD-YYYY',
    'yyyy/MM/dd': 'YYYY/MM/DD',
    'yyyy MM dd': 'YYYY MM DD',
    'yyyy-MM-dd': 'YYYY-MM-DD',
    'yyyy/MMM/dd': 'YYYY/MMM/DD',
    'yyyy MMM dd': 'YYYY MMM DD',
    'yyyy-MMM-dd': 'YYYY-MMM-DD',
    'MMMM d, yyyy': 'MMMM D, YYYY',
    'yyyy, MMMM, dd': 'YYYY, MMMM, DD',
  };

  // Check if the format exists in the map
  const momentFormat = formatMap[format];

  // If the format exists, return the corresponding Moment.js format
  return momentFormat || format; // Simplified to return the original format if not found
};

export const globalFormatDate = (date) => {
  const momentDate = moment(date);

  // Ensure the date is a valid Moment object
  if (!momentDate.isValid()) {
    return '';
  }

  // Retrieve the stored date format from localStorage
  const storedDateFormat = localStorageGet('loginData')?.global_date_format || 'DD/MM/YYYY';

  // Use the `getMomentDateTimeFormat` function to get the corresponding Moment.js format
  const momentFormat = getMomentDateTimeFormat(storedDateFormat);

  // Format the date using the retrieved or default format
  return momentDate.format(momentFormat);
};
export const globalUTCFormatDate = (date) => {
  // Parse the date as UTC to prevent timezone shifting
  const momentDate = moment.utc(date);

  // Ensure the date is a valid Moment object
  if (!momentDate.isValid()) {
    return '';
  }

  // Retrieve the stored date format from localStorage
  const storedDateFormat = localStorageGet('loginData')?.global_date_format || 'DD/MM/YYYY';

  // Use the `getMomentDateTimeFormat` function to get the corresponding Moment.js format
  const momentFormat = getMomentDateTimeFormat(storedDateFormat);

  // Format the date using the retrieved or default format
  return momentDate.format(momentFormat);
};
