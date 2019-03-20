'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const IssueSchema = mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: false},
    created_at: {type: Date, Default: Date.now},
    category: {type: String, required: false},
    due_date: {type: Date, required: true},
    follow_up: [{
        comment: String,
        date: Date,
        contributor: String
    }],
    contributors: [{
        name: String
    }]

});

IssueSchema.methods.serialize = function(){
    return {
        id: this._id,
        title: this.title,
        description: this.description,
        created: this.created_at,
        category: this.category,
        due: this.due_date,
        follow_up: this.follow_up,
        contributors: this.contributors
    }
}

const IssueTracker = mongoose.model('Issue',IssueSchema);

module.exports = {IssueTracker};
