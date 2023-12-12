const http = require('http');
const assert = require('chai');
const { saveData, getData } = require('./yourOriginalCode');

describe('HTTP Server', () => {
  let server;

  beforeAll(() => {
    server = http.createServer((req, res) => {
      
    });

    server.listen(3005, () => {
      console.log('Server is running for tests');
    });
  });

  afterAll((done) => {
    server.close(() => {
      console.log('Server closed');
      done();
    });
  });

  async function sendHttpRequest(method, path, data) {
    return new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 3005,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const req = http.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          resolve({ statusCode: res.statusCode, data: JSON.parse(responseData) });
        });
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  it('should handle GET request and return 200 status code with initial data', async () => {
    const response = await sendHttpRequest('GET', '/');
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.data, getData());
  });

  it('should handle POST request and return 201 status code with the new data', async () => {
    const postData = {
      organization: 'NewCompany',
      
    };

    const response = await sendHttpRequest('POST', '/', postData);
    assert.equal(response.statusCode, 201);

    const updatedData = getData();
    assert.deepInclude(updatedData, { ...postData, id: 2 });
  });

  it('should handle PUT request and return 200 status code with updated data', async () => {
    const updatedData = {
      organization: 'UpdatedCompany',
      
    };

    const response = await sendHttpRequest('PUT', '/1', updatedData);
    assert.equal(response.statusCode, 200);

    const data = getData();
    const updatedItem = data.find((item) => item.id === 1);
    assert.deepInclude(updatedItem, { ...updatedData, id: 1 });
  });

  it('should handle DELETE request and return 200 status code with deleted data', async () => {
    const response = await sendHttpRequest('DELETE', '/1');
    assert.equal(response.statusCode, 200);

    const data = getData();
    assert.notInclude(data.map((item) => item.id), 1);
  });

  
});

