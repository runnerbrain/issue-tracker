'use strict';


let contributor_num = 0;
const icon_lnk_close = `<i class="fas fa-window-close"></i>`;
const icon_lnk_open = `<i class="fas fa-folder-open"></i>`;
const contributorObjArr = [];

function to_string_date(dt) {
  return dt.split('T')[0];
}

function shortenDescription(desc){
  if (desc.length < 150)
  return desc;
  let short_desc = desc.substring(0,180);
  return short_desc;
}

function generateIssueCard(issue) {
  let created_at_string = to_string_date(issue.created);
  let issue_due_string = to_string_date(issue.due);
  if (issue.open) {
    var status_lnk = 'open-issue';
    var icon_lnk = `${icon_lnk_open}`
  } else {
    var status_lnk = 'closed-issue';
    var icon_lnk = `${icon_lnk_close}`
  }
  let issue_description = issue.description;
  console.log(`1 ${issue.status}`);
  var status_color = '';
  switch(`${issue.status}`){
    case 'overdue':
      status_color = 'overdue-color';
    break;
    case 'pending':
      status_color = 'pending-color';
    break;
    case 'due':
      status_color = 'due-color';
    break;
  }
  let shortDescription = shortenDescription(issue_description);
  if(issue_description.length != shortDescription.length){
    var indexOfSpace = shortDescription.indexOf(" ",150)
    shortDescription = shortDescription.substring(0,152);
    var description_html = `<span class="description-text">${shortDescription} <a href="#" class="edit-issue" id="${issue.id}">...more</a></span>`;
  }
  else
    description_html = `<span class="description-text">${shortDescription}</span>`

  return `
  <div class="issue-card">
  <div class="issue-header">
      <div class="_title">${issue.title}</div>
      <div class="_tools">
          <div class="status-badge ${status_color}"><span>${issue.status}</span></div>
          <div class="tools-icon">
              <div><i class="fas fa-user-friends"></i></div>
              <div><a href="#" class="edit-issue" id="${issue.id}"><i class="fas fa-edit"></i></a></div>
              <div><a href="" class="comment-lnk" id="${issue.id}"><i class="fa fa-comments badge" aria-hidden="true" ></i></a></div>
              <div class="status-icon"><a href="" class="${status_lnk}" id="co_icon_${issue.id}">${icon_lnk}</a></i></div>
          </div>
      </div>
  </div>
  <div class="issue-desc">
    ${description_html}
    </div>
  <div class="issue-dates">
      created : ${created_at_string}, due: ${issue_due_string}
  </div>
</div>
  `
}

// <div class="issues-strip">
      //   <div class="status-info">
      //     <div class="status-text">${issue.status}</div>
      //     <div class="status-area">
      //       <a href="" class="${status_lnk}" id="co_icon_${issue.id}">${icon_lnk}</a>
      //     </div>
      //   </div>
      //   <div class="issue-info">
      //     <div class="issue-title">${issue.title}</div>
      //     <div class="issue-desc">${issue.description}</div>
      //     <div class="issue-dates">created : ${created_at_string}, due: ${issue_due_string}</div>
      //   </div>
      //   <div class="issue-tools">
      //     <div class="edit-icon">
      //       <a href="#" class="edit-issue" id="${issue.id}"><i class="fas fa-edit"></i></a>
      //     </div>
      //     <div class="comment-icon">
      //       <a href="" class="comment-lnk" id="${issue.id}"><i class="fa fa-comments badge" aria-hidden="true" ></i></a>
      //     </div>
      //   </div>
      // </div>

function generateCommentContainer(){
    return `
      <div class="comment-container">
        <div class="comment-text"></div>
      </div>
    `
}

function displayComments(elem){
  if(elem.created_at) {var elem_date = (elem.created_at).split('T')[0];} else elem_date = '';
  let comment_div = generateCommentContainer();
  let comment_text = $(`<div class="comment-text">${elem.comment}</div>`);
  let comment_date = $(`<div class="comment-date">${elem_date}</div>`);
  $(comment_div).append(comment_text).append(comment_date).prependTo('.previous-comments');
}


function displayListOfIssues(issues){
  $('#issueslist').empty();
  issues.forEach(elem => {
    let new_issue = generateIssueCard(elem);
    $("#issueslist").append(new_issue);
  })
}

function displayAllIssuesOnOpen(){
  fetch('/issues')
    .then(response => response.json())
    .then((IssueArr) => {
      displayListOfIssues(IssueArr)
    });
}

function createCategoryPullDowns() {
  let $_form_category = $("#form_category");
  $('#form_category option').remove();
  $_form_category.append(`<option value=''></option>`)
  fetch('/categories')
    .then(response => response.json())
    .then(categoryArr => {
      categoryArr.forEach(elem => {
        let val = elem['category'];
        $_form_category.append(`<option value='${val}'>${val}</option>`);
        $('#category_pd_filter').append(`<option value='${val}'>${val}</option>`);
      })
    })
}
 
function createContributorsPullDowns() {

  let $_lead_contributor = $("#lead_contributor");
  let $_form_contributors = $('#form_contributors');
  $('.form_contributors option').remove();
  $_lead_contributor.append(`<option value = ''></option>`);
  $_form_contributors.append(`<option value = ''></option>`);
  fetch('/contributors')
    .then(response => response.json())
    .then(contributorArr => {
      contributorArr.forEach(elem => {
        contributorObjArr.push(elem);
        let username_val = elem['username'];
        let id_val = elem['_id'];
        $_lead_contributor.append(`<option value=${id_val}>${username_val}</option>`);
        $_form_contributors.append(`<option value=${id_val}>${username_val}</option>`);
      })
    })
}

function fetchContributorsByName(contributor){
  console.log('test driving new func'+contributor);
  var uname = contributorObjArr.find(elem => {
    console.log(elem._id);
    return elem._id === contributor
  })
  return uname;
}

function populateForm(issue){
  $("#contributors-to-add").empty();
  $("#edit_issue_id").val(issue._id);
  $('#form_issue_title').val(issue.title);
  $('#form_issue_description').val(issue.description);
  $('#form_category').val(issue.category);
  let dt = issue.due_date.split('T')[0];
  $("#issue_due_date").val(dt);
  var uname = fetchContributorsByName(issue.lead);
  $('#lead_contributor').val(uname._id);


}

function displaySelectedContributor(contributor){
  // console.log('displaySelectedContributors at work');
  $(`<div class="staged-contributor-div">${contributor}
         <span class="remove-staged-contributor">
            <a href="" class="remove-contributor">
              <i class="fas fa-times"></i>
            </a>
         </span>
     </div>`
    )
    .addClass('staged-contributor-div')
    .appendTo('#contributors-to-add');
    
    let num = $('#contributors-to-add').children('input').length;
    $('#contributors-to-add').append(
      `<input type='hidden' 
          name='contributor_${num}' 
          id='contributor_${num}' 
          value='${contributor}'>`);

}

function addComment() {
  //console.log('adding your comment');
  let data = $("#add-comment").serialize();
  let issue_id = $("#comment_issue_id").val();
  //console.log('addComment -> ' + issue_id);
  $.post(`/issues/${issue_id}/comments`,data);
  fetch(`/issues/${issue_id}/comments`)
  .then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error(response.statusText);
  })
  .then(responseJson => {
    let commentArr = responseJson.follow_up;
    displayComments(responseJson.follow_up[responseJson.follow_up.length -1]);
  })
  .catch(err => {
    console.error(err);
  });
    
  $("#issue_comment").val('');

  }

function addIssue() {

  $('#contributors-to-add').append(
    `<input type='hidden'
      name='contributor_number'
      id='contributor_number'
      value='${contributor_num}'>`)
  let data = $("#issue-add-form").serialize();
  // console.log(data);
  $.post(
    '/issues', data,
    function (data) {
      $('issueslist').prepend(data);
    }
  )
  taskDialog.dialog('close');

}

function editIssue(){
  let edit_data = $("#issue-add-form").serialize();
  let issue_id = $("#edit_issue_id").val();
  console.log(`in editIssue function : ${issue_id}`);
  console.log('in editIssue function: '+edit_data);
  $.ajax({
    url: `/issues/${issue_id}`,
    data: edit_data,
    type: 'PUT',
    success: function (data) {
        console.log('Successful edit'+data);
      }
    })
  }

  //---------------------------------------------------------------------------
  //---------------------------------------------------------------------------

  function handleForm() {

  $("#tabs").tabs();

  const taskDialog = $("#dialog-form-div").dialog({
    autoOpen: false,
    height: 800,
    width: 750,
    modal: true,
    show: {
      effect: "blind",
      duration: 200
    },
    close: function () {
      taskDialog.find('form')[0].reset();
      $('#contributors-to-add').empty();

    },
    hide: {
      effect: "fade",
      duration: 200
    }
  });

  const comment_dialog = $("#dialog-comment-div").dialog({
    autoOpen: false,
    height: 500,
    width: 550,
    modal: true,
    buttons: {
      "Save": addComment
    },
    show: {
      effect: "blind",
      duration: 200
    },
    close: function () {
      $('#contributors-to-add').empty();
    },
    hide: {
      effect: "fade",
      duration: 200
    }
  })

  $("#issue_due_date").datepicker({
    dateFormat: "yy-mm-dd"
  });


  $('#status_pd_filter').change(function(){
    let _status = $(this).val() || 'all';
    console.log(`1 ${_status}`);
    let _category = $('#category_pd_filter').val() || 'all';
    console.log(`2 ${_category}`);
    fetch(`/issues/filter/${_status}/${_category}`)
      .then( response => {
        if(response.ok){
          console.log('ok')
          return response.json();
        }
        throw new Error(response.statusText);
      })
      .then( responseJson => {
        displayListOfIssues(responseJson);

      })
      .catch(err => {
        console.error(err);
      })
  });

  $('#category_pd_filter').change(function(){
    let _category = $('#category_pd_filter').val() || 'all';
    let _status = $('#status_pd_filter').val() || 'all';
    fetch(`/issues/filter/${_status}/${_category}`)
      .then( response => {
        if(response.ok){
          return response.json();
        }
        throw new Error(response.statusText);
      })
      .then( responseJson => {
        displayListOfIssues(responseJson);

      })
      .catch(err => {
        console.error(err);
      })
  });

//Open edit form...
  $("#issueslist").on('click','.edit-issue',function(event){
    event.preventDefault();
    let issue_id = $(this).attr('id');
    fetch(`/issues/${issue_id}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(response.statusText);
      })
      .then( responseJson => {
        //console.log(responseJson);
        populateForm(responseJson); //intial array of contributors is here.
        taskDialog.dialog("open");
        taskDialog.dialog({buttons: {"Edit":  editIssue}})
        $( "#dialog-form-div").dialog({title: 'Edit task'});
      })
      .catch(err => {
        console.error(err);
      });    
    
  })

//Create a new category option.
  $('#add-new-category-option').on('click', function (event) {
    event.preventDefault();
    let option_to_add = $('#new-category').val();
    let obj_to_add = {
      category: `${option_to_add}`
    };

    $.post('/categories', obj_to_add, function (data, status) {
      $("#category-add-message").toggle().fadeOut();
    });
    createCategoryPullDowns();
    $('#new-category').val('');
    //add a line that will let the user know that the value has been added.
  });

  //create a new contributor option.
  $("#add-new-contributor").on('click', function (event) {
    event.preventDefault();
    let fname = $("#firstName").val();
    let lname = $("#lastName").val();
    let uname = $("#username").val();
    let obj_to_add = {
      firstName: fname,
      lastName: lname,
      username: uname
    };
    $.post('/contributor', obj_to_add, function (data, status) {
      $("#contributor-add-message").toggle();
    });
    createContributorsPullDowns();
    $("#firstName").val('');
    $("#lastName").val('');
    $("#username").val('');

  });

  //Save a contributor to a task
  $("#add-contributor").on('click', function (event) {
    alert('aha');
    event.preventDefault();
    // let $_contributors_to_add_list = $("#contributors-to-add");
    let $_contributor_to_add = $("#form-contributors").val();
    // console.log($_contributor_to_add);
    //alert($('#contributors-to-add').children().length);
    displaySelectedContributor($_contributor_to_add);
    // $(`<div class="staged-contributor-div">${$_contributor_to_add}
    //      <span class="remove-staged-contributor"><a href="" class="remove-contributor"><i class="fas fa-times"></i></a></span></div>`)
    //   .addClass('staged-contributor-div')
    //   .appendTo('#contributors-to-add');
    // contributor_num++;
    // $('#contributors-list-container').append(
    //   `<input type='hidden' 
    //       name='contributor_${contributor_num}' 
    //       id='contributor_${contributor_num}' 
    //       value='${$_contributor_to_add}'>`);
    $('#form-contributors').val('');

  })

  //remove a contributor from a task
  $('#contributors-to-add').on('click', '.remove-contributor', function (event) {
    event.preventDefault();
    $(this).closest('div').remove();
    contributor_num--;
  })

 
//open a the task dialog
  $("#add-issue-button").on("click", function (event) {
    event.preventDefault();
    taskDialog.dialog("open");
    $("#dialog-form-div").dialog({title: 'Add a new task'});
    taskDialog.dialog({buttons: {"Save":  addIssue}})

  });

  //Open/close a task
  $("#issueslist").on('click','.status-icon', function (event) {
    event.preventDefault();

    let issue_id = ($(this).children().attr('id')).substring(8);   
    let _status = $(this).children().attr('class');
    
    $.ajax({
      url: `/issues/${issue_id}/status/${_status}`,
      data: {
        id: issue_id,
        status: _status
      },
      type: 'PUT',
      success: function (data) {
    
        let co_selector = `#co_icon_${data.id}`;
        let open_status = data.open;    
    
        if(open_status === 'true'){
          $(co_selector).attr('class','open-issue').html(`<i class="fas fa-folder-open"></i>`);
        }
        else{
          $(co_selector).attr('class','closed-issue').html(`<i class="fas fa-window-close"></i>`);
        }


      }
    })
  });

  //Open a comment dialog and fetch and display previous comments.
  $("#issueslist").on('click', '.comment-lnk', function (event) {
    event.preventDefault();
    $('.previous-comments').empty();
    $('#issue_comment').empty();
    let issue_id = $(this).attr('id');
    $("#add-comment input[type='hidden']").val(issue_id);
    fetch(`/issues/${issue_id}/comments`)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(response.statusText);
      })
      .then(responseJson => {
        let commentArr = responseJson.follow_up;
        commentArr.forEach(elem => {
          displayComments(elem);          
          // if(elem.created_at) {var elem_date = (elem.created_at).split('T')[0];} else elem_date = '';
          // let comment_div = generateCommentContainer();
          // let comment_text = $(`<div class="comment-text">${elem.comment}</div>`);
          // let comment_date = $(`<div class="comment-date">${elem_date}</div>`);
          // $(comment_div).append(comment_text).append(comment_date).appendTo('.previous-comments');


        })
      })
      .catch(err => {
        console.error(err);
      });
    comment_dialog.dialog("open");
  })

}

function openPage() {
  displayAllIssuesOnOpen();
  createCategoryPullDowns();
  createContributorsPullDowns();
  handleForm();
}

$(openPage);