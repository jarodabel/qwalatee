start: npm start

test: 
- local: `npm run test:local`
- coverage: `npm run test:coverage`

build:
- dev:`npm run build:dev`
- default: `npm run build:prod`

deploy 
- everything: `firebase deploy -P default`
  - def: `firebase deploy -P dev`
- hosting only: `firebase deploy --only hosting -P default`
- functions: `firebase deploy --only functions -P default`
  - `firebase deploy --only functions -P dev`



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
  