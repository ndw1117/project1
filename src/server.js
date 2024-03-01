const http = require('http');
const url = require('url');
const query = require('querystring');

const handler = require('./response.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  '/': handler.getIndex,
  '/style.css': handler.getStylesheet,
  '/getUsers': handler.getUsers,
  '/notReal': handler.notReal,
  '/addUser': handler.addUser,
  '/getAudio': handler.getAudio,
  '/getSongNames': handler.getSongNames,
};

const parseBody = (request, response, handlerFunction) => {
  // Array to store request pieces
  const body = [];

  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  // Occurs when a piece of the body arrives
  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = query.parse(bodyString);

    handlerFunction(request, response, bodyParams);
  });
};

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);

  if (parsedUrl.pathname === '/addUser') {
    return parseBody(request, response, handler.addUser);
  }

  const handlerFunc = urlStruct[parsedUrl.pathname];
  if (handlerFunc) {
    return handlerFunc(request, response);
  }

  // Else page not found
  return urlStruct['/notReal'](request, response);
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1:${port}`);
});
