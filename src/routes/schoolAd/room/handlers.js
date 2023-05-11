"use strict";

const Buildings = require("../../../database/models/building");
const Rooms = require("../../../database/models/room");
const Async = require("async");
var upload = require("../../../lib/upload_photo");
var _ = require("lodash");
var internals = {},
  moment = require("moment");

internals.room = function (req, reply) {
  var rooms_data = {};
  var buildings_data = {};

  Async.series(
    [
      function (callback) {
        Rooms.find({
          building_id: req.params?.building_id,
          isDeleted: false,
        })
          .lean()
          .exec((err, data) => {
            rooms_data = data;
            if (err) {
              console.log(err);
            }
            //console.log(data)
            return callback(null);
          });
      },
      function (callback) {
        Buildings.findOne({
          _id: req.params?.building_id,
          isDeleted: false,
        })
          .lean()
          .exec((err, data) => {
            buildings_data = data;
            if (err) {
              console.log(err);
            }
            //console.log(data)
            return callback(null);
          });
      },
    ],
    function (callback) {
      // console.log('------++++>', buildings_data),
      reply.view("schoolAd/building/room/room.html", {
        rooms_data,
        buildings_data,
        credentials: req.auth.credentials,
        building_id: req.params.building_id,
      });
    }
  );
};

//Edit Rooms---------------------Edit-----//
internals.roomUpdate = async function (req, reply) {
  var payload = {
    roomNumber: req.payload.roomNumber,
    floor: req.payload.floor,
    actualUsage: req.payload.actualUsage,
    roomDimensionW: req.payload.roomDimensionW,
    roomDimensionL: req.payload.roomDimensionL,
  };
  // console.log(req.payload.actual_img);
  const rooms = await Rooms.findOneAndUpdate(
    {
      _id: req.payload.edit_id,
    },
    { $set: payload }
  ).lean();
  // console.log(rooms);
  if (!rooms) {
    return reply.redirect("/schoolAd/room/" + req.params.building_id);
  }
  if (!_.isEmpty(req.payload.actual_img)) {
    upload.photo(req.payload.actual_img, "ROOM", rooms._id);
  }

  return reply.redirect("/schoolAd/room/" + req.params.building_id);
};
//Update Rooms---------------------Update-----//
internals.conditionUpdate = async function (req, reply) {
  console.log('req.payload', req.payload);
  try {
    var payload = {
      roomCondition: req.payload.roomCondition,

      door: req.payload.door,
      door_lvl_dmg: req.payload.door_lvl_dmg,
      door_description : req.payload.door_description,

      window: req.payload.window,
      window_lvl_dmg : req.payload.window_lvl_dmg,
      window_description : req.payload.window_description,

      ceiling: req.payload.ceiling,
      ceiling_lvl_dmg: req.payload.ceiling_lvl_dmg,
      ceiling_description : req.payload.ceiling_description,

      toilet: req.payload.toilet,
      toilet_lvl_dmg: req.payload.toilet_lvl_dmg,
      toilet_description : req.payload.toilet_description,

      electric: req.payload.electric,
      electric_lvl_dmg: req.payload.elc_lvl_dmg,
      electric_description : req.payload.elc_description,

      other: req.payload.other,
      other_lvl_dmg: req.payload.other_lvl_dmg,
      other_description : req.payload.other_description,
    };
    console.log('final', payload);
    const rooms = await Rooms.findOneAndUpdate({
      _id: req.payload.edit_id
    },{$set: payload}).lean();
    console.log(rooms);
    if(!rooms){
      return reply.redirect('/schoolAd/room/' + req.params.building_id);
    }
    await Rooms.updateOne(
      {
        _id: rooms._id,
      },
      {
        $set: {
          door_img: `/assets/uploads/ROOM_DOOR_DMG/${rooms._id}.jpeg`,
          window_img: `/assets/uploads/ROOM_WINDOW_DMG/${rooms._id}.jpeg`,
          ceiling_img: `/assets/uploads/ROOM_CEILING_DMG/${rooms._id}.jpeg`,
          toilet_img: `/assets/uploads/ROOM_TOILET_DMG/${rooms._id}.jpeg`,
          electric_img: `/assets/uploads/ROOM_ELECTRIC_DMG/${rooms._id}.jpeg`,
          other_img: `/assets/uploads/ROOM_OTHER_DMG/${rooms._id}.jpeg`,
        },
      }
    );
    if(!_.isEmpty(req.payload.actual_img)){
      upload.photo(req.payload.actual_img, 'ROOM', rooms._id);
    }
    if(!_.isEmpty(req.payload.door_img)){
      upload.photo(req.payload.door_img, 'ROOM_DOOR_DMG', rooms._id);
    }
    if(!_.isEmpty(req.payload.window_img)){
      upload.photo(req.payload.window_img, 'ROOM_WINDOW_DMG', rooms._id);
    }
    if(!_.isEmpty(req.payload.ceiling_img)){
      upload.photo(req.payload.ceiling_img, 'ROOM_CEILING_DMG', rooms._id);
    }
    if(!_.isEmpty(req.payload.toilet_img)){
      upload.photo(req.payload.toilet_img, 'ROOM_TOILET_DMG', rooms._id);
    }
    if(!_.isEmpty(req.payload.electric_img)){
      upload.photo(req.payload.electric_img, 'ROOM_ELECTRIC_DMG', rooms._id);
    }
    if(!_.isEmpty(req.payload.other_img)){
      upload.photo(req.payload.other_img, 'ROOM_OTHER_DMG', rooms._id);
    }

    return reply.redirect(`/schoolAd/room/${req.payload.building_id}?message:Successfully update room condition&title:Update Condition&type:success`);
  } catch (error) {
    console.log("error", error);
  }
};
// internals.roomUpdate = function (req, reply) {
//   console.log("----->>>>>>", req.params.building_id);

//   Rooms.findOneAndUpdate(
//     { _id: req.payload.edit_id },
//     { $set: req.payload }
//   ).exec((err, data) => {
//     if (err) {
//       console.log(err);
//     }
//     return reply.redirect('/schoolAd/room/' + req.params.building_id);
//   });
// };
//Delete Rooms---------------------Delete-----
internals.roomDelete = function (req, reply) {
  // console.log("----->>>>>>", req.payload.id);

  Rooms.findOneAndUpdate(
    { _id: req.payload.id },
    { $set: { isDeleted: true } }
  ).exec((err, data) => {
    if (err) {
      console.log(err);
    }
    return reply.redirect("/schoolAd/room/" + req.params.building_id);
  });
};
//--------------------------Delete-------------------------------//
// internals.roomDelete = function (req, reply) {
//   var myPayload = {
//     isdeleted: req.payload.isdeleted,

//   }

//   Rooms.updateOne({
//     _id: req.payload._id
//   },
//   {
//    $set: myPayload
//   })

//     .lean()
//     .exec((err, data)=>{
//       if(err){
//         console.log(err);
//       }
//       return reply.redirect('/schoolAd/room/{building_id}');
//     })
// }

internals.roomAdd = async (req, reply) => {
  var payload = {
    school_id: req.auth.credentials.school_id,
    building_id: req.params.building_id,
    roomNumber: req.payload.roomNumber,
    floor: req.payload.floor,
    roomCondition: req.payload.roomCondition,
    actualUsage: req.payload.actualUsage,
    roomDimensionW: req.payload.roomDimensionW,
    roomDimensionL: req.payload.roomDimensionL,
  };
  // console.log(payload);
  const rooms = await Rooms.create(payload);
  if (!rooms) {
    return reply.redirect("/schoolAd/room/" + req.params.building_id);
  }
  // console.log(rooms);
  await Rooms.update(
    {
      _id: rooms._id,
    },
    {
      $set: {
        actual_img: `/assets/uploads/ROOM/${rooms._id}.jpeg`,
      },
    }
  );
  upload.photo(req.payload.actual_img, "ROOM", rooms._id);
  return reply.redirect("/schoolAd/room/" + req.params.building_id);
};
module.exports = internals;
