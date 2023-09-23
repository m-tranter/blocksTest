'use stricy';

const dateOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

const timeOptions = {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
};

const makePages = (arr, pageSize) => {
  let count = arr.length;
  let pageCount = Math.ceil(count / pageSize);
  let btns = Array.from({ length: pageCount }, (_, i) => i + 1);
  let pages = [...Array(pageCount)].map(() => arr.splice(0, pageSize));
  return { btns, pages };
};

const formatDate = (d) => {
  return d.toLocaleString('en-GB', dateOptions);
};

const sortDate = (a, b) => {
  return a.dateStartEnd.from - b.dateStartEnd.from;
};

const formatTime = (t) => {
  let time = t.toLocaleTimeString('en-GB', timeOptions);
  if (time === '0:00 pm') {
    return ' 12 noon';
  } else if (time.startsWith('0')) {
    time = '12' + time.slice(1);
  }
  return ' ' + time.replace(' ', '').toLowerCase();
};

const addDates = (obj) => {
  obj.dateStartEnd.to = new Date(obj.dateStartEnd.to);
  obj.dateStartEnd.from = new Date(obj.dateStartEnd.from);
  obj.startDate = formatDate(obj.dateStartEnd.from);
  obj.endDate = formatDate(obj.dateStartEnd.to);
  obj.startTime = formatTime(obj.dateStartEnd.from);
  obj.endTime = formatTime(obj.dateStartEnd.to);
  return obj;
};

const changeTags = (obj) => {
  obj.tags = obj.tags.map((e) => e.name);
  return obj;
};

export { changeTags, addDates, makePages, sortDate };
