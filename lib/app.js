"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = __importStar(require("http"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const databasePath = path.join(__dirname, 'database.json');
const initialData = [
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
const server = http.createServer((req, res) => {
    const methodHandlers = {
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
function sendResponse(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data, null, 2));
}
function getData() {
    try {
        const data = fs.existsSync(databasePath) ? fs.readFileSync(databasePath, 'utf-8') : '[]';
        return JSON.parse(data);
    }
    catch (error) {
        console.error('Error reading data:', error);
        return [];
    }
}
function saveData(data) {
    fs.writeFileSync(databasePath, JSON.stringify(Array.isArray(data) ? data : [data], null, 2), 'utf-8');
}
function getNextId() {
    const data = getData();
    return data.length > 0 ? Math.max(...data.map((item) => item.id)) + 1 : 1;
}
function handlePostRequest(req, res) {
    readRequestBody(req).then((body) => {
        const newData = { ...JSON.parse(body), id: getNextId() };
        saveData([...getData(), newData]);
        sendResponse(res, 201, newData);
    });
}
function handlePutRequest(req, res) {
    readRequestBody(req).then((body) => {
        const updatedData = JSON.parse(body);
        const data = getData();
        const index = data.findIndex((item) => item.id === updatedData.id);
        if (index !== -1) {
            data[index] = { ...data[index], ...updatedData, updatedAt: new Date().toISOString() };
            saveData(data);
            sendResponse(res, 200, data[index]);
        }
        else {
            sendResponse(res, 404, { error: 'Data not found' });
        }
    });
}
function handleDeleteRequest(req, res) {
    const id = parseInt(path.basename(req.url || ''), 10);
    const data = getData();
    const index = data.findIndex((item) => item.id === id);
    if (index !== -1) {
        const [deletedItem] = data.splice(index, 1);
        saveData(data);
        sendResponse(res, 200, deletedItem);
    }
    else {
        sendResponse(res, 404, { error: 'Data not found' });
    }
}
async function readRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => body += chunk);
        req.on('end', () => resolve(body));
        req.on('error', (error) => reject(error));
    });
}
