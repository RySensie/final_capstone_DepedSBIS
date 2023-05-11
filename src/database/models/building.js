"use strict";
/**
 * ## Imports
 *
 */
//Mongoose - the ORM
const Mongoose = require("mongoose"),
  ObjectId = Mongoose.Schema.Types.ObjectId,
  Schema = Mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");

const buildingSchema = new Mongoose.Schema(
  {
    school_id: { type: ObjectId, ref: "schools" },
    user_id: { type: ObjectId, ref: "users" },
    buildingNumber: { type: String },
    buildingType: { type: String },
    fundSource: { type: String },
    specificFundSource: { type: String },
    buildingCondition: { type: String },
    numberOfStorey: { type: Number },
    numberOfRooms: { type: Number },
    yearCompleted: { type: String },
    classificationOfBuilding: { type: String },
    pwdAccessible: { type: String },
    undergoneMajorRepair: { type: String },
    certificateOfAcceptance: { type: String },
    includeDepedBook: { type: String },
    buildingMaterial: { type: String },
    dateAcquisition: { type: String },
    acquisitionCost: { type: Number },
    bookValue: { type: String },
    insuranceInfo: { type: String },
    actual_img: { type: String },
    blueprint_img: { type: String },
    proof_img: { type: String },
    isDeleted: { type: Boolean, default: false },
    status: { type: String, default: "UNREQUESTED" },
    note: { type: String },
    percentage: { type: Number, default: 0 },

    paint: { type: String, default: "NONE" },

    roof: { type: String, default: "NONE" },
    roof_lvl_dmg: { type: Number },
    roof_description: { type: String },
    roof_img: { type: String },

    wall: { type: String, default: "NONE" },
    wall_lvl_dmg: { type: Number },
    wall_description: { type: String },
    wall_img: { type: String },

    ceiling: { type: String, default: "NONE" },
    ceiling_lvl_dmg: { type: Number },
    ceiling_description: { type: String },
    ceiling_img: { type: String },

    crack: { type: String, default: "NONE" },

    stair: { type: String, default: "NONE" },
    stair_lvl_dmg: { type: Number },
    stair_description: { type: String },
    stair_img: { type: String },

    column: { type: String, default: "NONE" },
    column_lvl_dmg: { type: Number },
    column_description: { type: String },
    column_img: { type: String },

    etc: { type: String, default: "NONE" },
    etc_lvl_dmg: { type: Number },
    etc_description: { type: String },
    etc_img: { type: String },

    description: { type: String, required: false },
    requestedAt : {type: Date,  required: false},
    approved_by: { type: ObjectId, ref: "users", required: false },
  },
  {
    timestamps: true,
    _id: true,
  }
);

var Buildings = Mongoose.model("buildings", buildingSchema);

module.exports = Buildings;
