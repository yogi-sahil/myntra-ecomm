const http = require('http');
const server = http.createServer((req, res) => res.end('ok'));
server.listen(8999, () => console.log('native server running'));
