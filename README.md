my first app
ToDo APP
you can add,delete,complete task

refactor: remove cloud sync for tasks and keep local storage + notifications only

- Removed online saving logic to simplify the app and avoid unnecessary complexity
- App now stores all tasks locally using AsyncStorage
- Added support for time-based local notifications for each task
- Decision made to focus cloud features in more suitable apps like chat & e-commerce




 Notification scheduled successfully for: Fri Apr 11 2025 04:03:00 GMT+0200 but no pushed notification