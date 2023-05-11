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
    path: '/admin/hidden',
    handler: Handlers.hidden,
    config: {
      auth: {
        strategy: "standard",
        scope: ["admin"],
      },
    },
  },
  {
    method: ['POST'],
    path: '/admin/hidden',
    handler: Handlers.addhidden,
    config: {
      auth: {
        strategy: "standard",
        scope: ["admin"],
      },
    },
  },
]

module.exports = internals;