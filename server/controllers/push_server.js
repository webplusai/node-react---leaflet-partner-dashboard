const async = require('async');
const axios = require('axios');
const moment = require('moment');
const winston = require('winston');
const { compact, flatten, size } = require('lodash');

const apiRequest = require('../utils/apiRequest');

const ONESIGNAL_HOST_URI = process.env.ONESIGNAL_HOST_URI;
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_SECRET_KEY = process.env.ONESIGNAL_SECRET_KEY;

const LOGS_DIR = 'log';

class onesignalServer {
  static headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Authorization": `Basic ${ONESIGNAL_SECRET_KEY}`
  };

  static createNotification(data) {
    return axios.post(`${ONESIGNAL_HOST_URI}/api/v1/notifications`, {
      app_id: ONESIGNAL_APP_ID,
      ...data,
    }, { headers: onesignalServer.headers });
  }

  static getDevices () {
    axios.get(`${ONESIGNAL_HOST_URI}/api/v1/players?app_id=${ONESIGNAL_APP_ID}`, {
      params: { count: 1 },
      headers: onesignalServer.headers
    }).then((data) => {
      console.log(data.data.players[0]);
    }).catch(err => {
      console.log(err);
    });
  }
}

class Notification {
  constructor(name, message, request, callbacks, { req, res }) {
    this.name = name;
    this.message = message;

    this.logger = new (winston.Logger)({
      transports: [
        // new (winston.transports.Console)(),
        new (winston.transports.File)({
          filename: `${LOGS_DIR}/push_server-${moment().format('YYYY-MM-DD_HH')}.log`
        })
      ],
    });

    this.logger.log('info', `${this.name} start`);

    const asyncFunctions = [
      done => {
        const { table, options } = request;

        apiRequest
          .get(table, options)
          .then(({ data }) => {
            this.logger.log('info', `${this.name} chose ${data.results.length} records`);

            done(null, data)
          })
          .catch(err => done(err));
      },

      // This can to convey the first parameters in done but this code is clearer
      ...(callbacks.map(e => e.bind(this)))
    ];

    async.waterfall(asyncFunctions, (err, data) => {
      if (err) { // all the errors you get here
        this.logger.log('error', `${this.name} Error: ${err}`);

        res.json(err).status(500);
      }

      return res.json({ success: true, data });
    });
  }
}

module.exports = {
  seven_days_before_plan_expires(req, res) {
    new Notification(
      'seven_days_before_plan_expires',
      'Your bookmarked plan will expire this week',
      { table: 'EventBookmark', options: { include: ['user', 'event'], limit: 5000, count: 1 } },
      [
        function(data, done) {
          const users = compact(
            data.results
              .filter(({ user, event }) => (user && user.playerID) ? moment(event.end_day.iso).add(-7, 'days').format('YYYY-MM-DD') === moment().format('YYYY-MM-DD') : false)
              .map(el => el.user.playerID)
          );

          this.logger.log('info', `${this.name} After filtration, left ${users.length} records`);

          done(null, users);
        },
        function (playerIds, done) {
          if (size(playerIds) > 0) {
            onesignalServer.createNotification({
              contents: { en: this.message },
              include_player_ids: playerIds,
            })
            .then(response => done(null, response.data))
            .catch(err => done(err))
          } else {
            done(null, 'Nothing to do');
          }
        }
      ],
      { req, res }
    );
  },

  one_hour_before_the_invitation_is_about_to_expire(req, res) {
    new Notification(
      'one_hour_before_the_invitation_is_about_to_expire',
      'Will you be joining @@inviter_name on @@day_of_week_of_plan? Don`t miss out. Respond to the invite now',
      {
        table: 'EventNotification',
        options: {
          count: 1,
          limit: 5000,
          where: { status: 'Invited' },
          include: ['from', 'group', 'group.event', 'group.participant', 'from', 'to']
        }
      },
      [
        function (data, done) {

          const usersEvents = compact(flatten(
            data.results
              .filter(el => (el && el.group && el.group.event))
              .map(eventNotification => {
                const { group: { event : { locations, objectId: eventDetailId }, createdAt, objectId: eventGroupId }, from, to: participant } = eventNotification;

                const dateCreated = parseInt(moment(`${moment(createdAt).format('YYYY-MM-DD')} ${locations[0].time}`, 'YYYY-MM-DD HH:mm AM/PM').format('X'));

                const result = moment(dateCreated + parseInt(participant && participant.timeZone || 0) - (60 * 60), 'X'); // event + user's timeZone - 1 hour

                const resultDate = result.format('YYYY-MM-DD HH:mm');
                const nowDate = moment().format('YYYY-MM-DD HH:mm');

                this.logger.log('info', 'Checking time', {
                  eventNotificationId: eventNotification.objectId,
                  fromId: from && from.objectId,
                  participantId: participant && participant.objectId,
                  eventGroupId,
                  eventDetailId,
                  resultDate,
                  nowDate
                });

                if (resultDate === nowDate) {
                  return { eventNotification, from, participant, dateCreated };
                }
              })
          ));

          this.logger.log('info', `${this.name} After filtration, left ${usersEvents.length} records`);

          done(null, usersEvents);
        },
        function (usersEventNotifications, done) {
          if (size(usersEventNotifications) > 0) {

            const callbacks = usersEventNotifications.filter(el => el.participant.playerID).map(usersEventNotification => {
              return new Promise((resolve, reject) => {
                const message = this.message
                  .replace(/@@inviter_name/, usersEventNotification.from && usersEventNotification.from.full_name)
                  .replace(/@@day_of_week_of_plan/, moment(usersEventNotification.dateCreated, 'X').format('dddd'));

                this.logger.log('info', 'Sending Event Notification', {
                  eventNotification_id: usersEventNotification.eventNotification.objectId,
                  eventGroup_id: usersEventNotification.eventNotification.group.objectId,
                  eventDetail_id: usersEventNotification.eventNotification.group.event.objectId,
                  playerID: usersEventNotification.participant.playerID
                });

                onesignalServer.createNotification({
                  contents: { en: message },
                  include_player_ids: [usersEventNotification.participant.playerID]
                })
                .then(response => resolve(response.data))
                .catch(err => reject(err));
              });
            });

            Promise.all(callbacks)
            .then(data => done(null, data))
            .catch(err => done(err));
          } else {
            done(null, 'Nothing to do');
          }
        }
      ],
      { req, res }
    );
  },

  four_hours_before_plan_start(req, res) {
    new Notification(
      'four_hours_before_plan_start',
      '@@plan_name will begin in 4 hours.',
      { table: 'EventNotification', options: { where: { ack: true, status: 'Accepted' }, include: ['from', 'group', 'group.event', 'group.participant'], limit: 5000, count: 1 } },
      [
        function (data, done) {
          const usersEvents = compact(flatten(
            data.results
            .filter(el => (el && el.group && el.group.event && el.group.participant))
            .map(eventNotification => {
              const { group: { event : { locations, objectId: eventDetail_id }, participant, createdAt, objectId: eventGroup_id } } = eventNotification;

              const dateCreated = parseInt(moment(`${moment(createdAt).format('YYYY-MM-DD')} ${locations[0].time}`, 'YYYY-MM-DD HH:mm AM/PM').format('x'));

              return participant.map(participant => {
                const result = moment(dateCreated + parseInt(participant.timeZone || 0) - (60 * 60 * 4), 'x'); // event + user's timeZone - 4 hour

                this.logger.log('info', 'Checking time', {
                  eventNotification_id: eventNotification.objectId, eventGroup_id, eventDetail_id, resultDate: result.format('YYYY-MM-DD HH:mm'), nowDate: moment().format('YYYY-MM-DD HH:mm'),
                });

                if (result.format('YYYY-MM-DD HH:mm') === moment().format('YYYY-MM-DD HH:mm')) {
                  return { eventNotification, participant, dateCreated };
                }
              });
            })
          ));

          this.logger.log('info', `${this.name} After filtration, left ${usersEvents.length} records`);

          done(null, usersEvents);
        },
        function (usersEventNotifications, done) {
          if (size(usersEventNotifications) > 0) {

            const callbacks = usersEventNotifications.filter(el => el.participant.playerID).map(usersEventNotification => {
              return new Promise((resolve, reject) => {

                const message = this.message
                .replace(/@@plan_name/, usersEventNotification.eventNotification.group.event.title_event);

                this.logger.log('info', 'Sending Event Notification', {
                  eventNotification_id: usersEventNotification.eventNotification.objectId,
                  eventGroup_id: usersEventNotification.eventNotification.group.objectId,
                  eventDetail_id: usersEventNotification.eventNotification.group.event.objectId,
                  playerID: usersEventNotification.participant.playerID
                });

                onesignalServer.createNotification({
                  contents: { en: message },
                  include_player_ids: [usersEventNotification.participant.playerID]
                })
                .then(response => resolve(response.data))
                .catch(err => reject(err));
              });
            });

            Promise.all(callbacks)
            .then(data => done(null, data))
            .catch(err => done(err));
          } else {
            done(null, 'Nothing to do');
          }
        }
      ],
      { req, res }
    );
  },

  day_before_plan_starts(req, res) {
    new Notification(
      'day_before_plan_starts',
      'Don`t forget @@plan_name is happening tomorrow.',
      { table: 'EventNotification', options: { where: { ack: true, status: 'Accepted' }, include: ['from', 'group', 'group.event', 'group.participant'], limit: 5000, count: 1 } },
      [
        function (data, done) {
          const usersEvents = compact(flatten(
            data.results
            .filter(el => (el && el.group && el.group.event && el.group.participant))
            .map(eventNotification => {
              const { group: { event : { locations, objectId: eventDetail_id }, participant, createdAt, objectId: eventGroup_id } } = eventNotification;

              const dateCreated = parseInt(moment(`${moment(createdAt).format('YYYY-MM-DD')} ${locations[0].time}`, 'YYYY-MM-DD HH:mm AM/PM').format('x'));

              return participant.map(participant => {
                const result = moment(dateCreated + parseInt(participant.timeZone || 0) - (60 * 60 * 24), 'x'); // event + user's timeZone - 24 hours

                this.logger.log('info', 'Checking time', {
                  eventNotification_id: eventNotification.objectId, eventGroup_id, eventDetail_id, resultDate: result.format('YYYY-MM-DD HH:mm'), nowDate: moment().format('YYYY-MM-DD HH:mm'),
                });

                if (result.format('YYYY-MM-DD HH:mm') === moment().format('YYYY-MM-DD HH:mm')) {
                  return { eventNotification, participant, dateCreated };
                }
              });
            })
          ));

          this.logger.log('info', `${this.name} After filtration, left ${usersEvents.length} records`);

          done(null, usersEvents);
        },
        function (usersEventNotifications, done) {
          if (size(usersEventNotifications) > 0) {

            const callbacks = usersEventNotifications.filter(el => el.participant.playerID).map(usersEventNotification => {
              return new Promise((resolve, reject) => {

                const message = this.message
                .replace(/@@plan_name/, usersEventNotification.eventNotification.group.event.title_event);

                this.logger.log('info', 'Sending Event Notification', {
                  eventNotification_id: usersEventNotification.eventNotification.objectId,
                  eventGroup_id: usersEventNotification.eventNotification.group.objectId,
                  eventDetail_id: usersEventNotification.eventNotification.group.event.objectId,
                  playerID: usersEventNotification.participant.playerID
                });

                onesignalServer.createNotification({
                  contents: { en: message },
                  include_player_ids: [usersEventNotification.participant.playerID]
                })
                .then(response => resolve(response.data))
                .catch(err => reject(err));
              });
            });

            Promise.all(callbacks)
            .then(data => done(null, data))
            .catch(err => done(err));
          } else {
            done(null, 'Nothing to do');
          }
        }
      ],
      { req, res }
    );
  }
};
