module.exports = {
  db: process.env.MONGODB || 'mongodb://localhost:27017/meetua',

  sessionSecret: process.env.SESSION_SECRET || 'Your Session Secret goes here',

  localAuth: true,

  mailgun: {
    login: process.env.MAILGUN_LOGIN || 'Your Mailgun SMTP Username',
    password: process.env.MAILGUN_PASSWORD || 'Your Mailgun SMTP Password'
  },

  sendgrid: {
    user: process.env.SENDGRID_USER || 'Your SendGrid Username',
    password: process.env.SENDGRID_PASSWORD || 'Your SendGrid Password'
  },

  nyt: {
    key: process.env.NYT_KEY || 'Your New York Times API Key'
  },

  lastfm: {
    api_key: process.env.LASTFM_KEY || 'Your API Key',
    secret: process.env.LASTFM_SECRET || 'Your API Secret'
  },

  facebookAuth: true,
  facebook: {
    clientID: process.env.FACEBOOK_ID || '231654163709403',
    clientSecret: process.env.FACEBOOK_SECRET || '5de9fd512eb5470c8a305d6ce294ec5b',
    callbackURL: '/auth/facebook/callback',
    passReqToCallback: true
  },

  vkAuth: true,
  vk: {
    clientID: process.env.VK_ID || '4342834',
    clientSecret: process.env.VK_SECRET || 'v4Y1BbQ9BF2s2MVhzY4H',
//    clientID: process.env.VK_ID || '4342941',
//    clientSecret: process.env.VK_SECRET || 'HtX1C4eEuDjIQMiXUONF',
    callbackURL: '/auth/vkontakte/callback',
    passReqToCallback: true
  },


  githubAuth: false,
  github: {
    clientID: process.env.GITHUB_ID || 'Your Client ID',
    clientSecret: process.env.GITHUB_SECRET || 'Your Client Secret',
    callbackURL: '/auth/github/callback',
    passReqToCallback: true
  },

  twitterAuth: false,
  twitter: {
    consumerKey: process.env.TWITTER_KEY || 'Your Consumer Key',
    consumerSecret: process.env.TWITTER_SECRET  || 'Your Consumer Secret',
    callbackURL: '/auth/twitter/callback',
    passReqToCallback: true
  },

  googleAuth: false,
  google: {
    clientID: process.env.GOOGLE_ID || 'Your Client ID',
    clientSecret: process.env.GOOGLE_SECRET || 'Your Client Secret',
    callbackURL: '/auth/google/callback',
    passReqToCallback: true
  },

  linkedinAuth: false,
  linkedin: {
    clientID: process.env.LINKEDIN_ID || 'Your Client ID',
    clientSecret: process.env.LINKEDIN_SECRET || 'Your Client Secret',
    callbackURL: '/auth/linkedin/callback',
    scope: ['r_fullprofile', 'r_emailaddress', 'r_network'],
    passReqToCallback: true
  },

  steam: {
    apiKey: process.env.STEAM_KEY || 'Your Steam API Key'
  },

  twilio: {
    sid: process.env.TWILIO_SID || 'Your Twilio SID',
    token: process.env.TWILIO_TOKEN || 'Your Twilio token'
  },

  clockwork: {
    apiKey: process.env.CLOCKWORK_KEY || 'Your Clockwork SMS API Key'
  },

  tumblr: {
    consumerKey: process.env.TUMBLR_KEY || 'Your Consumer Key',
    consumerSecret: process.env.TUMBLR_SECRET || 'Your Consumer Secret',
    callbackURL: '/auth/tumblr/callback'
  },

  foursquare: {
    clientId: process.env.FOURSQUARE_ID || 'Your Client ID',
    clientSecret: process.env.FOURSQUARE_SECRET || 'Your Client Secret',
    redirectUrl: process.env.FOURSQUARE_REDIRECT_URL || 'http://localhost:3000/auth/foursquare/callback'
  },

  venmo: {
    clientId: process.env.VENMO_ID || 'Your Venmo Client ID',
    clientSecret: process.env.VENMO_SECRET || 'Your Venmo Client Secret',
    redirectUrl: process.env.VENMO_REDIRECT_URL || 'http://localhost:3000/auth/venmo/callback'
  },

  paypal: {
    host: process.env.PAYPAL_HOST || 'api.sandbox.paypal.com',
    client_id: process.env.PAYPAL_ID || 'Your Client ID',
    client_secret: process.env.PAYPAL_SECRET || 'Your Client Secret',
    returnUrl: process.env.PAYPAL_RETURN_URL || 'http://localhost:3000/api/paypal/success',
    cancelUrl: process.env.PAYPAL_CANCEL_URL || 'http://localhost:3000/api/paypal/cancel'
  }
};
