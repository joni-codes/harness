import { Command } from 'commander';
import chalk from 'chalk';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { join, resolve } from 'path';
import { installLaunchd } from '../daemon/launchd.js';
import { installSystemd } from '../daemon/systemd.js';
import { installWindowsService } from '../daemon/windowsService.js';

const PROVIDER_CONFIGS: Record<string, { name: string; configPath: (projectDir: string) => string; config: (projectDir: string) => string }> = {
  'claude-code': {
    name: 'Claude Code',
    configPath: (projectDir: string) => join(projectDir, '.mcp.json'),
    config: (projectDir: string) => JSON.stringify({
      mcpServers: {
        harness: {
          command: 'node',
          args: [join(homedir(), '.harness', 'server', 'index.js')],
          env: { HARNESS_PROJECT_DIR: projectDir }
        }
      }
    }, null, 2)
  },
  cursor: {
    name: 'Cursor',
    configPath: (projectDir: string) => join(projectDir, '.cursor', 'mcp.json'),
    config: (projectDir: string) => JSON.stringify({
      mcpServers: {
        harness: {
          command: 'node',
          args: [join(homedir(), '.harness', 'server', 'index.js')],
          env: { HARNESS_PROJECT_DIR: projectDir }
        }
      }
    }, null, 2)
  },
  vscode: {
    name: 'VS Code (Copilot)',
    configPath: (projectDir: string) => join(projectDir, '.vscode', 'mcp.json'),
    config: (projectDir: string) => JSON.stringify({
      servers: {
        harness: {
          type: 'stdio',
          command: 'node',
          args: [join(homedir(), '.harness', 'server', 'index.js')],
          env: { HARNESS_PROJECT_DIR: projectDir }
        }
      }
    }, null, 2)
  },
  gemini: {
    name: 'Gemini CLI',
    configPath: (_projectDir: string) => join(homedir(), '.gemini', 'settings.json'),
    config: (_projectDir: string) => JSON.stringify({
      mcpServers: {
        harness: {
          command: 'node',
          args: [join(homedir(), '.harness', 'server', 'index.js')]
        }
      }
    }, null, 2)
  },
  windsurf: {
    name: 'Windsurf',
    configPath: (_projectDir: string) => join(homedir(), '.codeium', 'windsurf', 'mcp_config.json'),
    config: (_projectDir: string) => JSON.stringify({
      mcpServers: {
        harness: {
          command: 'node',
          args: [join(homedir(), '.harness', 'server', 'index.js')]
        }
      }
    }, null, 2)
  },
  continue: {
    name: 'Continue',
    configPath: (_projectDir: string) => join(homedir(), '.continue', 'config.json'),
    config: (projectDir: string) => {
      const configPath = join(homedir(), '.continue', 'config.json');
      let existing: Record<string, unknown> = {};
      if (existsSync(configPath)) {
        try { existing = JSON.parse(readFileSync(configPath, 'utf-8')); } catch {}
      }
      const mcpServers = (existing.mcpServers as unknown[] | undefined) ?? [];
      mcpServers.push({
        name: 'harness',
        command: 'node',
        args: [join(homedir(), '.harness', 'server', 'index.js')],
        env: { HARNESS_PROJECT_DIR: projectDir }
      });
      return JSON.stringify({ ...existing, mcpServers }, null, 2);
    }
  },
  opencode: {
    name: 'OpenCode',
    configPath: (projectDir: string) => join(projectDir, 'opencode.json'),
    config: (projectDir: string) => {
      const configPath = join(projectDir, 'opencode.json');
      let existing: Record<string, unknown> = {};
      if (existsSync(configPath)) {
        try { existing = JSON.parse(readFileSync(configPath, 'utf-8')); } catch {}
      }
      const mcp = (existing.mcp as Record<string, unknown> | undefined) ?? {};
      (mcp as Record<string, unknown>)['harness'] = {
        command: 'node',
        args: [join(homedir(), '.harness', 'server', 'index.js')],
        env: { HARNESS_PROJECT_DIR: projectDir }
      };
      return JSON.stringify({ ...existing, mcp }, null, 2);
    }
  },
  zed: {
    name: 'Zed',
    configPath: (_projectDir: string) => join(homedir(), '.config', 'zed', 'settings.json'),
    config: (projectDir: string) => {
      const configPath = join(homedir(), '.config', 'zed', 'settings.json');
      let existing: Record<string, unknown> = {};
      if (existsSync(configPath)) {
        try { existing = JSON.parse(readFileSync(configPath, 'utf-8')); } catch {}
      }
      const contextServers = (existing.context_servers as Record<string, unknown> | undefined) ?? {};
      (contextServers as Record<string, unknown>)['harness'] = {
        command: 'node',
        args: [join(homedir(), '.harness', 'server', 'index.js')],
      };
      return JSON.stringify({ ...existing, context_servers: contextServers }, null, 2);
    }
  },
  aider: {
    name: 'Aider',
    configPath: (projectDir: string) => join(projectDir, '.aider.conf.yml'),
    config: (projectDir: string) => `# Harness MCP configuration for Aider
mcp:
  harness:
    command: node
    args:
      - ${join(homedir(), '.harness', 'server', 'index.js')}
    env:
      HARNESS_PROJECT_DIR: ${projectDir}
`
  },
  'amazon-q': {
    name: 'Amazon Q Developer',
    configPath: (_projectDir: string) => join(homedir(), '.aws', 'amazonq', 'mcp.json'),
    config: (_projectDir: string) => JSON.stringify({
      mcpServers: {
        harness: {
          command: 'node',
          args: [join(homedir(), '.harness', 'server', 'index.js')]
        }
      }
    }, null, 2)
  },
  jetbrains: {
    name: 'JetBrains AI',
    configPath: (_projectDir: string) => join(homedir(), '.config', 'JetBrains', 'mcp.json'),
    config: (_projectDir: string) => JSON.stringify({
      mcpServers: {
        harness: {
          command: 'node',
          args: [join(homedir(), '.harness', 'server', 'index.js')]
        }
      }
    }, null, 2)
  },
  generic: {
    name: 'Generic MCP',
    configPath: (projectDir: string) => join(projectDir, '.harness', 'mcp-config.json'),
    config: (projectDir: string) => JSON.stringify({
      mcpServers: {
        harness: {
          command: 'node',
          args: [join(homedir(), '.harness', 'server', 'index.js')],
          env: { HARNESS_PROJECT_DIR: projectDir }
        }
      }
    }, null, 2)
  }
};

function ensureDir(dir: string): void {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function installDaemon(): void {
  const platform = process.platform;
  const serverBin = join(homedir(), '.harness', 'server', 'index.js');
  try {
    if (platform === 'darwin') {
      installLaunchd(serverBin);
    } else if (platform === 'linux') {
      installSystemd(serverBin);
    } else if (platform === 'win32') {
      installWindowsService(serverBin);
    }
  } catch (err) {
    console.warn(chalk.yellow(`  Warning: Could not auto-install daemon: ${(err as Error).message}`));
    console.warn(chalk.yellow('  Run `harness server start` manually to start the MCP server.'));
  }
}

export function registerInit(program: Command): void {
  program
    .command('init')
    .description('Initialize Harness in the current project')
    .option('-p, --provider <provider>', `Provider to configure (${Object.keys(PROVIDER_CONFIGS).join(', ')})`)
    .option('-g, --global', 'Initialize global personal harness only')
    .option('--no-daemon', 'Skip daemon auto-installation')
    .action((options: { provider?: string; global?: boolean; daemon?: boolean }) => {
      const projectDir = resolve(process.cwd());
      const harnessPersonalDir = join(homedir(), '.harness', 'personal');
      const harnessProjectDir = join(projectDir, '.harness', 'project');

      console.log(chalk.bold('\n🔧 Initializing Harness...\n'));

      ensureDir(harnessPersonalDir);
      console.log(chalk.green('✓') + ' Personal harness directory: ' + chalk.cyan(harnessPersonalDir));

      if (!options.global) {
        ensureDir(harnessProjectDir);
        console.log(chalk.green('✓') + ' Project harness directory: ' + chalk.cyan(harnessProjectDir));
      }

      if (options.provider) {
        const providerKey = options.provider.toLowerCase();
        const provider = PROVIDER_CONFIGS[providerKey];
        if (!provider) {
          console.error(chalk.red(`Unknown provider: ${options.provider}`));
          console.error(chalk.yellow(`Available: ${Object.keys(PROVIDER_CONFIGS).join(', ')}`));
          process.exit(1);
        }
        const configPath = provider.configPath(projectDir);
        const configDir = configPath.substring(0, configPath.lastIndexOf('/'));
        ensureDir(configDir);
        writeFileSync(configPath, provider.config(projectDir), 'utf-8');
        console.log(chalk.green('✓') + ` ${provider.name} config: ` + chalk.cyan(configPath));
      } else {
        console.log(chalk.dim('  No provider specified. Run `harness init --provider <name>` to configure a specific AI provider.'));
        console.log(chalk.dim(`  Available: ${Object.keys(PROVIDER_CONFIGS).join(', ')}`));
      }

      if (options.daemon !== false) {
        installDaemon();
        console.log(chalk.green('✓') + ' Daemon configured');
      }

      console.log(chalk.bold('\n✅ Harness initialized!'));
      if (!options.provider) {
        console.log(chalk.dim('\nNext steps:'));
        console.log(chalk.dim('  harness init --provider claude-code   # Configure Claude Code'));
        console.log(chalk.dim('  harness save "I prefer TypeScript"    # Save your first preference'));
        console.log(chalk.dim('  harness list                          # List all memories'));
      }
    });
}
