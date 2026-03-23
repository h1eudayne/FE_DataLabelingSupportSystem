const fs = require('fs');

let headerTest = fs.readFileSync('src/components/layouts/Header.test.jsx', 'utf8');
if (!headerTest.includes('axios.customize')) {
  headerTest = headerTest.replace(/import { Provider } from "react-redux";/, `import { Provider } from "react-redux";\nimport vi from "vitest";\nvi.mock("@/services/axios.customize", () => ({\n  default: { get: vi.fn().mockResolvedValue({ data: { user: { fullName: "Nguyễn Văn A" } } }) }\n}));`);
  fs.writeFileSync('src/components/layouts/Header.test.jsx', headerTest, 'utf8');
}

// Check other vitest runs
