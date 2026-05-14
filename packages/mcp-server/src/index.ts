import { startServer } from './server.js';

const projectDir = process.env['HARNESS_PROJECT_DIR'] ?? process.cwd();
startServer(projectDir).catch(console.error);
