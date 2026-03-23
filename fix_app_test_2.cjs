const fs = require('fs');

let appTest = fs.readFileSync('src/App.test.jsx', 'utf8');
appTest = appTest.replace(/\/landing\.login\|auth\.loginBtn\/\/i/g, '/landing.login|auth.loginBtn/i');
fs.writeFileSync('src/App.test.jsx', appTest, 'utf8');
