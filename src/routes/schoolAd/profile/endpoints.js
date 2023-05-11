'use strict';
/**
 * ## Imports
 *
 */
//Handle the endpoints
var Handlers = require('./handlers'),
  internals = {};

internals.endpoints = [
  {
    method: ['GET'],
    path: '/schoolAd/profile',
    handler: Handlers.profile,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['schoolAd']
      },
    },
  },
  {
    method: ['POST'],
    path: '/schoolAd/profile/update',
    handler: Handlers.update,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['schoolAd']
      },
      description: 'schoolAdmin update profile',
      tags: ['api'],
      payload: {
        maxBytes: 20000000,
      },
    },
  },
]

module.exports = internals;
