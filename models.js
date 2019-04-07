'use strict';

const mongoose = require('mongoose');
const moment = require('moment');

moment().format();

mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);


//Contributor Schema
const ContributorSchema = mongoose.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    username: {type: String, required: true, unique: true}
})

ContributorSchema.methods.serialize = function(){
    return {
        id: this._id,
        first: this.firstName,
        last: this.lastName,
        username: this.username
    }
}

//Category Scheam
const CategorySchema = mongoose.Schema({
    category: {type: String, required : true}
})


//Issue Schema
const IssueSchema = mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: false},
    created_at: {type: Date, Default: Date.now},
    category: {type: String, required: false},
    due_date: {type: String, required: true},
    open: {type: Boolean, required: true, Default: true},
    username: {type: String},
    follow_up: [{
        _id: false,
        comment: String,
        created_at: {type: Date, Default: Date.now}
    }],
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Contributor', required: true},
    contributors:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contributor'}]
    
    

});

IssueSchema.virtual('status_virtual').get(function(){

    var today =moment().utcOffset(-4).format('YYYY-MM-DD');
    var due = moment(this.due_date).utcOffset(-4).format('YYYY-MM-DD');;
    if( moment(due).isAfter(today) )
        return `pending`;
    else if ( moment(due).isBefore(today) )
        return `overdue`;
    else if( moment(due).isSame(today)){
        return `due`;

    }
})


IssueSchema.methods.serialize = function(){
    // console.log(`from Model ${this}`);
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




const ContributorModel = mongoose.model('Contributor',ContributorSchema);
const CategoryModel = mongoose.model('Category',CategorySchema);
const IssueModel = mongoose.model('Issue',IssueSchema);

module.exports = {ContributorModel,CategoryModel,IssueModel};

