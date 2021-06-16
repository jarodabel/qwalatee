start: npm start

build: ng build

deploy 
- everything: `firebase deploy `
- hosting only: `firebase deploy --only hosting`
- functions: `firebase deploy --only functions`



How to add a new user
- add user to authentication table
  - should be able to login
- for statements
  - user object needs properties 

todo

- test all button
- test all loader

- only some people have prod LOB access
- test lob service
- add 10 second wait to "open" button 

- upload file
  - during upload disable review button

- activity
  - list the status of all pending statements
  - total in flight
  - total delivered
  - total waiting for printing

- search
  - show a results message
  - update searchable keys
  