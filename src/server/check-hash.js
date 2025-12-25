// src/server/check-hash.js
const bcrypt = require('bcryptjs');

// paste the exact hash you just put in DB between the quotes
const hash = '$2b$10$BAwQj7HOvHsDqYfX.QF/nOG82j.WFtqO0Akq1jwI3vCzuH4gB2u92';
const password = 'Test@1234!';

console.log('hash length:', hash.length);
console.log('password:', password);
console.log('match?', bcrypt.compareSync(password, hash));
