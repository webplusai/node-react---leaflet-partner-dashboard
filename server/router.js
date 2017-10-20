const passport = require('passport');

const authController = require('./controllers/auth');
const dataController = require('./controllers/data');
const uploadController = require('./controllers/upload');
const eventbriteController = require('./controllers/eventbrite');
const yelpController = require('./controllers/yelp');
const twilioController = require('./controllers/twilio');
const searchController = require('./controllers/search');
const stripeController = require('./controllers/stripe');
const pushServerController = require('./controllers/push_server');
const locations = require('./controllers/locations');

const passportService = require('./services/passport');

const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignin = passport.authenticate('local', { session: false });

module.exports = app => {
  app.post('/signin', requireSignin, authController.signin);
  app.post('/signup', authController.signup);
  app.get('/verify/:code', authController.verify);
  app.get('/token', requireAuth, authController.token);
  app.get('/data', dataController);
  app.post('/upload', uploadController);
  app.post('/eventbrite/search', eventbriteController.search);
  app.get('/eventbrite/organizers/:id', eventbriteController.organizers);
  app.get('/eventbrite/events/:id/tickets', eventbriteController.tickets);
  app.post('/yelp', yelpController.index);
  app.post('/yelp/show', yelpController.show);
  app.post('/twilio', twilioController.index);
  app.post('/twilio/test', twilioController.test);
  app.get('/twilio/:code', twilioController.show);
  app.post('/twilio/:code', twilioController.show);
  app.get('/twilio/calls/:id', twilioController.showCall);
  app.get('/search', searchController.index);
  app.get('/stripe/list', requireAuth, stripeController.list);
  app.get('/stripe/:custId/balance', requireAuth, stripeController.getBalance);
  app.post('/stripe/week', requireAuth, stripeController.week);
  app.post('/stripe', requireAuth, stripeController.create);
  app.delete('/stripe/:id', requireAuth, stripeController.remove);

  app.get('/get_four_location', locations.get_four_location);

  app.post('/seven_days_before_plan_expires', pushServerController.seven_days_before_plan_expires); // 1 time per day at 02:00
  app.post('/one_hour_before_the_invitation_is_about_to_expire', pushServerController.one_hour_before_the_invitation_is_about_to_expire); // 1 time per hour at HH:30
  app.post('/four_hours_before_plan_start', pushServerController.four_hours_before_plan_start); // 1 time per hour at HH:45
  app.post('/day_before_plan_starts', pushServerController.day_before_plan_starts); // 1 time per hour at HH:45
};
