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
    path: '/admin/dashboard',
    handler: Handlers.adminDashboard,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['admin']
      },
    },
  },
  {
    method: ['POST'],
    path: '/admin/approved',
    handler: Handlers.reqBuilding,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['admin']
      },
    },
  },
  {
    method: ['POST'],
    path: '/admin/processed',
    handler: Handlers.processBuild,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['admin']
      },
    },
  },
  {
    method: ['POST'],
    path: '/admin/approvedRoom',
    handler: Handlers.reqRoom,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['admin']
      },
    },
  },
  {
    method: ['POST'],
    path: '/admin/processRoom',
    handler: Handlers.processRoom,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['admin']
      },
    },
  },
  {
    method: ['POST'],
    path: '/admin/approvedOther',
    handler: Handlers.reqOther,
    config: {
      auth: {
        strategy: 'standard',
        scope: ['admin']
      },
    },
  },
]

module.exports = internals;