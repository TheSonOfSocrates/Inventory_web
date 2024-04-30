import dayjs from 'dayjs';

export const getFormattedTimestamp = () =>{
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const timestamp = `${day}${month}${year}_${hours}${minutes}${seconds}`;
  return timestamp;
}

export const convertToLocalTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: 'numeric', 
    second: 'numeric' 
  };
  const localDateString = date.toLocaleString(options);
  return localDateString;
}

export const isExpired = (expirationDatetime) =>{
  // Parse the created datetime
  const expirationDate = new Date(expirationDatetime);
  const currentDate = new Date();
  
  return expirationDate < currentDate;
}

export const comparebyUpdatedDateTime = (a, b) => {
  let dateA = new Date(a?.updated_datetime ?? 0);
  let dateB = new Date(b?.updated_datetime ?? 0);
  
  // Compare dates
  if (dateA < dateB) return 1;
  if (dateA > dateB) return -1;
  return 0;
}

export const nowToString = () => {
  const now = new Date();

// Get date components
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0'); // Month starts from 0
const day = String(now.getDate()).padStart(2, '0');

// Get time components
const hours = String(now.getUTCHours()).padStart(2, '0'); // Use UTC hours to avoid timezone offset
const minutes = String(now.getUTCMinutes()).padStart(2, '0');
const seconds = String(now.getUTCSeconds()).padStart(2, '0');
const milliseconds = String(now.getUTCMilliseconds()).padStart(6, '0');

// Get timezone offset
const offsetHours = String(Math.floor(now.getTimezoneOffset() / 60)).padStart(2, '0');

const offsetMinutes = String(now.getTimezoneOffset() % 60).padStart(2, '0');
let offsetSign = now.getTimezoneOffset() > 0 ? '-' : '+';
if (offsetHours.startsWith('+') || offsetHours.startsWith('-')) offsetSign = '';

// Format the date string
const dateString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${offsetSign}${offsetHours}:${offsetMinutes}`;

  return dateString;
}

export const calcDaysDifference = (baseDate) => {
  // Get the current date
  const currentDate = dayjs();
  // Calculate the difference in days from now to another date
  const anotherDate = dayjs(baseDate); // Replace '2024-04-01' with your desired date
  const daysDifference = anotherDate.diff(currentDate, 'day');
  return daysDifference;
}