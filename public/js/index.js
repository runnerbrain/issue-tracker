'use strict';

let contributor_num = 0;

function to_string_date(dt) {
  return dt.split('T')[0];
}

function generateIssueCard(issue) {
  let created_at_string = to_string_date(issue.created);
  let issue_due_string = to_string_date(issue.due);
  if (issue.open) {
    var status_lnk = 'close-issue-lnk';
    var icon_lnk = `<i class="fas fa-window-close"></i>`
  } else {
    var status_lnk = 'close-issue-lnk';
    var icon_lnk = `<i class="fas fa-folder-open"></i>`
  }
  return `
      <div class="issues-strip">
        <div class="status-info">
          <div class="status-text">${issue.status}</div>
          <div class="status-close">
            <a href="" class="${status_lnk}" id="${issue.id}">${icon_lnk}</a>
          </div>
        </div>
        <div class="issue-info">
          <div class="issue-title">${issue.title}</div>
          <div class="issue-desc">${issue.description}</div>
          <div class="issue-dates">created : ${created_at_string}, due: ${issue_due_string}</div>
        </div>
        <div class="issue-tools">
          <div class="edit-icon">
            <a href="#" class="edit-issue" id="${issue.id}"><i class="fas fa-edit"></i></a>
          </div>
          <div class="comment-icon">
            <a href="" class="comment-lnk" id="${issue.id}"><i class="fa fa-comments badge" aria-hidden="true" ></i></a>
          </div>
        </div>
      </div>
  `
}

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
  $(comment_div).append(comment_text).append(comment_date).appendTo('.previous-comments');
}

function displayListOfIssues() {
  const $_issues_list = $("#issueslist");
  fetch('/issues')
    .then(response => response.json())
    .then((IssueArr) => {
      //console.log(IssueArr.length);
      IssueArr.forEach(elem => {
        // console.log(elem.id);
        let new_issue = generateIssueCard(elem);
        $("#issueslist").append(new_issue);
      })
    })
}

function createCategoryPullDowns() {
  let $_form_category = $("#form-category");
  $('#form-category option').remove();
  $_form_category.append(`<option value=''></option>`)
  fetch('/categories')
    .then(response => response.json())
    .then(categoryArr => {
      categoryArr.forEach(elem => {
        let val = elem['category'];
        $_form_category.append(`<option value=${val}>${val}</option>`);
      })
    })
}

function createContributorsPullDowns() {

  let $_form_contributor = $("#form-contributors");
  $('#form-contributors option').remove();
  $_form_contributor.append(`<option value = ''></option>`);
  fetch('contributors')
    .then(response => response.json())
    .then(contributorArr => {
      contributorArr.forEach(elem => {
        let val = elem['username'];
        $_form_contributor.append(`<option value=${val}>${val}</option>`);
      })
    })
}

function populateForm(issue){
  $('#form_issue_title').val(issue.title);
  $('#form_issue_description').val(issue.description);
  $('#form_category').val(issue.category)
  let dt = issue.due_date.split('T')[0];
  $("#issue_due_date").val(dt);
  
}

function handleForm() {

  $("#tabs").tabs();

  const mydialog = $("#dialog-form-div").dialog({
    autoOpen: false,
    height: 800,
    width: 750,
    modal: true,
    buttons: {
      "Save": addIssue
    },
    show: {
      effect: "blind",
      duration: 200
    },
    close: function () {

      //form[0].reset();
      //allFields.removeClass( "ui-state-error" );
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

      //form[0].reset();
      //allFields.removeClass( "ui-state-error" );
    },
    hide: {
      effect: "fade",
      duration: 200
    }
  })

  function addComment() {
    console.log('adding your comment');
    let data = $("#add-comment").serialize();
    let issue_id = $("#comment_issue_id").val();
    console.log('addComment -> ' + issue_id);
    $.post(`/issues/${issue_id}/comments`,data,function(data) {
      console.log('success I guess!'+data.message);
    });
    displayComments(data);
    $("#issue_comment").val('');
    
  }

  function addIssue() {
    console.log('adding your issue');
    // let title = $("#form-issue-title").val();
    // let description = $("#form-issue-description").val();
    $('#contributors-list-container').append(
      `<input type='hidden'
        name='contributor_number'
        id='contributor_number'
        value='${contributor_num}'>`)
    let data = $("#issue-add-form").serialize();
    // console.log(data);
    $.post(
      '/issues', data,
      function (data) {}
    )
  }

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
        mydialog.dialog("open");
        populateForm(responseJson);
      })
      .catch(err => {
        console.error(err);
      });    
    
  })


  $('#add-new-category-option').on('click', function (event) {
    event.preventDefault();
    let option_to_add = $('#new-category').val();
    let obj_to_add = {
      category: `${option_to_add}`
    };

    // $('#form-category').append(`<option value=${option_to_add}>${option_to_add}</option>`);
    //categoryArr.push(option_to_add);
    $.post('/categories', obj_to_add, function (data, status) {
      $("#category-add-message").toggle().fadeOut();
    });
    createCategoryPullDowns();
    $('#new-category').val('');
    //add a line that will let the user know that the value has been added.
  });

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

  $("#add-contributor").on('click', function (event) {
    event.preventDefault();
    // let $_contributors_to_add_list = $("#contributors-to-add");
    let $_contributor_to_add = $("#form-contributors").val();
    // console.log($_contributor_to_add);
    $(`<div class="staged-contributor-div">${$_contributor_to_add}
         <span class="remove-staged-contributor"><a href="" class="remove-contributor"><i class="fas fa-times"></i></a></span></div>`)
      .addClass('staged-contributor-div')
      .appendTo('#contributors-to-add');
    contributor_num++;
    $('#contributors-list-container').append(
      `<input type='hidden' 
          name='contributor_${contributor_num}' 
          id='contributor_${contributor_num}' 
          value='${$_contributor_to_add}'>`);
    $('#form-contributors').val('');

  })

  $('#contributors-to-add').on('click', '.remove-contributor', function (event) {
    event.preventDefault();
    $(this).closest('div').remove();
    contributor_num--;
  })

  $("#issue_due_date").datepicker();

  $("#add-issue-button").on("click", function (event) {
    event.preventDefault();
    mydialog.dialog("open");
  });

  $("#issueslist").on('click','.close-issue-lnk', function (event) {
    event.preventDefault();
    let issue_id = $(this).attr('id');

    $.ajax({
      url: `/issues/${issue_id}`,
      data: {
        id: issue_id
      },
      type: 'PUT',
      success: function (data) {
        console.log('who knows....maybe');
      }
    })
  });

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
  displayListOfIssues();
  createCategoryPullDowns();
  createContributorsPullDowns();
  handleForm();
}

$(openPage);