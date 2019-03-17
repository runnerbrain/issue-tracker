const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('public'));

app.get('/', function(request, response){
    response.sendFile('index.html');
});

app.get('/issues', (request,response) => {
    response.sendFile(path.join(__dirname,'/public','issues.html'));
})

app.get('/issues',(req,res) => {})
app.get('/issues/:due',(req,res)=>{});
app.get('/issues/:category',(req,res)=>{});
app.get('/issues/:due/:category',(req,res)=>{});
app.get('/issues/:issue_id/comments',(req,res)=>{});

app.post('/issues',(req,res)=>{});
app.post('/issues/:issue_id/comments',(req,res)=>{});

app.put('issues/:issue_id',(req,res)=>{});
app.put('/issues/:issue_id/:comment_id',(req,res)=>{});

app.delete('/issues/:issue_id',(req,res)=>{});
app.delete('/issues/:issue_id/:comment_id/',(req,res)=>{})



app.listen(process.env.PORT || 8080);

module.exports = {app};