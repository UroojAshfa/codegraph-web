"use strict";
const handlers = {
    valid: true,
    onClick() {
        console.log('clicked');
    },
    onSubmit() {
        if (this.valid) {
            console.log('submitted');
        }
    },
    validate() {
        return true;
    }
};
// TEST 2: Object literal with traditional function
const utils = {
    formatDate: function (date) {
        return date.toISOString();
    },
    parseJSON: function (str) {
        try {
            return JSON.parse(str);
        }
        catch {
            return null;
        }
    }
};
// TEST 3: Object literal with arrow functions
const callbacks = {
    onSuccess: () => {
        console.log('success');
    },
    onError: (error) => {
        console.error(error);
    }
};
// TEST 4: Mixed object methods
const api = {
    get(url) {
        return fetch(url);
    },
    post: function (url, data) {
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    delete: (id) => {
        return fetch(`/api/${id}`, { method: 'DELETE' });
    }
};
// TEST 5: Nested objects
const config = {
    handlers: {
        onClick() {
            console.log('nested click');
        }
    },
    init() {
        console.log('initialized');
    }
};
// TEST 6: Object returned from function
function createController() {
    return {
        start() {
            console.log('started');
        },
        stop() {
            console.log('stopped');
        }
    };
}
app.use({
    middleware() {
        console.log('middleware');
    }
});
