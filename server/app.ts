import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

type Company = {
  organization: string;
  createdAt: string;
  updatedAt: string;
  products: string[];
  marketValue: string;
  address: string;
  ceo: string;
  country: string;
  id: number;
  noOfEmployees: number;
  employees: string[];
};

const databasePath = path.join(__dirname, 'database.json');

const initialData: Company[] = [
  {
    organization: "node ninja",
    createdAt: "2020-08-12T19:04:55.455Z",
    updatedAt: "2020-08-12T19:04:55.455Z",
    products: ["developers", "pizza"],
    marketValue: "90%",
    address: "sangotedo",
    ceo: "cn",
    country: "Taiwan",
    id: 1,
    noOfEmployees: 2,
    employees: ["james bond", "jackie chan"],
  }
];

saveData(initialData);

const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
  const methodHandlers: Record<string, () => void> = {
    'GET': () => sendResponse(res, 200, getData()),
    'POST': () => handlePostRequest(req, res),
    'PUT': () => handlePutRequest(req, res),
    'DELETE': () => handleDeleteRequest(req, res),
    'default': () => sendResponse(res, 404, { error: 'Not Found' }),
  };

  methodHandlers[req.method || 'default']();
});

const port = 3005;

server.listen(port, () => console.log(`Server is running on http://localhost:${port}`));

function sendResponse(res: http.ServerResponse, statusCode: number, data: any): void {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
}

function getData(): Company[] {
  try {
    const data = fs.existsSync(databasePath) ? fs.readFileSync(databasePath, 'utf-8') : '[]';
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return [];
  }
}

function saveData(data: Company[] | object): void {
  fs.writeFileSync(databasePath, JSON.stringify(Array.isArray(data) ? data : [data], null, 2), 'utf-8');
}

function getNextId(): number {
  const data = getData();
  return data.length > 0 ? Math.max(...data.map((item) => item.id)) + 1 : 1;
}

function handlePostRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
  readRequestBody(req).then((body) => {
    const newData: Company = { ...JSON.parse(body), id: getNextId() };
    saveData([...getData(), newData]);
    sendResponse(res, 201, newData);
  });
}

function handlePutRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
  readRequestBody(req).then((body) => {
    const updatedData: Company = JSON.parse(body);
    const data = getData();
    const index = data.findIndex((item) => item.id === updatedData.id);

    if (index !== -1) {
      data[index] = { ...data[index], ...updatedData, updatedAt: new Date().toISOString() };
      saveData(data);
      sendResponse(res, 200, data[index]);
    } else {
      sendResponse(res, 404, { error: 'Data not found' });
    }
  });
}

function handleDeleteRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
  const id = parseInt(path.basename(req.url || ''), 10);
  const data = getData();
  const index = data.findIndex((item) => item.id === id);

  if (index !== -1) {
    const [deletedItem] = data.splice(index, 1);
    saveData(data);
    sendResponse(res, 200, deletedItem);
  } else {
    sendResponse(res, 404, { error: 'Data not found' });
  }
}

async function readRequestBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => body += chunk);
    req.on('end', () => resolve(body));
    req.on('error', (error) => reject(error));
  });
}
