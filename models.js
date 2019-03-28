'use strict';

const mongoose = require('mongoose');
const moment = require('moment');

moment().format();

mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);


const IssueSchema = mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: false},
    created_at: {type: Date, Default: Date.now},
    category: {type: String, required: false},
    due_date: {type: Date, required: true},
    open: {type: Boolean, required: true, Default: true},
    follow_up: [{
        _id: false,
        comment: String,
        created_at: {type: Date, Default: Date.now}
        // contributor: {type: mongoose.SchemaTypes.ObjectId, ref: 'ContributorModel'}
    }],
    contributors: [{
        username: {type: mongoose.SchemaTypes.ObjectId, ref: 'ContributorModel'}
    }]

});

IssueSchema.virtual('status_virtual').get(function(){
    var today = moment().format('YYYY-MM-DD');
    var due = moment(this.due_date).format('YYYY-MM-DD');;

    if( moment(due).isAfter(today) )
        return `Pending`
    else if ( moment(due).isBefore(today) )
        return `Overdue`
    else if( moment(due).isSame(today))
        return `Due`
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
        open: this.open,
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

