const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const moment = require('moment');


const {
    DATABASE_URL,
    PORT
} = require('./config');

const {
    ContributorModel,
    CategoryModel,
    IssueModel
} = require('./models');

const app = express();
const router = express.Router();

app.use(express.static('public'));

app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json());


app.get('/issues', (req, res) => {
    let _sortcreated = '-1';
    let query_sort = {created_at: _sortcreated};

    IssueModel
        .find()
        .sort(query_sort)
        .then(issues => {
            res.json(issues.map(issue => issue.serialize()));
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: 'Something is wrong'
            });
        });
});

app.get('/issues/:issue_id', (req, res) => {
    let _issue_id = req.params.issue_id;

    IssueModel
        .findById(_issue_id)
        .populate('contrbiutors')
        .then(issue => {
            res.json(issue);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send({
                error: 'Something went wrong in the /issues/:issue_id/comments endpoint'
            })
        })
});

app.get('/issues/:issue_id/comments', (req, res) => {
    let _issue_id = req.params.issue_id;
   
    IssueModel
        .findById(_issue_id, {
            '_id': 0,
            'follow_up': 1
        }, {
            _id: 0,
            follow_up: 1
        }, null, {
            sort: {
                "follow_up.created_at": 1
            }
        })
        .then(issues => {
            res.json(issues);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send({
                error: 'Something went wrong in the /issues/:issue_id/comments endpoint'
            })
        })
});


app.get('/issues/filter/:status/:category/:sortcreated', (req, res) => {

    let dt = moment().utcOffset(-4).format('YYYY-MM-DD');

    const _status = req.params.status;
    const _categ = req.params.category || 'all';
    let _sortcreated = req.params.sortcreated || 'desc';
    if(_sortcreated == 'desc') _sortcreated = '-1';
    else _sortcreated = '1';
    let query = {};
    if (_status !== '' && _status !== 'all') {
        var query1;
        switch (_status) {
            case 'due':
                query = {
                    due_date: {
                        '$eq': dt
                    }
                };
                break;
            case 'overdue':
                query = {
                    due_date: {
                        $lt: dt
                    }
                };
                break;
            case 'pending':
                query = {
                    due_date: {
                        '$gt': dt
                    }
                };
            default:
                break;
        }
    }
    if (_categ !== '' && _categ !== 'all') {
        query.category = _categ;
    }

    query_sort = {created_at: _sortcreated};
    IssueModel
        .find(query)
        .sort(query_sort)
        .then(issues => {
            res.json(issues.map(issue => issue.serialize()));
        })
        .catch(err => {
            console.error(err);
            res.status(500).send({
                error: "Something went wrong in the /issues/:status/:catgory endpoint"
            });
        })
});

app.get('/issues/:issue_id/reopen', (req,res) => {
    let issue_id = req.params.issue_id;
    IssueModel
        .findById( issue_id)
        .then(issue => {
            res.json(issue.serialize());
        })
        .catch(err => {
            res.status(500).send({
                error: "Something went wrong with status endpoint."
            })
        })
})


app.get('/contributors', (req, res) => {
    ContributorModel
        .find()
        .then(contributors => {
            res.json(contributors);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send({
                error: "Something went wrong in the /contributors endpoint"
            });
        })

})

app.get('/categories', (req, res) => {
    CategoryModel
        .find({}, {
            _id: 0,
            category: 1
        })
        .then(categories => {
            res.json(categories);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send({
                error: "Something went wrong in the /categories endpoint"
            });
        })
})


app.post('/issues', (req, res) => {
    let _title = req.body.form_issue_title;
    let _description = req.body.form_issue_description;
    let _created_at_now = new Date().toISOString();
    let _category = req.body.form_category;
    let _due_date = req.body.issue_due_date;
    let _lead_contributor = req.body.lead_contributor;

    ContributorModel
        .findById(_lead_contributor)
        .then(contributor => {
            if (contributor) {
                IssueModel
                    .create({
                        title: _title,
                        description: _description,
                        created_at: _created_at_now,
                        category: _category,
                        due_date: _due_date,
                        open: true,
                        lead: _lead_contributor
                    })
                    .then(issue => {
                         res.status(201).json(issue.serialize());
                    })
                    .catch(err => {
                        console.error(err);
                        res.status(500).json({
                            error: 'Something is wrong with the post issues endpoint..'
                        })
                    })
            } else {
                const message = 'Contributor not found';
                console.error(message);
                return res.status(400).send(message);
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: 'Someting is wrong with finding a contributor by Id..'
            });
        })
});

app.post('/issues/:issue_id/comments', (req, res) => {

    let issue_id = req.body.comment_issue_id;
    let _comment = req.body.issue_comment;
    let _created_at_now = moment();
    let _commentObj = {
        comment: _comment,
        created_at: _created_at_now
    }
    IssueModel
        .findByIdAndUpdate(issue_id, {
            $push: {
                follow_up: {
                    $each: [_commentObj],
                    $sort: {
                        created_at: 1
                    }
                }
            }
        })
        .then(issue => {
            res.status(201).send({
                _id: issue_id,
                title: issue.title,
                follow_up: issue.follow_up
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: 'Could not add comment'
            });
        })

});


app.post('/categories', (req, res) => {
    let _category = req.body.category;
    CategoryModel
        .create({
            category: _category
        })
        .then(Category => res.status(201).json({
            category: Category
        }))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: 'Something went wrong with the /category endpoint'
            });
        })
})

app.post('/contributor', (req, res) => {
    let _firstName = req.body.firstName;
    let _lastName = req.body.lastName;
    let _username = req.body.username;
    ContributorModel
        .create({
            firstName: _firstName,
            lastName: _lastName,
            username: _username
        })
        .then(Contributor => res.status(201).json({
            message: 'Added a new contributor'
        }))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: 'Something went wrong with the post /contributors endpoint'
            });
        })
})

app.put('/issues/:issue_id', (req, res) => {

    let issue_id = req.params.issue_id;
    const updated = {};
    updated.title = req.body.form_issue_title;
    updated.description = req.body.form_issue_description;
    updated.category = req.body.form_category;
    updated.due_date = req.body.issue_due_date;
    updated.lead = req.body.lead_contributor;

    IssueModel
        .findByIdAndUpdate(issue_id, {
            $set: updated
        },{new: true})
        .then(updatedIssue => {
            res.status(200).json(updatedIssue.serialize());
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: 'Something went wrong with updating the issue..'
            });
        })
})

app.put('/issues/:issue_id/status/:status', (req, res) => {
    let issue_id = req.params.issue_id;
    let status_request = req.params.status;
    if (status_request == 'closed-issue')
        change_status_to = true;
    else change_status_to = false;

    IssueModel
        .findByIdAndUpdate(issue_id, {
            $set: {
                open: `${change_status_to}`
            }
        })
        .then(issue => {
            res.status(201).json({
                id: issue_id,
                open: `${change_status_to}`
            })
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: 'Something went wrong editing the status'
            });
        })
});


app.delete('/issues/:issue_id', (req, res) => {
    let issue_id = req.params.issue_id;
    IssueModel.findByIdAndDelete(issue_id)
    .then( () => {
        res.status(204).json({message : 'Successfully deleted..'});
    }) 
    .catch(err => {
        console.error(err);
        res.status(500).json({message: 'Something went wrong with deleting a task..'});
    })
});


let server;

function runServer(databaseUrl, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(port, () => {
                    console.log(`Your app is listening on port ${port}`);
                    resolve();
                })
                .on('error', err => {
                    mongoose.disconnect();
                    reject(err);
                });
        });
    });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = {
    app
}