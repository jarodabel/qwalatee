import { of } from 'rxjs';

export class FirebaseMock {
    store = {};

    collection(name) {
        return this;
    }

    where() {
        return this;
    }

    add() {
        return this;
    }

    doc() {
        return this;
    }

    get() {
        return of(this);
    }

    data() {
        return this.store;
    }

    setData(data) {
        this.store = data;
    }
}