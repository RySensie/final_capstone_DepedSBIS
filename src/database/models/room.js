"use strict";

var Mongoose = require("mongoose"),
  ObjectId = Mongoose.Schema.Types.ObjectId;


const RoomSchema = new Mongoose.Schema(
  {
    school_id: {type: ObjectId, ref: 'schools'},
    user_id: {type: ObjectId, ref: 'users'},
    building_id:{type: ObjectId, ref: 'buildings'},
    roomNumber: {type: Number},
    roomCondition: {type: String},
    actualUsage: {type: String},
    roomDimensionW: {type: Number},
    roomDimensionL: {type: Number},
    floor: {type: Number},
    isDeleted: {type: Boolean, default: false},
    actual_img: {type: String},
    status: {type: String, default: 'UNREQUESTED'},
    note: {type: String},
    percentage: {type: Number, default: 0},

    door: {type: String, default: 'NONE'},
    door_lvl_dmg: { type: Number },
    door_description: { type: String },
    door_img: { type: String },

    window: {type: String, default: 'NONE'},
    window_lvl_dmg: { type: Number },
    window_description: { type: String },
    window_img: { type: String },

    ceiling: {type: String, default: 'NONE'},
    ceiling_lvl_dmg: { type: Number },
    ceiling_description: { type: String },
    ceiling_img: { type: String },

    toilet: {type: String, default: 'NONE'},
    toilet_lvl_dmg: { type: Number },
    toilet_description: { type: String },
    toilet_img: { type: String },

    electric: {type: String, default: 'NONE'},
    electric_lvl_dmg: { type: Number },
    electric_description: { type: String },
    electric_img: { type: String },

    other: {type: String, default: 'NONE'},
    other_lvl_dmg: { type: Number },
    other_description: { type: String },
    other_img: { type: String },

    flooring: {type: String, default: 'uncheck'},
    beam: {type: String, default: 'uncheck'},
    column: {type: String, default: 'uncheck'},
    board: {type: String, default: 'uncheck'},
    wall: {type: String, default: 'uncheck'},
    
    requestedAt : {type: Date,  required: false},
    approved_by: { type: ObjectId, ref: "users", required: false },
    
  },
  {
    timestamps: true,
    _id: true,
  }
);

var Rooms = Mongoose.model("rooms", RoomSchema);

module.exports = Rooms;


