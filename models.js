'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);

const IssueSchema = mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: false},
    created_at: {type: Date, Default: Date.now},
    category: {type: String, required: false},
    due_date: {type: Date, required: true},
    open: {type: Boolean, required: true},
    follow_up: [{
        comment: String,
        date: Date,
        contributor: {type: mongoose.SchemaTypes.ObjectId, ref: 'ContributorModel'}
    }],
    contributors: [{
        username: {type: mongoose.SchemaTypes.ObjectId, ref: 'ContributorModel'}
    }]

});

IssueSchema.virtual('status_virtual').get(function(){
    let due = (this.due_date)
    let due1 = due.split('T')[0];
    let todayDate = new Date();
    let today = todayDate.split('T')[0];

    // let date_diff_in_days = ((new Date(this.due_date)) - (new Date())) / (24 * 3500 * 1000);
    let date_diff_in_days = (due_date - today ) / (24 * 3500 * 1000);

    if(date_diff_in_days > 0)
        return `Pending`
    else if (date_diff_in_days < 0)
        return `Overdue`
    else return `Due`
})

IssueSchema.methods.serialize = function(){
    return {
        id: this._id,
        title: this.title,
        description: this.description,
        created: this.created_at,
        status: this.status_virtual,
        category: this.category,
        due: this.due_date,
        follow_up: this.follow_up,
        contributors: this.contributors
    }
}


const ContributorSchema = mongoose.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    username: {type: String, required: true, index: {unique: true}}
})

ContributorSchema.methods.serialize = function(){
    return {
        id: this._id,
        first: this.firstName,
        last: this.lastName,
        username: this.username
    }
}

const CategorySchema = mongoose.Schema({
    category: {type: String, required : true}
})

const IssueModel = mongoose.model('Issue',IssueSchema);
const ContributorModel = mongoose.model('Contributor',ContributorSchema);
const CategoryModel = mongoose.model('Category',CategorySchema);

module.exports = {IssueModel,ContributorModel,CategoryModel};

