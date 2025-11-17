
import dayjs from 'dayjs';

// 1. Functions for Display (UTC -> User Timezone) 

export const displayInUserTimezone = (utcDateString, userTimezone) => {
  if (!utcDateString || !userTimezone) return '';

 
  return dayjs.utc(utcDateString).tz(userTimezone).format('MMM DD, YYYY [at] hh:mm A z');
};


export const getLocalTimeParts = (utcDateString, userTimezone) => {
    const zonedDayjs = dayjs.utc(utcDateString).tz(userTimezone);

    // Format: YYYY-MM-DD for date pickers
    const date = zonedDayjs.format('YYYY-MM-DD');

    // Format: HH:mm for time pickers (24-hour format)
    const time = zonedDayjs.format('HH:mm'); 

    return { date, time };
}


//Function for API Submission (Form Local Time -> UTC) 


export const convertLocalToUTC = (date, time, eventTimezone) => {
 
  const localDateTime = `${date} ${time}`;

  
  const zonedDayjs = dayjs.tz(localDateTime, eventTimezone);
  

  return zonedDayjs.utc().toISOString();
};