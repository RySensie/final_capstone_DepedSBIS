'use strict';


const { find } = require('lodash');
const Schools = require('../../../database/models/school');
const Users = require('../../../database/models/users');
const Rooms = require("../../../database/models/room");
const Buildings = require("../../../database/models/building");
const Hidden = require('../../../database/models/hidden');
const Request = require("../../../database/models/request");
var Async = require('async');
const Mongoose = require('mongoose');
var internals = {};

internals.hidden = async function (req, reply) {
  try {

    let school_list = await Hidden.find({}).lean()
    const building_damage = await Buildings.find({
      $or:[
        {$and: [
          {buildingCondition: "MAJOR DAMAGE"},
          {status: "REQUESTED"},
          {isDeleted:false}
        ]},
        {$and: [
          {buildingCondition: "MINOR DAMAGE"},
          {status: "REQUESTED"},
          {isDeleted:false}
        ]}
      ]
    }).populate('school_id')
      .lean();
    const room_damage = await Rooms.find({
        $or:[
          {$and: [
            {roomCondition: "MAJOR DAMAGE"},
            {status: "REQUESTED"},
            {isDeleted:false}
          ]},
          {$and: [
            {roomCondition: "MINOR DAMAGE"},
            {status: "REQUESTED"},
            {isDeleted:false}
          ]},
        ]
      }).populate('school_id').populate('building_id')
        .lean();
    const users = await Users.find({
          isConfirm: false
        }).lean();
    
    const request = await Request.find({
      $or: [
        {status: "REQUESTED"},
      ],
    }).populate('school_id')
    .lean();
  
    let number_notication = room_damage.length + building_damage.length + users.length + request.length ;
    reply.view('admin/hidden/index.html', {
      school_list,
      building_damage,
      room_damage,
      request,
      users,
      number_notication
    });
  } catch (error) {
    console.log('error', error);
    return reply.redirect('/admin/hidden');
  }

};
internals.addhidden = (req, reply) => {
  Async.series([
    (callback) => {
      var payload = {
        schoolName: req.payload.schoolName,
        schoolId: req.payload.schoolId,
        address: req.payload.address,
      }
      console.log('=======> ', payload);
      var saveMe = new Hidden(payload);
      saveMe.save(function (err, data) {
        if (err) {
          console.log(err);
        }
        console.log(data);
        return callback(null);
      });
    },

  ],
    function (callback) {
      return reply.redirect('/admin/hidden');
    })
};
module.exports = internals;
