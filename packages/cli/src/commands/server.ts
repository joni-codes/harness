import type { Command } from 'commander';
import { existsSync } from 'fs';
import { join } from 'path';
import { readFile } from 'fs/promises';
import { homedir } from 'os';
import { installLaunchd, uninstallLaunchd, statusLaunchd } from '../daemon/launchd.js';
import { installSystemd, uninstallSystemd, statusSystemd } from '../daemon/systemd.js';
import { installWindowsService, uninstallWindowsService, statusWindowsService } from '../daemon/windowsService.js';
import chalk from 'chalk';

function getServerBin(): string {
  return join(homedir(), '.harness', 'server', 'index.js');
}

async function install(serverBin: string): Promise<void> {
  if (process.platform === 'darwin') return installLaunchd(serverBin);
  if (process.platform === 'linux') return installSystemd(serverBin);
  installWindowsService(serverBin);
}

function uninstall(): void {
  if (process.platform === 'darwin') return uninstallLaunchd();
  if (process.platform === 'linux') return uninstallSystemd();
  uninstallWindowsService();
}

function getStatus(): string {
  if (process.platform === 'darwin') return statusLaunchd();
  if (process.platform === 'linux') return statusSystemd();
  return statusWindowsService();
}

export function registerServerCommands(program: Command): void {
  const server = program.command('server').description('Manage the harness daemon (power users)');

  server.command('start').action(async () => {
    await install(getServerBin());
    console.log(chalk.green('Harness server started.'));
  });

  server.command('stop').action(() => {
    uninstall();
    console.log(chalk.green('Harness server stopped.'));
  });

  server.command('status').action(() => {
    console.log(getStatus());
  });

  server.command('logs').action(async () => {
    const logPath = join(homedir(), '.harness', 'server.log');
    if (!existsSync(logPath)) { console.log('No logs yet.'); return; }
    const logs = await readFile(logPath, 'utf8');
    console.log(logs.split('\n').slice(-50).join('\n'));
  });
}
