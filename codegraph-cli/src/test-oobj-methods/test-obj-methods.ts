
const handlers = {
    valid: true,
  

    onClick() {
      console.log('clicked');
    },
  
   
    onSubmit(this: { valid: boolean }) {
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
    
    formatDate: function (date: Date) {
      return date.toISOString();
    },
  
   
    parseJSON: function (str: string) {
      try {
        return JSON.parse(str);
      } catch {
        return null;
      }
    }
  };

  // TEST 3: Object literal with arrow functions

  const callbacks = {
   
    onSuccess: () => {
      console.log('success');
    },
  

    onError: (error: Error) => {
      console.error(error);
    }
  };
  

  // TEST 4: Mixed object methods

  const api = {

    get(url: string) {
      return fetch(url);
    },
  

    post: function (url: string, data: unknown) {
      return fetch(url, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
  
    
    delete: (id: number) => {
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
  

  // TEST 7: Object passed as argument

  declare const app: {
    use(arg: unknown): void;
  };
  
  app.use({

    middleware() {
      console.log('middleware');
    }
  });
  
  