const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');

const {DATABASE_URL, PORT} = require('./config');
const {IssueTracker} = require('./models');

const app = express();
const router = express.Router();

app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json());

app.get('/', function(request, response){
    response.sendFile('index.html');
});


app.get('/issues',(req,res) => {
    IssueTracker
    .find()
    .then(issues => {
        res.json(issues.map(issue => issue.serialize()));
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'Something is wrong'});
    });
});

app.get('/issues/:issue_id/comments',(req,res)=>{
    let _issue_id = req.params.issue_id;
    
    IssueTracker
    .findById(_issue_id,{ '_id': 0, 'follow_up': 1})
    .then(issues => {
        res.json(issues);
    })
    .catch(err => {
        console.error(err);
        res.status(500).send({error: 'Something went wrong in the /issues/:issue_id/comments endpoint'})
    })
});


app.get('/issues/:status/:category',(req,res)=>{
    console.log('are you hitting me');
    const _status = req.params.status;
    const _categ = req.params.category || 'all';
    let query = {};
    if( _status !== '' && _status !== 'all'){
        var query1;
        switch(_status){
            case 'due':
                query = {due_date: {'$eq': new Date()}};
            break;
            case 'overdue':
                query= {due_date: {$lt: new Date()}};
            break;
            case 'pending':
                query = {due_date: {'$gt': new Date()}};
            default:
            break;
        }
    }
    if( _categ !== '' && _categ !== 'all'){
        query.category = _categ;
    }

    IssueTracker
    .find(query)
    .then(issues => {
        res.json(issues.map(issue => issue.serialize()));
    })
    .catch(err => {
        console.error(err);
        res.status(500).send({error: "Something went wrong in the /issues/:status/:catgory endpoint"});
    })
})

// app.get('/issues/:filter',(req,res)=>{
//     const dueArray = ["due","overdue","pending"];
//     const categArray = ["categ1","categ2","categ3"];
//     const _filter = req.params.filter;
    
//     // let currentDate = new Date();
//     let due_param = dueArray.indexOf(_filter);
//     let categ_param = categArray.indexOf(_filter);
//     //console.log(due_param);
//     if(due_param >= 0){
//         let due_filter = _filter;
//         switch (due_filter) {
//             case 'due':
//                 query = {due_date: {'$eq': new Date()}};
//             break;
//             case 'overdue':
//                 query = {due_date: {'$lt': new Date()}};
//             break;
//             case 'pending':
//                 query = {due_date: {'$gt': new Date()}};
//             default:
//                 break;
//         }   
//     }
//     else if(categ_param >= 0){
       
//     }
//     console.log(query);
//     IssueTracker
//     .find(query)
//     .then(issues=> {
//         res.json(issues.map(issue => issue.serialize()));
//     })
//     .catch(err => {
//         console.error(err);
//         res.status(500).json({error: 'Something is wrong'});
//     });
// });



app.post('/issues',(req,res)=>{
    console.log(req.body);
    let _title = req.body.form_issue_title;
    let _due_date = req.body.issue_due_date;
    IssueTracker
    .create({title: _title,due_date: _due_date })
    .then(Issue => res.status(201).json(Issue.serialize()))
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'Someting went wrong in the post /issues endpoint'});
    })
	console.log(req.body);
});

app.post('/issues/:issue_id/comments',(req,res)=>{});

app.put('issues/:issue_id',(req,res)=>{});
app.put('/issues/:issue_id/:comment_id',(req,res)=>{});

app.delete('/issues/:issue_id',(req,res)=>{});
app.delete('/issues/:issue_id/:comment_id/',(req,res)=>{})


let server;

function runServer(databaseUrl, port = PORT){
    return new Promise((resolve,reject) => {
        mongoose.connect(databaseUrl,err => {
            if(err){
                return reject(err);
            }
            server = app.listen(port, () =>{
                console.log(`Your app is listening on port ${port}`);
                resolve();
            })
                .on('error',err => {
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

//app.listen(process.env.PORT || 8080);
if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
  }

module.exports = { app }