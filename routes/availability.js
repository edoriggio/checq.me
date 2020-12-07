const express = require('express');
const moment = require('moment');
require('twix');
const router = express.Router();
const {
  ensureAuthenticated,
  ensureProfessorUser,
  ensureStudent,
  ensureProfOrTAUser,
} = require('../config/auth');

const User = require('../models/User');
const Availability = require('../models/Availability');
const { twix } = require('moment');

module.exports = router;

//get availability for the current user
router.get('/', ensureAuthenticated, ensureProfOrTAUser, (req, res) => {
  Availability.findOne({ _userId: req.user._id })
    .select({ busy: 1, _id: 1, _userId: 1 })
    .then((r) => {
      res.json(r);
    })
    .catch((err) => {
      console.log(err);
      res.status(400);
    });
});

router.post('/', ensureAuthenticated, ensureProfOrTAUser, (req, res) => {
  //input check
  console.log(req.body);
  let ok = true;
  let new_range;
  let start = moment(req.body.busy[0], 'YYYY-MM-DDTHH:mm:ssZ');
  let end = moment(req.body.busy[1], 'YYYY-MM-DDTHH:mm:ssZ');
  console.log(start);

  let now = moment();
  if (!(start.isValid && end.isValid) || end.diff(now) <= 0 || start.diff(now) <= 0) {
    ok = false;
  } else {
    new_range = start.twix(end);
  }
  if (ok) {
    Availability.findOne({ _userId: req.user._id }).then((avail) => {
      if (avail) {
        for (let i = 0; i < avail.busy.length; i++) {
          let s = moment(avail.busy[i][0]).twix(moment(avail.busy[i][1]));
          if (
            new_range.overlaps(s) ||
            new_range.engulfs(s) ||
            new_range.equals(s) ||
            new_range.contains(s)
          ) {
            res.status(400).end();
            return;
          }
        }
        let test = [[start, end]];
        avail.updateOne({ $addToSet: { busy: { $each: test } } }).then((response) => {
          res.status(200).end();
        });
      } else {
        console.log(
          'Professor: ' +
            req.user._id +
            ' should have an availability document linked to his account!'
        );
        res.status(400).end();
      }
    });
  } else {
    res.status(400);
  }
});
