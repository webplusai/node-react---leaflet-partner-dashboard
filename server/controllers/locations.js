const _ = require('lodash');
const async = require('async');
const moment = require('moment');
const deg2rad = require('locutus/php/math/deg2rad');

const User = require('../models/user');

const apiRequest = require('../utils/apiRequest');

const isoDateToSeconds = str => parseInt(moment(str).format('x'));
const convertToUniqueFlattenArray = arr => _.uniqWith(_.flattenDeep(arr), _.isEqual);

const NAME_SITY = 'New York, NY';
const MAX_DISTANCE = 1000; // meters
const NEW_YORK_COORDINATES = {
  latitude: 40.71424, longitude: -74.00594,
};

module.exports = {
  get_four_location(req, res) {
    const sendResponse = (error = null, locations = null) => res.json({ error, locations });

    async.parallel(
      ['Location', 'EventDetail', 'Event', 'Special'].map(
        table => done => apiRequest.get(`${table}?count=1&limit=1000`).then(({ data }) => done(null, data.results))
      ),
      (error, [ Location, EventDetail, Event, Special ]) => {
        if (error)
          return sendResponse(error);
  
        if (!Location.length)
          return sendResponse(null, []);
  
        if (Location.length <= 4)
          return sendResponse(null, Location);
  
        const dateNow = isoDateToSeconds();
  
        const activeEventDetailsIds = convertToUniqueFlattenArray(
          EventDetail
            .filter(({ start_day, end_day }) => (isoDateToSeconds(start_day) <= dateNow && dateNow <= isoDateToSeconds(end_day)))
            .map(event => event.locations.map(({ location }) => location.objectId))
        );

        const activeEvents = convertToUniqueFlattenArray(
          Event
            .filter(({ start_time, end_time, location }) => (start_time && end_time && location))
            .filter(({ start_time, end_time }) => (isoDateToSeconds(start_time) <= dateNow && dateNow <= isoDateToSeconds(end_time)))
        );
        
        const activeSpecials = convertToUniqueFlattenArray(
          Special
            .filter(({ start_date, end_date, without_end_date }) => {
              if (start_date && end_date)
                return (isoDateToSeconds(start_date) <= dateNow && dateNow <= isoDateToSeconds(end_date));
      
              if (start_date && without_end_date)
                return (isoDateToSeconds(start_date) <= dateNow);
      
              return false;
            })
        );

        const newYorkLocationsIds = Location
          .filter(location => (location.metro_city === NAME_SITY))
          .filter(({ latitude, longitude }) => {
            const { round, acos, cos, sin } = Math;

            const lat1 = deg2rad(NEW_YORK_COORDINATES.latitude);
            const lat2 = deg2rad(latitude);

            const distance = round(
              6378137 * acos( // This value will never change, it's a mathematical constant
                cos(lat1) * cos(lat2) * cos(deg2rad(NEW_YORK_COORDINATES.longitude) - deg2rad(longitude)) + sin(lat1) * sin(lat2)
              )
            );

            return distance <= MAX_DISTANCE;
          })
          .map(el => el.objectId);

        User.find().select({ tags: 1 }).exec(function(err, users) {
          if (err)
            return new Error(err);

          const tagsCount = {};

          users.map((user) => (user.get('tags') || []).map(tag => (tagsCount[tag] = (tagsCount[tag] || 0) + 1)));
  
          const tags = _.sortBy(_.toPairs(tagsCount), a => -(_.last(a))).map(([ tag ]) => tag).slice(0, 10);

          const locationTime = time => `${moment(time).format('h:mm A')}`;

          const resultLocations = _.takeRight(
            Location
              .filter(location => (activeEventDetailsIds.indexOf(location.objectId) === -1))
              .filter(location => (newYorkLocationsIds.indexOf(location.objectId) !== -1))
              .map((location) => {
                let rating = 0.0;
  
                if (_.findIndex(activeSpecials, (o) => (o.location.objectId === location.object)) !== -1)
                  rating += 2.0;

                if (_.findIndex(activeEvents, (o) => (o.location.objectId === location.object)) !== -1)
                  rating += 1.5;
  
                if (location.tags && _.intersectionWith(location.tags, tags, _.isEqual).length)
                  rating += 1.0;

                return Object.assign(location, { rating });
              })
              .sort((a, b) => (a.rating === b.rating ? 0 : a.rating < b.rating ? -1 : 1)),
            4
          ).map(location => {
            const specialIndex = _.findIndex(activeSpecials, (o) => (o.location.objectId === location.object));

            if (specialIndex !== -1) {
              const special = activeSpecials[specialIndex];

              if (special.end_date) {
                return ({ location, time: locationTime(isoDateToSeconds(special.end_date) - 60 * 60 * 1000) });
              }
            }

            if (_.get(location, 'location_type.value', null) === 'restaurant') {
              const locationTime = _.get(location, `hours[${moment().format('d')}].start`);

              if (locationTime) {
                const locationDate = `${moment().format('YYYY-MM-DD')} ${locationTime.match(/^(..)(..)$/)[1]}:${locationTime.match(/^(..)(..)$/)[2]}`;

                return ({
                  location,
                  time: moment(locationDate, 'YYYY-MM-DD HH:mm').add(1.5, 'hours').format('h:mm A')
                })
              }
            }
            
            return ({ location, time: locationTime() })
          });

          return sendResponse(null, resultLocations);
        });
      }
    );
  },
};
