const firestore = () => {
  const that = {} as any;
  const collection = (name) => {
    return that;
  };
  const where = () => {
    return that;
  };

  const add = (something) => {
    return new Promise((res, rej) => {
      res('');
    });
  };
  const doc = () => {
    return that;
  };

  const get = () => {
    return that;
  };

  const data = () => {
    return that;
  };

  const setData = (data) => {
    return that;
  };
  collection.bind(that);
  where.bind(that);
  add.bind(that);
  doc.bind(that);
  get.bind(that);
  data.bind(that);
  setData.bind(that);

  that.collection = collection;
  that.where = where;
  that.add = add;
  that.doc = doc;
  that.get = get;
  that.data = data;
  that.setData = setData;
  return that;
};
firestore.FieldValue = {
  serverTimestamp: () => {
    return 50;
  },
};
export class FirebaseMock {
  firestore = firestore;
  initializeApp(whocares) {
    return ()=>{};
  }
}

export { firestore };
