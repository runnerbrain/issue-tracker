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

app.get('/issues',(request,response) => {
    
})

app.listen(process.env.PORT || 8080);

module.exports = {app};