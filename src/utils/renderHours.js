import moment from 'moment';

export default function(value) {
  return moment(value, 'HH:mm').format('hh:mm A');
}