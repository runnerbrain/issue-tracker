'use strict';


let contributor_num = 0;
const icon_lnk_close = `<i class="fas fa-door-closed"></i>`;
const icon_lnk_open = `<i class="fas fa-door-open"></i>`;
const contributorObjArr = [];
let sort_created_order = 'desc';

function to_string_date(dt) {
  return dt.split('T')[0];
}

function shortenDescription(desc) {
  if (desc.length < 150)
    return desc;
  let short_desc = desc.substring(0, 180);
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
  var status_color = '';
  switch (`${issue.status}`) {
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
  if (issue_description.length != shortDescription.length) {
    var indexOfSpace = shortDescription.indexOf(" ", 150)
    shortDescription = shortDescription.substring(0, 152);
    var description_html = `<span class="description-text">${shortDescription} <a href="#" class="edit-issue" id="${issue.id}">...more</a></span>`;
  } else
    description_html = `<span class="description-text">${shortDescription}</span>`

  return `
    <div class="issue-card" id="ic_${issue.id}">
      <div class="issue-header">
        <div class="_title">${issue.title}</div>
        <div class="_tools">
            <div class="status-badge ${status_color}"><span>${issue.status}</span></div>
            <div class="tools-icon">
                <div><a href="#" class="edit-issue" id="${issue.id}"><i class="fas fa-edit"></i></a></div>
                <div><a href="" class="comment-lnk" id="${issue.id}"><i class="fa fa-comments badge" aria-hidden="true" ></i></a></div>
                <div class="status-icon"><a href="" class="${status_lnk}" id="co_icon_${issue.id}">${icon_lnk}</a></i></div>
                <div><a href="#" class="delete-lnk" id="${issue.id}"><i class="fas fa-trash-alt"></i></a></div>
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

function generateCommentContainer() {
  return `
      <div class="comment-container">
        <div class="comment-text"></div>
      </div>
    `
}

function displayComments(elem) {
  if (elem.created_at) {
    var elem_date = (elem.created_at).split('T')[0];
  } else elem_date = '';
  let comment_div = generateCommentContainer();
  let comment_text = $(`<div class="comment-text">${elem.comment}</div>`);
  let comment_date = $(`<div class="comment-date">${elem_date}</div>`);
  $(comment_div).append(comment_text).append(comment_date).prependTo('.previous-comments');
}

function displayNewIssue(issue) {
  return generateIssueCard(issue);
  // $("#issueslist").prepend(new_issue);
}

function displayListOfIssues(issues) {
  $('#issueslist').empty();
  issues.forEach(elem => {
    let new_issue = generateIssueCard(elem);
    let new_container = $(`<div class="issue-container"></div>`).appendTo('#issueslist');
    $(new_issue).appendTo(new_container);
    // $("#issueslist").append(`<div class="issue-container"></div>`).append(new_issue);
  })
}

function displayAllIssuesOnOpen() {
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

function fetchContributorsByName(contributor) {
  //console.log('test driving new func'+contributor);
  var uname = contributorObjArr.find(elem => {
    //console.log(elem._id);
    return elem._id === contributor
  })
  return uname;
}

function populateForm(issue) {
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

function displaySelectedContributor(contributor) {
  $(`<div class="staged-contributor-div">${contributor}
         <span class="remove-staged-contributor">
            <a href="" class="remove-contributor">
              <i class="fas fa-times"></i>
            </a>
         </span>
     </div>`)
    .addClass('staged-contributor-div')
    .appendTo('#contributors-to-add');

  let num = $('#contributors-to-add').children('input').length;
  $('#contributors-to-add').append(
    `<input type='hidden' 
          name='contributor_${num}' 
          id='contributor_${num}' 
          value='${contributor}'>`);

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
  });

  $("#confirm-task-delete").dialog({
    autoOpen: false,
    resizable: false,
    height: "auto",
    width: 400,
    modal: true
  });



  $("#issue_due_date").datepicker({
    dateFormat: "yy-mm-dd"
  });


  function addComment() {
    //console.log('adding your comment');
    let data = $("#add-comment").serialize();
    let issue_id = $("#comment_issue_id").val();
    //console.log('addComment -> ' + issue_id);
    $.post(`/issues/${issue_id}/comments`, data);
    fetch(`/issues/${issue_id}/comments`)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(response.statusText);
      })
      .then(responseJson => {
        let commentArr = responseJson.follow_up;
        displayComments(responseJson.follow_up[responseJson.follow_up.length - 1]);
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
        console.log(data);
        let new_issue = displayNewIssue(data);
        $("#issueslist").prepend(new_issue).fadeIn();
      }
    )
    taskDialog.dialog('close');

  }

  function editIssue() {
    let edit_data = $("#issue-add-form").serialize();
    let issue_id = $("#edit_issue_id").val();
    $.ajax({
        url: `/issues/${issue_id}`,
        data: edit_data,
        type: 'PUT'
      })
      .done(function (returnedData) {
        let issue_card_id = `#ic_${returnedData.id}`;
        let updatedIssue = displayNewIssue(returnedData);
        $(issue_card_id).parent().html(updatedIssue);
      });
    taskDialog.dialog('close');
  }

  // function reopenIssue(id){
  //   fetch('/issues/${issue_id}/due_date')
  //   .then(response => response.json())
  //   .then((IssueArr) => {
  //     displayListOfIssues(IssueArr)
  //   });
  // }

  $("#sort-created-lnk").on('click', function (event) {
    event.preventDefault();
    let _category = $('#category_pd_filter').val() || 'all';
    let _status = $('#status_pd_filter').val() || 'all';

    if (sort_created_order == 'desc')
      sort_created_order = 'asc';
    else
      sort_created_order = 'desc';
    fetch(`/issues/filter/${_status}/${_category}/${sort_created_order}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(response.statusText);
      })
      .then(responseJson => {
        displayListOfIssues(responseJson);
      })
      .catch(err => {
        console.error(err);
      })
  })

  $('#status_pd_filter').change(function () {
    let _status = $(this).val() || 'all';
    let _category = $('#category_pd_filter').val() || 'all';
    fetch(`/issues/filter/${_status}/${_category}/${sort_created_order}`)
      .then(response => {
        if (response.ok) {
          console.log('ok')
          return response.json();
        }
        throw new Error(response.statusText);
      })
      .then(responseJson => {
        displayListOfIssues(responseJson);

      })
      .catch(err => {
        console.error(err);
      })
  });

  $('#category_pd_filter').change(function () {
    let _category = $('#category_pd_filter').val() || 'all';
    let _status = $('#status_pd_filter').val() || 'all';
    fetch(`/issues/filter/${_status}/${_category}/${sort_created_order}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(response.statusText);
      })
      .then(responseJson => {
        displayListOfIssues(responseJson);

      })
      .catch(err => {
        console.error(err);
      })
  });

  //Open edit form...
  $("#issueslist").on('click', '.edit-issue', function (event) {
    event.preventDefault();
    let issue_id = $(this).attr('id');
    fetch(`/issues/${issue_id}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(response.statusText);
      })
      .then(responseJson => {
        //console.log(responseJson);
        populateForm(responseJson); //intial array of contributors is here.
        taskDialog.dialog("open");
        taskDialog.dialog({
          buttons: {
            "Edit": editIssue
          }
        })
        $("#dialog-form-div").dialog({
          title: 'Edit task'
        });
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
      $("#category-add-message").css('visibility', 'visible').fadeOut(2000);
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
      $("#contributor-add-message").css('visibility', 'visible').fadeOut(2000);
    });
    createContributorsPullDowns();
    $("#firstName").val('');
    $("#lastName").val('');
    $("#username").val('');

  });

  //Save a contributor to a task
  $("#add-contributor").on('click', function (event) {
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
    $("#dialog-form-div").dialog({
      title: 'Add a new task'
    });
    taskDialog.dialog({
      buttons: {
        "Save": addIssue
      }
    })

  });

  //Open/close a task
  $("#issueslist").on('click', '.status-icon', function (event) {
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
        console.log()
        let co_selector = `#co_icon_${data.id}`;
        let open_status = data.open;

        if (open_status === 'true') {
          $(co_selector).attr('class', 'open-issue').html(`${icon_lnk_open}`);
          // let badge_color_status = reopenIssue(issue_id);
          // $.ajax({
          //   url: `/issues/${issue_id}/due-date`,
          //   data:{
          //     id: issue_id
          //   },
          //   type: 'PUT',
          //   success: function(data){
          //     console.log(`got back ${data}`);
          //   }
          // })
        } else {
          $(co_selector).attr('class', 'closed-issue').html(`${icon_lnk_close}`);
          let $_badge_selector = $(co_selector).parents().eq(1).siblings();
          let _current_staus_badge_class = $_badge_selector.attr('class');
          console.log(_current_staus_badge_class);
          $_badge_selector.addClass('status-badge closed-color');
          $_badge_selector.html(`<span>Closed</span>`)
        }


      }
    })
  });

  //delete a task
  $("#issueslist").on("click", ".delete-lnk", function (event) {
    event.preventDefault();
    const issue_id = $(this).attr('id');
    $("#confirm-task-delete").dialog('open');
    $("#confirm-task-delete").dialog({
      buttons: {
        "Delete all items": function () {
          $.ajax({
            url: `/issues/${issue_id}`,
            data: {
              id: issue_id
            },
            type: 'delete'
          });
          //console.log(`I have ${issue_card_id}`);
          let issue_card_id = `#ic_${issue_id}`;          
          $(issue_card_id).parent().remove();
          $(this).dialog("close");
        },
        Cancel: function () {
          $(this).dialog("close");
        }
      }
    });
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