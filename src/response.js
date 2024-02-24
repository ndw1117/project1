const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const stylesheet = fs.readFileSync(`${__dirname}/../client/style.css`);

const users = {};

const respondJSON = (request, response, status, statusMessage, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json', 'Status-Message': statusMessage });
  response.write(JSON.stringify(object));
  response.end();
};

// For requests that only want the head
const respondJSONMeta = (request, response, status, statusMessage) => {
  response.writeHead(status, { 'Content-Type': 'application/json', 'Status-Message': statusMessage });
  response.end();
};

const addUser = (request, response, body) => {
  // default json message, displayed when missing field(s)
  const responseJSON = {
    message: 'Name and score are both required.',
  };

  // check to make sure we have both fields
  if (!body.name || !body.score) {
    responseJSON.id = 'addUserMissingParams';
    return respondJSON(request, response, 400, 'Bad Request', responseJSON);
  }

  // If both fields present:

  let responseCode = 204;

  // If the user doesn't exist yet
  if (!users[body.name]) {
    responseCode = 201;
    users[body.name] = {};
  }

  users[body.name].name = body.name;
  users[body.name].score = body.score;

  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, 'Created', responseJSON);
  }

  // Else response code is 204, only head returned
  return respondJSONMeta(request, response, responseCode, 'Updated (No Content)');
};

const notReal = (request, response) => {
  if (request.method === 'HEAD') {
    return respondJSONMeta(request, response, 404, 'Not Found');
  }

  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  return respondJSON(request, response, 404, 'Not Found', responseJSON);
};

const getUsers = (request, response) => {
  if (request.method === 'HEAD') {
    return respondJSONMeta(request, response, 200, 'Success');
  }

  const responseJSON = { users };

  return respondJSON(request, response, 200, 'Success', responseJSON);
};

const getStylesheet = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(stylesheet);
  response.end();
};

const getIndex = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

module.exports.getIndex = getIndex;
module.exports.getStylesheet = getStylesheet;
module.exports.getUsers = getUsers;
module.exports.notReal = notReal;
module.exports.addUser = addUser;
