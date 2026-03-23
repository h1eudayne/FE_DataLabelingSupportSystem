const fs = require('fs');

let headerTest = fs.readFileSync('src/components/layouts/Header.test.jsx', 'utf8');
console.log("=== Header ===");
const lines = headerTest.split('\n');
console.log(lines.find(l => l.includes('screen.getByText')));

let landingNavTest = fs.readFileSync('src/components/landing/LandingNavbar.test.jsx', 'utf8');
console.log("=== Landing Navbar ===");
console.log(landingNavTest.split('\n').filter(l => l.includes('name: /')).join('\n'));

let dashboardTest = fs.readFileSync('src/components/layouts/DashboardLayout.test.jsx', 'utf8');
console.log("=== DashboardLayout ===");
console.log(dashboardTest.split('\n').find(l => l.includes('screen.')));
