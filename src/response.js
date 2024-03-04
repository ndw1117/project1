const fs = require('fs');
const url = require('url');
const query = require('querystring');

// Read files and store their contents
const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const stylesheet = fs.readFileSync(`${__dirname}/../client/style.css`);
const background = fs.readFileSync(`${__dirname}/../assets/images/background.png`);

const audioJSON = fs.readFileSync(`${__dirname}/../data/audio.json`);
const { audio } = JSON.parse(audioJSON);
// Load audio data for each element into the audio array
audio.forEach((element) => {
  const e = element;
  e.data = fs.readFileSync(`${element.data}`);
});

// Object to store user data
const users = {};

// Function to respond to a request with JSON data
const respondJSON = (request, response, status, statusMessage, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json', 'Status-Message': statusMessage });
  response.write(JSON.stringify(object));
  response.end();
};

// Function to response to HEAD requests
const respondJSONMeta = (request, response, status, statusMessage) => {
  response.writeHead(status, { 'Content-Type': 'application/json', 'Status-Message': statusMessage });
  response.end();
};

// Function to get the stored background image
const getBackground = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'image/png' });
  response.write(background);
  response.end();
};

// Function to add a new user or update an existing user's score
const addUser = (request, response, body) => {
  // Default json message, displayed when missing field(s)
  const responseJSON = {
    message: 'Name and score are both required.',
  };

  // Check to make sure we have both fields
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
  // Only update score if it's higher than existing one
  if (!users[body.name].score || Number(users[body.name].score) < Number(body.score)) {
    users[body.name].score = body.score;
  }

  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, 'Created', responseJSON);
  }

  // Else response code is 204, only head returned
  return respondJSONMeta(request, response, responseCode, 'Updated (No Content)');
};

// Function to handle requests when the route is not found
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

// Function to get the names of all songs
const getSongNames = (request, response) => {
  if (request.method === 'HEAD') {
    return respondJSONMeta(request, response, 200, 'Success');
  }

  const songNames = [];
  audio.forEach((element) => {
    songNames.push(element.title);
  });

  return respondJSON(request, response, 200, 'Success', { songNames });
};

// Returns a song's audio data
// Query parameters can be used to get a song with specific title or id
const getAudio = (request, response) => {
  if (request.method === 'HEAD') {
    return respondJSONMeta(request, response, 200, 'Success');
  }

  response.writeHead(200, { 'Content-Type': 'audio/mpeg' });

  const parsedUrl = url.parse(request.url);
  const params = query.parse(parsedUrl.query);

  // If there is a query, use it
  if (parsedUrl.query) {
    // If there is an id, use it
    if (params.id) {
      // If the audio array has a value at the given id, return it
      if (audio[Number(params.id)]) {
        response.write(audio[Number(params.id)].data);
      } else {
        // Else, the given id did not match any audio, so audio[0] is returned instead
        response.write(audio[0].data);
      }
    } else if (params.title) { // If there is a title, use it
      // Searches audio array for an element with a matching title
      const song = audio.find((currentSong) => currentSong.title === params.title);
      if (song) {
        // If the audio array has a value with the given title, return it
        response.write(audio.find((currentSong) => currentSong.title === params.title).data);
      } else {
        // Else, the given title did not match any audio, so audio[0] is returned instead
        response.write(audio[0].data);
      }
    } else { // Default
      // A query is present but there is no id or title
      response.write(audio[0].data);
    }
  } else { // Default
    // If no query is present, return audio[0]
    response.write(audio[0].data);
  }

  return response.end();
};

// Function to get user data
const getUsers = (request, response) => {
  if (request.method === 'HEAD') {
    return respondJSONMeta(request, response, 200, 'Success');
  }

  const responseJSON = { users };

  return respondJSON(request, response, 200, 'Success', responseJSON);
};

// Function to get the stylesheet
const getStylesheet = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(stylesheet);
  response.end();
};

// Function to get the index page
const getIndex = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

// Export all of the functions for use in other files
module.exports.getIndex = getIndex;
module.exports.getStylesheet = getStylesheet;
module.exports.getUsers = getUsers;
module.exports.notReal = notReal;
module.exports.addUser = addUser;
module.exports.getAudio = getAudio;
module.exports.getSongNames = getSongNames;
module.exports.getBackground = getBackground;
