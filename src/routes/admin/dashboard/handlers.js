'use strict';

const moment = require("moment");

const Buildings = require("../../../database/models/building");
const Facilities = require("../../../database/models/facility");
const Students = require("../../../database/models/student");
const Rooms = require("../../../database/models/room");
const Temporary = require("../../../database/models/temporary");
const Makeshift = require("../../../database/models/makeshift");
const Request = require("../../../database/models/request");
const Mongoose = require('mongoose');
const Schools = require('../../../database/models/school');
const Users = require('../../../database/models/users');
var internals = {};
var Async = require('async');

internals.adminDashboard = async (req, reply) => {
  try {
    console.log('req.query', req.query);
    let date_from;
    let date_to;
    let date_label;
    let date_label_visible = false; 
    let condition = {};

    if (req.query.daterange) {
      let split = req.query.daterange.split("-");
      date_from = new Date(split[0]);
      date_to = new Date(split[1]);
      date_label_visible = true;
      date_label = `${moment(date_from).format("lll")} to ${moment(
        date_to
      ).format("lll")}`;
  
      console.log("date_from", date_from);
      console.log("date_to", date_to);
      console.log("date_label", date_label);
  
      condition = {
        requestedAt: { $gte: date_from, $lte: date_to },
      };
    }
    // console.log('-->', req.auth.credentials);
    const school_id = req.auth.credentials.school_id;
    const totalBuilding = await Buildings.countDocuments({school_id});
    const totalRoom = await Rooms.countDocuments({school_id});
    const all = await Schools.aggregate([
      {

          $lookup:
          {
              from: "buildings",
              localField: "_id",
              foreignField: "school_id",
              as: "totalBuild",
          }
          
      },
      {
          $lookup:
          {
              from: "rooms",
              localField: "_id",
              foreignField: "school_id",
              as: "totalRoom",
          } 
      },
      {
          $lookup:
          {
              from: "facilities",
              localField: "_id",
              foreignField: "school_id",
              as: "totalFa",
          } 
      },
      {
        $lookup:
        {
            from: "furnitures",
            localField: "_id",
            foreignField: "school_id",
            as: "totalFur",
        } 
    },
    {
      $lookup:
      {
          from: "users",
          localField: "_id",
          foreignField: "school_id",
          as: "totalUsers",
      } 
  },
  {
    $lookup:
    {
        from: "buildingswsf",
        localField: "_id",
        foreignField: "school_id",
        as: "totalbwsf",
    } 
},
{
  $lookup:
  {
      from: "schoolsWSF",
      localField: "_id",
      foreignField: "school_id",
      as: "totalSbwsf",
  } 
},
//   {
//     $lookup:
//     {
//         from: "temps",
//         localField: "_id",
//         foreignField: "school_id",
//         as: "totalTemp",
//     } 
// },
    // {
    //   $group: {
    //     _id: "_id",
    //     temps: {
    //       $sum: "$temporary"
    //     }
    //   }
    // }
  ])
  
  // console.log('resssssssss', all);
  const p = all.map(data => ({...data, 
                  total_rooms: data.totalRoom.length,
                  total_buildings: data.totalBuild.length,
                  total_facilities: data.totalFa.length,
                  total_furniture: data.totalFur.length,
                  total_users: data.totalUsers.length,
                  total_bwsf: data.totalbwsf.length,
                  total_sbwsf: data.totalSbwsf.length }));
  
  const building_damage = await Buildings.find({
    $or:[
      {$and: [
        { $and:[{buildingCondition: "MAJOR DAMAGE"}, condition]},
        { $or: [{status: "REQUESTED"}, {status: "PROCESS"} ]},
        {isDeleted:false}
      ]},
      {$and: [
        {$and:[{buildingCondition: "MINOR DAMAGE"}, condition]},
        { $or: [{status: "REQUESTED"}, {status: "PROCESS"} ]},
        {isDeleted:false}
      ]}
    ]
  }).populate('school_id')
    .lean();
  console.log('building_damage',building_damage);
  const room_damage = await Rooms.find({
      $or:[
        {$and: [
          { $and:[{roomCondition: "MAJOR DAMAGE"}, condition]},
          { $or: [{status: "REQUESTED"}, {status: "PROCESS"} ]},
          {isDeleted:false}
        ]},
        {$and: [
          {$and:[{roomCondition: "MINOR DAMAGE"}, condition]},
          { $or: [{status: "REQUESTED"}, {status: "PROCESS"} ]},
          {isDeleted:false}
        ]},
      ]
    }).populate('school_id').populate('building_id')
      .lean();
  const users = await Users.find({
        isConfirm: false
      }).lean();
  
  const request = await Request.find({
    $and: [
      {status: "REQUESTED"}, condition
    ],
  }).populate('school_id')
  .lean();

  let number_notication = room_damage.length + building_damage.length + users.length + request.length ;

      // console.log('TEST', request);
  reply.view('admin/dashboard/dashboard.html', {
    all: p,
    totalBuilding,
    total_room: p.reduce((acc, curr) => acc += curr.total_rooms, 0),
    total_building: p.reduce((acc, curr) => acc += curr.total_buildings, 0),
    total_furniture: p.reduce((acc, curr) => acc += curr.total_furniture, 0),
    total_users: p.reduce((acc, curr) => acc += curr.total_users, 0),
    total_bwsf: p.reduce((acc, curr) => acc += curr.total_bwsf, 0),
    total_sbwsf: p.reduce((acc, curr) => acc += curr.total_sbwsf, 0),
    total_school: all.length,
    building_damage,
    room_damage,
    request,
    users,
    number_notication,
    date_label_visible,
    date_label
  });


  }catch (error) {
    console.log(error)
    reply.redirect("/admin/dashboard?message=Internal error! &alert=error");
  }
};

internals.reqBuilding = function (req, reply) {
  Buildings.findOneAndUpdate(
    { _id: req.payload.id },
    { $set: {status: 'VERIFIED'} }
  ).exec((err, data) => {
    if (err) {
      console.log(err);
    }
    return reply.redirect('/admin/dashboard?message=successfuly VERIFIED&alert=success');
  });
};
internals.processBuild = function (req, reply) {
  console.log('req.payload', req.payload);
  Buildings.findOneAndUpdate(
    { _id: req.payload.id },
    { $set: {status: 'PROCESS'} }
  ).exec((err, data) => {
    if (err) {
      console.log(err);
    }
    return reply.redirect('/admin/dashboard?message=successfuly PROCESS&alert=success');
  });
};
internals.reqRoom = function (req, reply) {
  Rooms.findOneAndUpdate(
    { _id: req.payload.id1 },
    { $set: {status: 'VERIFIED'} }
  ).exec((err, data) => {
    if (err) {
      console.log(err);
    }
    return reply.redirect('/admin/dashboard?message=successfuly VERIFIED&alert=success');
  });
};
internals.processRoom = function (req, reply) {
  console.log('req.payload', req.payload);
  Rooms.findOneAndUpdate(
    { _id: req.payload._id },
    { $set: {status: 'PROCESS'} }
  ).exec((err, data) => {
    if (err) {
      console.log(err);
    }
    return reply.redirect('/admin/dashboard?message=successfuly PROCESS&alert=success');
  });
};
internals.reqOther = function (req, reply) {
  Request.findOneAndUpdate(
    { _id: req.payload.id3},
    { $set: {status: 'VERIFIED'} }
  ).exec((err, data) => {
    if (err) {
      console.log(err);
    }
    console.log(data);
    return reply.redirect('/admin/dashboard?message=successfuly VERIFIED&alert=success');
  });
};
module.exports = internals;
