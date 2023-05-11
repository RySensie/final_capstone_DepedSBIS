'use strict';

const  Schools = require('../../../database/models/school');
const  Buildings = require('../../../database/models/building');
const  Rooms = require('../../../database/models/room');
const Students = require("../../../database/models/student");
const Facilities = require("../../../database/models/facility");
const SchoolWSF = require("../../../database/models/standAWateASanitation");
const BuildingWSF = require("../../../database/models/buildingWSF");
const Makeshift = require("../../../database/models/makeshift");
const  Temporary = require("../../../database/models/temporary");
const Furnitures = require("../../../database/models/furniture");
const Users = require('../../../database/models/users');
const Stand = require('../../../database/models/standAWateASanitation');
const Access = require('../../../database/models/access');
const Request = require("../../../database/models/request");
var internals = {};

var Async = require('async');
var Mongoose = require('mongoose');

// internals.adminSchool = (req, reply) => {
//   reply.view('admin/schools/school.html');
// };
internals.adminSchool = async function (req, reply) {

  var schools_data = {};

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
        ]}
      ]
    }).populate('school_id').populate('building_id')
      .lean();
  const users = await Users.find({
        isConfirm: false
      }).lean();
  
  const request = await Request.find({
    $or: [
      {status: "REQUESTED"},
      {status: "VERIFIED"},
    ],
  }).populate('school_id')
  .lean();
  let number_notication = room_damage.length + building_damage.length + users.length + request.length ;
  Async.series([
    // function (callback) {
    //   Users.find({
    //     scope: ['schoolAd']

    //   })
    //   .populate('school_id')
    //     .lean()
    //     .exec((err, data) => {
    //       users = data;
    //       if (err) {
    //         console.log(err)
    //       }
    //       console.log("uuserseeeeeeeeeesssss", users);
          
    //       return callback(null);
    //     })
    // },
    function (callback) {
      Users.find({ 
        scope:['schoolAd']
      })
      .populate('school_id')
        .lean()
        .exec((err, data) => {
          schools_data = data;
          if (err) {
            console.log(err)
          }
          return callback(null);
        })
    },
   
  ],
    function (callback) {
      // console.log(schools_data)
      reply.view('admin/schools/school.html', {
        schools_data,
        building_damage,
        room_damage,
        users,
        number_notication,
        credentials: req.auth.credentials
      });
    }
  )


};
//---------------------------------- DISPLAY SCHOOL DETAILS
internals.adminSchoolDt = async (req, reply) => {
  try {
  //  console.log('-->', _id);
    const { id } = req.params;
    var school_id = req.params.id;
    var list = {};
    list.minor = 0;
    list.major = 0;
    list.good = 0;
    const school = await Schools.findOne({ _id : req.params.id}).lean()

    const building_list = await Buildings.find({ school_id : school_id }).sort({' buildingNumber': 1}).lean()

    const minor  = await Buildings.count({ $and: [{school_id : school_id }, {buildingCondition: 'MINOR DAMAGE'}]}).lean()
    list.minor =minor;
    const major  = await Buildings.count({ $and: [{school_id : school_id }, {buildingCondition: 'MAJOR DAMAGE'}]}).lean()
    list.major =major;
    const good  = await Buildings.count({ $and: [{school_id : school_id }, {buildingCondition: 'GOOD CONDITION'}]}).lean()
    list.good =good;
    console.log('list', list);

    const building_damage_req = await Buildings.find({
      $or:[
        {$and: [
          {school_id : school_id },
          {buildingCondition: "MAJOR DAMAGE"},
          { $or: [{status: "REQUESTED"}, {status: "VERIFIED"}]},
          {isDeleted:false}
        ]},
        {$and: [
          {school_id : school_id },
          {buildingCondition: "MINOR DAMAGE"},
          { $or: [{status: "REQUESTED"}, {status: "VERIFIED"}]},
          {isDeleted:false}
        ]}
      ]
    }).populate('school_id')
      .lean();
      const rooms_damage_req = await Rooms.find({
        $or:[
          {$and: [
            {school_id : school_id },
            {roomCondition: "MAJOR DAMAGE"},
            { $or: [{status: "REQUESTED"}, {status: "VERIFIED"}]},
            {isDeleted:false}
          ]},
          {$and: [
            {school_id : school_id },
            {roomCondition: "MINOR DAMAGE"},
            { $or: [{status: "REQUESTED"}, {status: "VERIFIED"}]},
            {isDeleted:false}
          ]}
        ]
      }).populate('building_id')
        .lean();

    console.log('building_damage_req', rooms_damage_req);
    const schools = await Schools.aggregate([
      {$match:{ _id: Mongoose.Types.ObjectId(req.params.id) }},
      {
          $lookup:
          {
              from: "buildings",
              localField: "_id",
              foreignField: "school_id",
              as: "totalBuild",
          } ,
      },
      {
        $lookup:
          {
              from: "rooms",
              localField: "_id",
              foreignField: "school_id",
              as: "totalRoom",
          } ,
      },
      {
        $lookup:
          {
              from: "students",
              localField: "_id",
              foreignField: "school_id",
              as: "totalStudent",
          } ,
      },
      {
        $lookup:
          {
              from: "facilty",
              localField: "_id",
              foreignField: "school_id",
              as: "totalFacility",
          } ,
      },
  ]);
  const facility = await Facilities.aggregate(
    [ {$match:{ school_id: Mongoose.Types.ObjectId(req.params.id),
      isDeleted: false}},
      {
        $lookup:
          {
              from: "building",
              localField: "_id",
              foreignField: "schoo_id",
              as: "totalBuild",
          } ,
      },
    ]);
  const furniture = await Furnitures.aggregate(
      [ {$match:{ school_id: Mongoose.Types.ObjectId(req.params.id),
                  isDeleted: false}},
        {
          $lookup:
            {
                from: "building",
                localField: "_id",
                foreignField: "schoo_id",
                as: "totalBuild",
            } ,
        },
      ]);
  const schoolwsf = await SchoolWSF.aggregate(
      [ {$match:{ school_id: Mongoose.Types.ObjectId(req.params.id),
                    isDeleted: false}},
          {
            $lookup:
              {
                  from: "building",
                  localField: "_id",
                  foreignField: "schoo_id",
                  as: "totalBuild",
              } ,
          },
    ]);
  const building = await Buildings.aggregate(
    [ {$match:{ school_id: Mongoose.Types.ObjectId(req.params.id),
                isDeleted: false}},
      {
        $lookup:
          {
              from: "buildingswsf",
              localField: "_id",
              foreignField: "building_id",
              as: "totalwsf",
          } ,
      },
    ]);
  const students = await Students.aggregate(
    [ {$match:{ school_id: Mongoose.Types.ObjectId(req.params.id),
                isDeleted: false}},
      {
        $group: {
          _id: "_id",
          totalStudent: {
            $sum: "$total"
          }
        }
      }
    ]
 );
 const makeshift = await Makeshift.aggregate(
  [ {$match:{ school_id: Mongoose.Types.ObjectId(req.params.id),
              isDeleted: false}},
    {
      $group: {
        _id: "_id",
        useMakeshift: {
          $sum: { $divide: [ "$useMakeshift", 2 ] }
        }
      }
    }
  ]
);
const temporary = await Temporary.aggregate(
[ {$match:{ 
  $and: [{school_id: Mongoose.Types.ObjectId(req.params.id)},
            {isDeleted: false}
  ]  
  }
},
  {
    $group: {
      _id: "_id",
      useTemporary: {
        $sum: "$usetemporary"
      }
    }
  }
]
);
// -----------------//
// notification
// ---------------//
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
      ]}
    ]
  }).populate('school_id').populate('building_id')
    .lean();
const users = await Users.find({
      isConfirm: false
    }).lean();

const request = await Request.find({
  $or: [
    {status: "REQUESTED"},
    {status: "VERIFIED"},
  ],
}).populate('school_id')
.lean();
let number_notication = room_damage.length + building_damage.length + users.length + request.length ;
const allSchools = await Schools.find({
  _id: req.params.id,
}).lean();
const allRoom = await Rooms.find({
  school_id: req.params.id,
  isDeleted: false
}).populate('building_id')
  .lean();
const allBWSF = await BuildingWSF.find({
    school_id: req.params.id,
    isDeleted: false
}).populate('building_id')
    .lean();
const allMakeshift = await Makeshift.find({
    school_id: req.params.id,
    isDeleted: false
  }).lean();
const allTemporary = await Temporary.find({
      school_id: req.params.id,
      isDeleted: false
  }).lean();
const allSWSF = await Stand.find({
    school_id: req.params.id,
    isDeleted: false
}).lean();
const student = await Students.find({
  school_id: req.params.id,
  isDeleted: false
}).lean();
const access = await Access.find({
  school_id: req.params.id,
  isDeleted: false
}).lean();
  console.log('school----->', school);
  const all = schools.map(data => ({...data, totalBuild: data.totalBuild.length, totalRoom: data.totalRoom.length,
                    totalStudent: data.totalStudent.length}))
  const total = makeshift[0]?.useMakeshift + temporary[0]?.useTemporary
  
  reply.view('admin/schools/schooldetails.html', {
    schools: all,
    facility,
    furniture,
    schoolwsf,
    building,
    totalBuild: all.reduce((acc, curr) => acc += curr.totalBuild, 0),
    totalRoom: all.reduce((acc, curr) => acc += curr.totalRoom, 0),
    totalStudent: all.reduce((acc, curr) => acc += curr.totalStudent, 0),
    students:students[0],
    makeshift:makeshift[0],
    temporary:temporary[0],
    total: isNaN(total) ? 0: total,
    allRoom,
    allMakeshift,
    allTemporary,
    allSchools,
    allBWSF,
    allSWSF,
    student,
    access,
    building_damage,
    room_damage,
    users,
    request,
    credentials: req.auth.credentials,
    school,
    building_list,
    list,
    building_damage_req,
    rooms_damage_req,
    number_notication
  });


  }catch (err) {
    console.log(err)
    reply.redirect("/admin/school/details/" + req.params.id);
  }
};
module.exports = internals;
