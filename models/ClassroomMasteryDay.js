/**
 * ClassroomMasteryDay schema
 */

const mongoose =  require('mongoose');

const ClassroomMasteryDaySchema = new mongoose.Schema({
    classroom: {
        type: mongoose.Schema.ObjectId,
        ref: 'Classroom',
        required: true
    },
    iso_day_n:{
        type: Number,
        required: true
    },
    start_time:{
        type: Date,
        required: true
    },
    end_time:{
        type: Date,
        required: true
    }
})

const ClassroomMasteryDay = mongoose.model('ClassroomMasteryDay', ClassroomMasteryDaySchema);

module.exports = ClassroomMasteryDay;