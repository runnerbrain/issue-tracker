
$(function(){
    
  function addIssue(){
    console.log('adding your issue');
    // let title = $("#form-issue-title").val();
    // let description = $("#form-issue-description").val();
    let data = $("#issue-add-form").serialize();
    // console.log(data);
    $.post(
       '/issues',data,function(data){
       }
    )
  }

  $("#issue_due_date").datepicker();

  const mydialog = $( "#dialog-form-div" ).dialog({
    autoOpen: false,
    height: 700,
    width: 650,
    modal: true,
    buttons: {
      "Save": addIssue
    },
    show : {effect: "blind",duration: 200},
    close: function() {
      //form[ 0 ].reset();
      //allFields.removeClass( "ui-state-error" );
    },
    hide: {
      effect: "fade",
      duration: 200
    }
  });

    
    
    $( "#add-issue-button").on( "click", function(event) {
      event.preventDefault();
      mydialog.dialog( "open" );
  });

});
