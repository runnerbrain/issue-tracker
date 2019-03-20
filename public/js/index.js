const mock_data  = [
    {
        title: "My first issue",
        Description: "First issue description nothing to see here abc def gh",
        created: "2019-03-11",
        status: "pending"
    },
    {
        title: "My second issue",
        Description: "Second issue description nothing to see here abc def gh",
        created: "2019-03-11",
        status: "pending"
    },
    {
        title: "My third issue",
        Description: "Third issue description nothing to see here abc def gh",
        created: "2019-03-11",
        status: "closed"
    }
]


function getAndDisplayAllIssues(cb){
    setTimeout(function(){
        cb(mock_data);
    },100)
}

function displayIssues(data){

    data.forEach(element => {
        
        // $('.test-display').append(element.title);
    });
}

$(function(){
    getAndDisplayAllIssues(displayIssues);
})