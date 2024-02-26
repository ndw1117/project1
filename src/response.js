const fs = require('fs');
const url = require('url');
const query = require('querystring');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const stylesheet = fs.readFileSync(`${__dirname}/../client/style.css`);

let audioJSON = fs.readFileSync(`${__dirname}/../data/audio.json`);
let audio = JSON.parse(audioJSON).audio;
audio.forEach(element => {
  element.data = fs.readFileSync(element.data);
});


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

const getAudio = (request, response) => {
  if (request.method === 'HEAD') {
    return respondJSONMeta(request, response, 200, 'Success');
  }

  response.writeHead(200, { 'Content-Type': 'audio/mpeg' });

  const parsedUrl = url.parse(request.url);
  const params = query.parse(parsedUrl.query);

  if (parsedUrl.query) {
    console.log("there is a query");
    if (params.id) {
      console.log("using id");
      if (audio[parseInt(params.id)]) {
        response.write(audio[parseInt(params.id)].data);
      }
      else {
        console.log("couldn't find id, returning song[0] instead");
        response.write(audio[0].data);
      }
    }
    else if (params.title) {
      console.log("using title");
      let song = audio.find(song => song.title === params.title);
      if (song) {
        response.write(audio.find(song => song.title === params.title).data);
      }
      else {
        console.log("couldn't find title, returning song[0] instead");
        response.write(audio[0].data);
      }
    }
    else { // Default
      console.log("default, query present");
      response.write(audio[0].data);
    }
  }
  else { // Default
    console.log("default, no query");
    response.write(audio[0].data);
  }

  response.end();
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
module.exports.getAudio = getAudio;
