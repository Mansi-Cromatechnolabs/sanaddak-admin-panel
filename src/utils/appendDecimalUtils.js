/* eslint-disable no-restricted-globals */
/* eslint-disable no-else-return */
// export const appendDecimal = (value) => {
//   if (!value) return ''; // handle empty input
//   // Check if the value already has a decimal point and two decimal places
//   if (!value.includes('.')) {
//     return `${value}.00`;
//   } else if (value.split('.')[1].length === 1) {
//     // if it has one decimal place, add an additional 0
//     return `${value}0`;
//   }
//   return value; // already formatted correctly
// };
export const appendDecimal = (value) => {
  if (!value) return ''; // handle empty input

  // Remove any existing commas
  const numericValue = value.replace(/,/g, '');
  // Convert to a number and ensure two decimal places, only if numeric
  const number = parseFloat(numericValue);

  if (isNaN(number)) return ''; // If the value can't be parsed as a number, return an empty string

  // Format the number to two decimal places
  const formattedValue = number.toFixed(2);
  // Convert to a number and ensure two decimal places
  // const formattedValue = parseFloat(numericValue).toFixed(2);

  // Add commas as thousand separators
  return formattedValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
