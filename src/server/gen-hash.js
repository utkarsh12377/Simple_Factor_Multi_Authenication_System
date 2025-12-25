// src/server/gen-hash.js
const bcrypt = require('bcryptjs');
const pw = 'Test@1234!';
const hash = bcrypt.hashSync(pw, 10);
console.log(hash);
