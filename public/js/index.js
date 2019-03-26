'use strict';

let contributor_num = 0;

function to_string_date(dt){
  return dt.split('T')[0];
}

function generateIssueCard(issue) {
  let created_at_string  = to_string_date(issue.created);
  let issue_due_string = to_string_date(issue.due);

  return `
      <div class="issues-strip">
        <div class="status-info">
          <div class="status-text">${issue.status}</div>
          <div class="status-close">
            <i class="material-icons">close</i>
          </div>
        </div>
        <div class="issue-info">
          <div class="issue-title">${issue.title}</div>
          <div class="issue-desc">${issue.description}</div>
          <div class="issue-dates">created : ${created_at_string}, due: ${issue_due_string}</div>
        </div>
        <div class="issue-tools">
          <div class="edit-icon">
            <i class="fas fa-edit"></i>
          </div>
          <div class="comment-icon">
            <i class="fa fa-comments" aria-hidden="true"></i>
          </div>
        </div>
      </div>
  `
}

function displayListOfIssues() {
  const $_issues_list = $("#issueslist");
  fetch('/issues')
    .then(response => response.json())
    .then((IssueArr) => {
      console.log(IssueArr.length);
      IssueArr.forEach(elem => {
        console.log(elem);
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



}

function openPage() {
  displayListOfIssues();
  createCategoryPullDowns();
  createContributorsPullDowns();
  handleForm();
}

$(openPage);