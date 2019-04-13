# issue-tracker


## Demo

- [Live Demo](https://tranquil-river-78377.herokuapp.com/)

## Screenshots
Landing Page:

![landing page](issue-tracker-landing-page.png)

Issues vue:

![Issues list](issues-listed.png)

Add a task view:

![Add a task view](add-a-task-dialog.png)

Add a category view:

![Add a category view](add-a-category-tab.png)

## Summary

1. 'Issue-tracker' is a minimalist tracker of tasks, which can be used by an individual to track his or her own tasks or a small team to serve as their punch list at their meeting to keep track of the tasks at hand.
2. The landing page displays a list of all available tasks if they exist or a message that no tasks have yet been created if none have yet been created.
3. The fields available are : Title, description, Category, Due date and a contributor.
4. Both Category and Contributor are empty fields upon first launch of the app, but to which values can be dynamically added later.
5. From the landing page, the user can create a task, order the task list by the date created, and filter two fields, namely: the status and the categories. The status is a calculated value based on the due date and the current date.
6. A status can either be: due, overdue, pending or Closed.
7. Unlike the other statuses which are calculated, the closed status is a boolean value which is stored in the database.
8. Upon creating a task, the task gets pushed up to the top of the list. 
9. The user has the option of editing a task by changing any of the fields in #3 and committing the changes.
10. To close a task however, the user is given the option to click on an icon to manually close a task. The user has the ability to re-open a task. 
11. The user is given the option to comment on a task. Multiple comments can entered and dated and they're listed in Descending order.
12. And finally the user has the option of deleting a task altogether. A confirmation prompt is displayed before the action is executed.
4. The user is given the option to load more recipes when they scroll down to the bottom of the page should he or she chooses to.
5. The user can then select to display the details of a recipe by clicking on an 'unfold-more' link which shows the ingredients and the instrcutions (if they exist).
6. Each ingredient item has a substitute link which, when clicked, displays a list of substitutes for the ingredients if they exist.


### Technology used
* HTML
* CSS
* JQuery, JQuery UI
* Node.js
* MongoDB (Atlas)
* Mongoose
* Heroku
* git
