"use strict";

const Buildings = require("../../../database/models/building");
const Rooms = require("../../../database/models/room");
const BCondition = require("../../../database/models/bConditionForm");

var internals = {};
var Sharp = require("sharp");
var Async = require("async");
var upload = require("../../../lib/upload_photo");
var _ = require("lodash");

internals.buildings = function (req, reply) {
  var buildings_data = {};

  // console.log('========>', req.auth.credentials);
  Async.series(
    [
      function (callback) {
        Buildings.find({
          school_id: req.auth.credentials.school_id,
          isDeleted: false,
        })
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log(err);
            }
            buildings_data = data;
            //console.log(data)
            return callback(null);
          });
      },
    ],
    function (callback) {
      reply.view("schoolAd/building/building.html", {
        buildings_data,
        credentials: req.auth.credentials,
      });
    }
  );
};
internals.createAdd = async function (req, reply) {
  reply.view("schoolAd/building/add.html", {
    message: req.query.message,
    alert: req.query.alert,
  });
};

internals.add = async (req, reply) => {
  var payload = {
    school_id: req.auth.credentials.school_id,
    schoolName: req.payload.schoolName,
    buildingNumber: req.payload.buildingNumber,
    buildingType: req.payload.buildingType,
    fundSource: req.payload.fundSource,
    specificFundSource: req.payload.specificFundSource,
    buildingCondition: req.payload.buildingCondition,
    numberOfStorey: req.payload.numberOfStorey,
    numberOfRooms: req.payload.numberOfRooms,
    yearCompleted: req.payload.yearCompleted,
    classificationOfBuilding: req.payload.classificationOfBuilding,
    pwdAccessible: req.payload.pwdAccessible,
    undergoneMajorRepair: req.payload.undergoneMajorRepair,
    certificateOfAcceptance: req.payload.certificateOfAcceptance,
    includeDepedBook: req.payload.includeDepedBook,
    buildingMaterial: req.payload.buildingMaterial,
    dateAcquisition: req.payload.dateAcquisition,
    acquisitionCost: req.payload.acquisitionCost,
    bookValue: req.payload.bookValue,
    insuranceInfo: req.payload.insuranceInfo,
    status: req.payload.status,
  };
  // console.log(payload);
  const building = await Buildings.create(payload);
  if (!building) {
    return reply.redirect(
      "/schoolAd/building?message=Problem occured!&alertType=danger"
    );
  }
  // console.log(building);
  await Buildings.update(
    {
      _id: building._id,
    },
    {
      $set: {
        actual_img: `/assets/uploads/ACTUAL/${building._id}.jpeg`,
        blueprint_img: `/assets/uploads/BLUEPRINT/${building._id}.jpeg`,
        proof_img: `/assets/uploads/PROOF/${building._id}.jpeg`,
      },
    }
  );
  upload.photo(req.payload.actual_img, "ACTUAL", building._id);
  upload.photo(req.payload.blueprint_img, "BLUEPRINT", building._id);
  upload.photo(req.payload.proof_img, "PROOF", building._id);
  return reply.redirect("/schoolAd/building?message=Successfully create building&title=Create Building&alert=success");
};

internals.buildingDetails = async (req, reply) => {
  // console.log('-------->', req.params.id)
  try {
    const { id } = req.params;

    const RoomDamage = await Rooms.find({
      $or: [
        {
          $and: [
            { building_id: id },
            { roomCondition: "MAJOR DAMAGE" },
            { isDeleted: false },
          ],
        },
        {
          $and: [
            { building_id: id },
            { roomCondition: "MINOR DAMAGE" },
            { isDeleted: false },
          ],
        },
      ],
    }).lean();
    const statMajor = await Rooms.countDocuments({
      building_id: id,
      roomCondition: "MAJOR DAMAGE",
      isDeleted: false,
    }).lean();

    const statMinor = await Rooms.countDocuments({
      building_id: id,
      roomCondition: "MINOR DAMAGE",
      isDeleted: false,
    }).lean();

    const allRoom = await Rooms.countDocuments({
      building_id: id,
      isDeleted: false,
    }).lean();

    let statAll = ((statMajor + statMinor) / allRoom) * 40;
    let perall = statAll.toFixed(2);
    console.log("------->>>>>", perall);

    const building = await Buildings.findById(id).lean();
    if (!building) throw new Error("Invalid ID");
    // console.log('IMAGESSSSSSSSSS', building);
    reply.view("schoolAd/building/buildingdetails.html", {
      credentials: req.auth.credentials,
      message: req.query.message,
      alert: req.query.alert,
      building,
      RoomDamage,
      noRoomsWDng: RoomDamage.length,
      perall,
      building_id: req.params.id,
      //:JSON.stringify(building,null,2)
    });
  } catch (err) {
    console.log(err);
    reply.redirect("/schoolAd/building?message=Internal error! &alert=error");
  }
};
//-----------------Edit Building---------------------//
internals.buildingUpdate = async function (req, reply) {
  var payload = {
    school_id: req.auth.credentials.school_id,
    schoolName: req.payload.schoolName,
    buildingNumber: req.payload.buildingNumber,
    buildingType: req.payload.buildingType,
    fundSource: req.payload.fundSource,
    specificFundSource: req.payload.specificFundSource,
    // buildingCondition: req.payload.buildingCondition,
    numberOfStorey: req.payload.numberOfStorey,
    numberOfRooms: req.payload.numberOfRooms,
    yearCompleted: req.payload.yearCompleted,
    classificationOfBuilding: req.payload.classificationOfBuilding,
    pwdAccessible: req.payload.pwdAccessible,
    undergoneMajorRepair: req.payload.undergoneMajorRepair,
    certificateOfAcceptance: req.payload.certificateOfAcceptance,
    includeDepedBook: req.payload.includeDepedBook,
    buildingMaterial: req.payload.buildingMaterial,
    dateAcquisition: req.payload.dateAcquisition,
    acquisitionCost: req.payload.acquisitionCost,
    bookValue: req.payload.bookValue,
    insuranceInfo: req.payload.insuranceInfo,
  };
  // console.log(req.payload.actual_img);
  const building = await Buildings.findOneAndUpdate(
    {
      _id: req.payload.edit_id,
    },
    { $set: payload }
  ).lean();
  // console.log(building);
  if (!building) {
    return reply.redirect(
      "/schoolAd/building?message=Problem occured!&alertType=danger"
    );
  }
  if (!_.isEmpty(req.payload.actual_img)) {
    upload.photo(req.payload.actual_img, "ACTUAL", building._id);
  }

  return reply.redirect(
    "/schoolAd/building?message=successfully updated&alertType=success"
  );
};
//-----------------Condition Update Building---------------------//
internals.conditionUpdate = async function (req, reply) {
  try {
    var payload = {
      school_id: req.auth.credentials.school_id,
      buildingCondition: req.payload.buildingCondition,
      roof: req.payload.roof,
      roof_lvl_dmg: req.payload.roof_lvl_dmg,
      roof_description: req.payload.roof_description,
      ceiling: req.payload.ceiling,
      ceiling_lvl_dmg: req.payload.ceiling_lvl_dmg,
      ceiling_description: req.payload.ceiling_description,
      wall: req.payload.wall,
      wall_lvl_dmg: req.payload.wall_lvl_dmg,
      wall_description: req.payload.wall_description,
      stair: req.payload.stair,
      stair_lvl_dmg: req.payload.stair_lvl_dmg,
      stair_description: req.payload.stair_description,
      column: req.payload.column,
      column_lvl_dmg: req.payload.column_lvl_dmg,
      column_description: req.payload.column_description,
      etc: req.payload.etc,
      etc_lvl_dmg: req.payload.etc_lvl_dmg,
      etc_description: req.payload.etc_description,
      description: req.payload.description,
    };
    console.log("req.payload", req.payload);
    console.log("final paylod", payload);
    const building = await Buildings.findOneAndUpdate(
      {
        _id: req.payload.edit_id,
      },
      { $set: payload }
    ).lean();
    console.log(building);
    if (!building) {
      return reply.redirect(
        `/schoolAd/building/Details/${req.payload.edit_id}`
      );
    }
    await Buildings.updateOne(
      {
        _id: building._id,
      },
      {
        $set: {
          roof_img: `/assets/uploads/ACTUAL/${building._id}.jpeg`,
          roof_img: `/assets/uploads/ROOF_DMG/${building._id}.jpeg`,
          wall_img: `/assets/uploads/WALL_DMG/${building._id}.jpeg`,
          ceiling_img: `/assets/uploads/CEILING_DMG/${building._id}.jpeg`,
          stair_img: `/assets/uploads/STAIR_DMG/${building._id}.jpeg`,
          column_img: `/assets/uploads/COLUMN_DMG/${building._id}.jpeg`,
          etc_img: `/assets/uploads/ETC_DMG/${building._id}.jpeg`,
        },
      }
    );
    // upload.photo(req.payload.actual_img, "ACTUAL", building._id);
    // upload.photo(req.payload.ceiling_img, "CEILING_DMG", building._id);
    // upload.photo(req.payload.column_img, "COLUMN_DMG", building._id);
    // upload.photo(req.payload.roof_img, "ROOF_DMG", building._id);
    // upload.photo(req.payload.stair_img, "STAIR_DMG", building._id);
    // upload.photo(req.payload.wall_img, "WALL_DMG", building._id);
    // upload.photo(req.payload.etc_img, "ETC_DMG", building._id);
    if (!_.isEmpty(req.payload.actual_img)) {
      upload.photo(req.payload.actual_img, "ACTUAL", building._id);
    }
    if (!_.isEmpty(req.payload.ceiling_img)) {
      upload.photo(req.payload.ceiling_img, "CEILING_DMG", building._id);
    }
    if (!_.isEmpty(req.payload.column_img)) {
      upload.photo(req.payload.column_img, "COLUMN_DMG", building._id);
    }
    if (!_.isEmpty(req.payload.roof_img)) {
      upload.photo(req.payload.roof_img, "ROOF_DMG", building._id);
    }
    if (!_.isEmpty(req.payload.stair_img)) {
      upload.photo(req.payload.stair_img, "STAIR_DMG", building._id);
    }
    if (!_.isEmpty(req.payload.wall_img)) {
      upload.photo(req.payload.wall_img, "WALL_DMG", building._id);
    }
    if (!_.isEmpty(req.payload.etc_img)) {
      upload.photo(req.payload.etc_img, "ETC_DMG", building._id);
    }

    return reply.redirect(
      `/schoolAd/building/Details/${req.payload.building_id}?error`
    );
  } catch (error) {
    console.log("error", error);
  }
};
//------------------Delete building-----------------//
// internals.buildingDelete = function (req, reply) {

//   Buildings.findOneAndUpdate(
//     { _id: req.payload.id },
//     { $set: {isDeleted:true} }
//   ).exec((err, data) => {
//     if (err) {
//       console.log(err);
//     }
//     return reply.redirect('/schoolAd/building?message=Internal error! &alert=error');
//   });
// };
module.exports = internals;
