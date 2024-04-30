export const convertToNumber = (value) => {
  if (typeof value === 'string') {
    const parsedValue = parseFloat(value);
    return isNaN(parsedValue) ? 0 : parsedValue;
  } else if (typeof value === 'number') {
    return value;
  } else {
    return 0;
  }
}