import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { handleHarnessSave } from './tools/harnessSave.js';
import { handleHarnessContext } from './tools/harnessContext.js';
import { handleHarnessList } from './tools/harnessList.js';
import { handleHarnessConsolidate } from './tools/harnessConsolidate.js';

const DEFAULT_PROJECT_DIR = process.env['HARNESS_PROJECT_DIR'] ?? process.cwd();

export function createServer(): McpServer {
  const server = new McpServer({ name: 'harness', version: '0.1.0' });

  server.registerTool('harness_save', {
    description: 'Save a learning, correction, or preference to the harness. Call silently when the user corrects you or states a preference. Pass project_dir as the absolute path of the current project.',
    inputSchema: {
      content: z.string().describe('The learning to save.'),
      scope: z.enum(['personal', 'project']).optional().describe('Scope (inferred if omitted).'),
      topic: z.string().optional().describe('Short topic tag (inferred if omitted).'),
      project_dir: z.string().optional().describe('Absolute path of the current project directory.'),
    },
  }, async (args) => {
    const projectDir = args.project_dir ?? DEFAULT_PROJECT_DIR;
    const result = await handleHarnessSave(args, projectDir);
    return { content: [{ type: 'text', text: result }] };
  });

  server.registerTool('harness_context', {
    description: 'Load harness knowledge for the current session. Call at session start to inject saved learnings. Pass project_dir as the absolute path of the current project.',
    inputSchema: {
      scope: z.enum(['personal', 'project', 'both']).optional(),
      project_dir: z.string().optional().describe('Absolute path of the current project directory.'),
    },
  }, async (args) => {
    const projectDir = args.project_dir ?? DEFAULT_PROJECT_DIR;
    const result = await handleHarnessContext(args, projectDir);
    return { content: [{ type: 'text', text: result }] };
  });

  server.registerTool('harness_list', {
    description: 'List harness entries.',
    inputSchema: {
      scope: z.enum(['personal', 'project']).optional(),
      topic: z.string().optional(),
      project_dir: z.string().optional().describe('Absolute path of the current project directory.'),
    },
  }, async (args) => {
    const projectDir = args.project_dir ?? DEFAULT_PROJECT_DIR;
    const result = await handleHarnessList(args as Parameters<typeof handleHarnessList>[0], projectDir);
    return { content: [{ type: 'text', text: result }] };
  });

  server.registerTool('harness_consolidate', {
    description: 'Force consolidation of harness entries.',
    inputSchema: {
      scope: z.enum(['personal', 'project']).optional(),
      project_dir: z.string().optional().describe('Absolute path of the current project directory.'),
    },
  }, async (args) => {
    const projectDir = args.project_dir ?? DEFAULT_PROJECT_DIR;
    const result = await handleHarnessConsolidate(args as Parameters<typeof handleHarnessConsolidate>[0], projectDir);
    return { content: [{ type: 'text', text: result }] };
  });

  return server;
}

export async function startServer(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
