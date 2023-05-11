'use strict';


const Users = require("../../../database/models/users");
const Schools = require("../../../database/models/school");

var internals = {},
  Crypto = require('../../../lib/Crypto'),
  Async = require('async');
var   _ = require('lodash');
var Sharp = require('sharp');
var upload  = require('../../../lib/upload_photo');

internals.profile = async function (req, reply) {

  const school_info = await Schools.find({
    _id: req.auth.credentials.school_id
  }).lean();

  let users = await Users.find({
    _id: req.auth.credentials._id
  }).lean();
  users = users.map(r => {
    r.password = Crypto.decrypt(r.password);
    return r;
  })
  console.log('========?>>>>', users);
  return reply.view('schoolAd/profile/profile.html', {
    school_info,
    users,
    credentials: req.auth.credentials,
    message: req.query.message,
    alert: req.query.alert,
  }
  )
};
//Update Facility---------------------Update-----
internals.update = async function (req, reply) {
  console.log('payload', req.payload);

  var payload = {
    firstname: req.payload.firstname,
    lastname: req.payload.lastname,
    email: req.payload.email,
    password: Crypto.encrypt(req.payload.password)
  }
  console.log('update payload', payload);
  const users = await Users.findOneAndUpdate(
    { _id: req.auth.credentials._id },
    { $set: payload });
  if (!users) {
    return reply.redirect('/schoolAd/profile?message=Problem occured!&alertType=danger');
  }
  if (!_.isEmpty(req.payload.profile_img)) {
    upload.photo(req.payload.profile_img, 'PROFILE', users._id);
  }
  return reply.redirect('/schoolAd/profile?message=Successfuly updated&alert=success');
};

module.exports = internals;
