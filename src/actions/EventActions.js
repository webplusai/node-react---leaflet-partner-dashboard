import pickBy from 'lodash/pickBy';
import isNull from 'lodash/isNull';
import { browserHistory } from 'react-router';

import { ADD_EVENTS, ADD_EVENT, EVENT_ERROR, SHOW_EVENT, REMOVE_EVENT } from '../constants/Event';

import { apiRequest } from '../utils';

export function addEvents(items = [], count = 0) {
  return {
    type: ADD_EVENTS,
    items,
    count
  };
}

export function addEvent(item = {}) {
  return {
    type: ADD_EVENT,
    item
  };
}

export function eventError(errorMessage) {
  return {
    type: EVENT_ERROR,
    errorMessage
  };
}

export function showEvent(item = {}) {
  return {
    type: SHOW_EVENT,
    item
  };
}

export function removeEvent(itemId) {
  return {
    type: REMOVE_EVENT,
    itemId
  };
}

export function fetchEvents({ search, include, order }, { is_admin, objectId }) {
  const user = is_admin ? {} : {
      __type: 'Pointer',
      className: 'Partner',
      objectId
    };

  const query = pickBy({
    $or: search ? [
        { description: { $regex: search, $options: 'i' } }
      ] : null,
    user: is_admin ? null : user
  }, v => !isNull(v));

  const url = [
    'Event?count=1',
    order ? `&order=${order}` : null,
    include ? `&include=${include}` : null,
    `&where=${JSON.stringify(query)}`
  ].join('');

  return dispatch => apiRequest.get(url)
    .then(({ data: { results, count } }) => dispatch(addEvents(results, count)));
}

export function fetchEvent(itemId) {
  return dispatch => apiRequest.get('Event', itemId, '?include="event_type,location,special"')
    .then(({ data }) => dispatch(showEvent(data)))
    .catch(() => browserHistory.push('/not-found'));
}

export function createEvent(event, { objectId }) {
  return dispatch => apiRequest.post('Event', {
    ...event,
    location: event.location ? {
        __type: 'Pointer',
        className: 'Location',
        objectId: event.location.objectId
      } : null,
    special: event.special ? {
        __type: 'Pointer',
        className: 'Special',
        objectId: event.special.objectId
      } : null,
    user: {
      __type: 'Pointer',
      className: 'Partner',
      objectId
    },
    event_type: event.event_type ? {
      __type: 'Pointer',
      className: 'EventType',
      objectId: event.event_type.objectId
    } : null,
  })
    .then(() => browserHistory.push('/events'))
    .catch(({ response: { data: { error } } }) => dispatch(eventError(error)));
}

export function batchCreateEvents(events, { objectId }){
    let requests = [];

    for(let i=0; i<events.length; i++){
        let singleRequest = {
            method: 'POST',
            path: '/parse/classes/Event',
            body: {
                ...events[i],
                location: event.location ? {
                    __type: 'Pointer',
                    className: 'Location',
                    objectId: event.location.objectId
                } : null,                special: event.special ? {
                    __type: 'Pointer',
                    className: 'Special',
                    objectId: event.special.objectId
                } : null,
                user: {
                    __type: 'Pointer',
                    className: 'Partner',
                    objectId
                },
                event_type: event.event_type ? {
                    __type: 'Pointer',
                    className: 'EventType',
                    objectId: event.event_type.objectId
                } : null

            }


        };
        requests.push(singleRequest);
    }

    return dispatch => apiRequest.batchPost({requests})
                    .then(() => browserHistory.push('/events'))
                    .catch(({ response: { data: { error } } }) => dispatch(eventError(error)));
}

/*
{"dates":[{"date":"10/18/2017","name":"Single Event","start":"7:00 PM","end":"10:00 PM"}],"start_time":"2017-10-19T03:04:06.026Z","end_time":"2017-11-01T03:04:06.026Z","description":"This is a test from single Create Event","redemption":{"name":"Only Pay at Door","value":"only_pay_at_door"},"cost":"7","add_criteria":true,"gender":{"name":"Female","value":"female"},"age":{"name":"35+","value":"35+"},"location":null,"special":null,"user":{"__type":"Pointer","className":"Partner","objectId":"8AcjaD8u3j"},"event_type":null}



curl -X POST \
  -H "X-Parse-Application-Id: ${APPLICATION_ID}" \
  -H "X-Parse-REST-API-Key: ${REST_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
"requests": [
    {
        "method": "POST",
        "path": "/parse/classes/GameScore",
        "body": {
            "score": 1337,
            "playerName": "Sean Plott"
        }
    },
    {
        "method": "POST",
        "path": "/parse/classes/GameScore",
        "body": {
            "score": 1338,
            "playerName": "ZeroCool"
        }
    }
]
}' \
  https://YOUR.PARSE-SERVER.HERE/parse/batch

    */

export function updateEvent(itemID, event) {
  return dispatch => apiRequest.put('Event', itemID, {
    ...event,
    location: event.location ? {
        __type: 'Pointer',
        className: 'Location',
        objectId: event.location.objectId
      } : null,
    special: event.special ? {
        __type: 'Pointer',
        className: 'Special',
        objectId: event.special.objectId
      } : null,
    event_type: event.event_type ? {
        __type: 'Pointer',
        className: 'EventType',
        objectId: event.event_type.objectId
    } : null,
  })
    .then(() => browserHistory.push('/events'))
    .catch(({ response: { data: { error } } }) => dispatch(eventError(error)));
}

export function deleteEvent(itemID) {
  return dispatch => apiRequest.delete('Event', itemID)
    .then(() => dispatch(removeEvent(itemID)))
    .then(() => browserHistory.push('/events'));
}
