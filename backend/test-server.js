const express = require('express');
const app = express();
app.get('/api/test', (req, res) => res.send('hello'));
app.listen(8999, () => console.log('test server running'));
setInterval(() => {}, 1000);
