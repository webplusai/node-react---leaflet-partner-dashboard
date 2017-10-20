const moment = require('moment');
const size = require('lodash/size');
const isNaN = require('lodash/isNaN');
const fromPairs = require('lodash/fromPairs');
const last = require('lodash/last');
const sortBy = require('lodash/sortBy');
const toPairs = require('lodash/toPairs');
const Promise = require('bluebird');

const User = require('../models/user');
const UserLocation = require('../models/user_location');
const EventDetail = require('../models/event_detail');
const EventRequest = require('../models/event_request');
const Installation = require('../models/installation');
const EventNotification = require('../models/event_notification');

const getCurrentAge = (birthday) => {
  const [ month, day, year ] = birthday.split('/').map(el => Number(el));

  return ((new Date().getTime() - new Date(`${year}-${month}-${day}`)) / (24 * 3600 * 365.25 * 1000)) | 0;
};

module.exports = function(req, res) {
  Promise.all([
    new Promise((resolve, reject) => {
      User.count({}, function(err, users_count) {
        if (err) { return reject(err); }

        User.find().select({ tags: 1, birthday: 1 }).exec(function(err, users) {
          if (err)
            return reject(err);

          const ageCount = {},
                tagsCount = {};

          let tags_count = 0;

          users.map(user => {
            const birthday = user.get('birthday');

            if (birthday) {
              const age = getCurrentAge(birthday);
              
              if (!ageCount[age])
                ageCount[age] = 0;
  
              ageCount[age]++;
            }
  
            const tags = user.get('tags');
  
            if (tags) {
              tags.forEach(tag => {
                if (!tagsCount[tag]) {
                  tagsCount[tag] = 0; tags_count++;
                }
    
                tagsCount[tag]++;
              });
            }
          });

          const users_ages = [];

          sortBy(toPairs(ageCount), a => -(last(a))).map(sortedAge => {
            if (!isNaN(sortedAge[0]) && sortedAge[0] && sortedAge[1]) {
              users_ages.push({ age: sortedAge[0], per_cent: sortedAge[1] * 100 / users_count });
            }
          });

          const users_tags = sortBy(toPairs(tagsCount), a => -(last(a)))
            .map((sortedTag) => ({ tag: sortedTag[0], per_cent: sortedTag[1] * 100 / tags_count }))
            .slice(0, 10);

          resolve({
            users_tags,
            users_count,
            users_ages,
          });
        });
      });
    }),
    new Promise((resolve, reject) => {
      User.count({ createdAt: { $gte: moment().startOf('month').toDate().toISOString() } }, function(err, new_users_count) {
        if (err) {
          return reject(err);
        }
  
        EventDetail.count({ 'date.iso': { $gte: moment().startOf('month').toDate().toISOString() } }, function(err, event_details_count) {
          if (err) { return reject(err); }
    
          EventDetail.count({
            'date.iso': {
              $gte: moment().startOf('day').toDate().toISOString(),
              $lte: moment().startOf('day').add(7, 'days').toDate().toISOString()
            }
          }, function(err, plans_expiring_count) {
            if (err) { return reject(err); }
      
            Installation.count({
              // createdAt: {
              //   $gte: moment().startOf('year').add(-1, 'year').toDate().toISOString()
              // }
            }, function(err, installations_count) {
              if (err) { return reject(err); }
        
              EventNotification.count({}, function(err, event_notifications_count) {
                if (err) { return reject(err); }
          
                EventNotification.count({ status: 'Accepted' }, function(err, accepted_event_notifications_count) {
                  if (err) { return reject(err); }

                  resolve({
                    new_users_count,
                    event_details_count,
                    plans_expiring_count,
                    installations_count,
                    event_notifications_count,
                    accepted_event_notifications_count
                  });
                });
              });
            })
          });
        });
      });
    }),
    new Promise((resolve, reject) => {
      UserLocation.find({}).select({ 'locationCity': 1 }).exec((err, result) => {
        if (err)
          reject(err);
        
        const cityCount = {};
  
        result.map(el => el.get('locationCity')).forEach(citi => {
          if (!cityCount[citi]) {
            cityCount[citi] = 0;
          }
    
          cityCount[citi]++;
        });
  
        UserLocation.count({}, (err, cities_count) => {
          const cities = sortBy(toPairs(cityCount), a => -(last(a))).map(sortedCities => {
            return { city: sortedCities[0], per_cent: sortedCities[1] * 100 / cities_count }
          }).slice(0, 10);
  
          resolve({
            user_location_cities: cities
          });
        });
      });
    }),
    new Promise((resolve, reject) => {
      EventRequest.find({}).select({ 'city': 1 }).exec((err, result) => {
        if (err)
          reject(err);
    
        const cityCount = {};

        result.map(el => el.get('city')).forEach(city => {
          if (city === '')
            return;
          
          if (!cityCount[city]) {
            cityCount[city] = 0;
          }

          cityCount[city]++;
        });
  
        EventRequest.count({}, (err, cities_count) => {
          const cities = sortBy(toPairs(cityCount), a => -(last(a))).map(sortedCities => {
            return {
              city: sortedCities[0],
              per_cent: sortedCities[1]
            }
          }).slice(0, 10);

          resolve({
            user_event_cities: cities
          });
        });
      });
    }),
  ]).then(values => {
    res.send({
      tags: values[0].users_tags,
      users_count: values[0].users_count,
      users_ages: values[0].users_ages,

      new_users_count: values[1].new_users_count,
      available_itineraries: values[1].event_details_count,
      plans_expiring_count: values[1].plans_expiring_count,
      installations_count: values[1].installations_count,
      event_notifications_count: values[1].event_notifications_count,
      accepted_event_notifications_count: values[1].accepted_event_notifications_count,

      user_location_cities: values[2].user_location_cities,
      user_event_cities: values[3].user_event_cities,
    });
  });
};
