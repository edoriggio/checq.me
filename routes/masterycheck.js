const express = require("express");
const router = express.Router();
const {
  ensureAuthenticated,
  ensureProfessor,
  ensureProfOrTA
} = require("../config/auth");
const path = require("path");

const MasteryCheck = require("../models/MasteryCheck");
const Classroom = require("../models/Classroom");
const User = require("../models/User");
const Topic = require("../models/Topic");

module.exports = router;

/*
PROFESSOR ROUTES
*/
router.post("/", ensureAuthenticated, ensureProfOrTA, (req, res) => {
  if (!req.body.name || !req.body.description) {
    res.status(400);
  }
  const mc = new MasteryCheck({
    name: req.body.name,
    description: req.body.description,
    available: req.body.available,
    classroom: req.body.classroom,
    author: req.user._id,
  });
  mc.save().then(mastery => {
    Classroom.findById(req.body.classroom).then(classroom => {
      classroom.mastery_checks.addToSet(mastery._id);
      classroom.save().then(() => res.status(200).end());
    })
      .catch((err) => {
        console.log(err);
        res.status(400).end();
      })
  })
    .catch((err) => {
      console.log(err);
      res.status(400).end();
    })
});

router.delete("/", ensureAuthenticated, ensureProfOrTA, (req, res) => {
  MasteryCheck.deleteOne({ _id: req.query.mastery_id })
    .then(() => {
      res.status(200).end();
    })
    .catch((err) => console.log(err));
});

// GET mastery check list of the classroom
router.get("/", ensureAuthenticated, ensureProfOrTA, (req, res) => {
  MasteryCheck.find({ classroom: req.query.classroom_id })
    .populate("topics")
    .then((result) =>
      res.json(result)
    );
});
