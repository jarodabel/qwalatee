var admin = require('firebase-admin');

exports.lobEvent = (data)=>{
  return new Promise((resolve, reject) => {
    resolve("endpoint for lob webhooks")
  });
}


const temp = {
  "id": "evt_d95ff8ffd2b5cfb4",
  "body": {
    "id": "psc_d2d10a2e9cba991c",
    "description": "Test Postcard",
    "metadata": {},
    "to": {
      "id": "adr_8e783523dd7f0e70",
      "description": "Test Address",
      "name": "Harry Zhang",
      "address_line1": "123 Test St",
      "address_line2": "Unit 1",
      "address_city": "San Francisco",
      "address_state": "CA",
      "address_zip": "94107",
      "address_country": "United States",
      "metadata": {},
      "date_created": "2016-12-04T10:51:51.844Z",
      "date_modified": "2016-12-04T10:51:51.844Z",
      "object": "address"
    },
    "from": {
      "id": "adr_d2e26faf793ed422",
      "description": "Test Address",
      "name": "Harry Zhang",
      "address_line1": "123 Test St",
      "address_line2": "Unit 1",
      "address_city": "San Francisco",
      "address_state": "CA",
      "address_zip": "94107",
      "address_country": "United States",
      "metadata": {},
      "date_created": "2016-12-04T10:51:51.845Z",
      "date_modified": "2016-12-04T10:51:51.845Z",
      "object": "address"
    },
    "url": "https://lob-assets.com/postcards/psc_d2d10a2e9cba991c.pdf?expires=1540372221&signature=dNE8OtbDymujUxBIMYle4H1cv1aZNFk",
    "carrier": "USPS",
    "tracking_events": [],
    "thumbnails": [
      {
        "small": "https://lob-assets.com/postcards/psc_d2d10a2e9cba991c_thumb_small_1.png?expires=1540372221&signature=McmqScxPgbe7yQY5X31U3vhU8VUlfA1",
        "medium": "https://lob-assets.com/postcards/psc_d2d10a2e9cba991c_thumb_medium_1.png?expires=1540372221&signature=VBClptOuCcj9Ybay6gE5aetT5j3C7KS",
        "large": "https://lob-assets.com/postcards/psc_d2d10a2e9cba991c_thumb_large_1.png?expires=1540372221&signature=RAHpIwoYKYM17f0bbaoOiamCkjpzYfH"
      },
      {
        "small": "https://lob-assets.com/postcards/psc_d2d10a2e9cba991c_thumb_small_2.png?expires=1540372221&signature=5biHoaCmkphQaGJymOZxmTF0hHdiH4N",
        "medium": "https://lob-assets.com/postcards/psc_d2d10a2e9cba991c_thumb_medium_2.png?expires=1540372221&signature=1ApGx0kn5EO4qQKGJzCe6zEPnQpzpRY",
        "large": "https://lob-assets.com/postcards/psc_d2d10a2e9cba991c_thumb_large_2.png?expires=1540372221&signature=z80p90RBak6T26IAfg5yg7a6qKF53a8"
      }
    ],
    "size": "4x6",
    "expected_delivery_date": "2016-12-09",
    "date_created": "2016-12-04T10:51:51.843Z",
    "date_modified": "2016-12-04T10:51:51.843Z",
    "object": "postcard"
  },
  "reference_id": "psc_d2d10a2e9cba991c",
  "event_type": {
    "id": "postcard.created",
    "enabled_for_test": true,
    "resource": "postcards",
    "object": "event_type"
  },
  "date_created": "2016-12-04T22:50:08.180Z",
  "object": "event"
}
