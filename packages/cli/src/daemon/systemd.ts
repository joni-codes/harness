import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';

const SERVICE_NAME = 'harness-server';
const SERVICE_PATH = join(homedir(), '.config', 'systemd', 'user', `${SERVICE_NAME}.service`);

export async function installSystemd(serverBin: string): Promise<void> {
  const harnessDir = join(homedir(), '.harness');
  await mkdir(join(homedir(), '.config', 'systemd', 'user'), { recursive: true });
  await mkdir(harnessDir, { recursive: true });

  const unit = `[Unit]
Description=Harness MCP Server

[Service]
ExecStart=${serverBin}
Restart=always
Environment=HARNESS_PROJECT_DIR=${process.cwd()}
StandardOutput=append:${join(harnessDir, 'server.log')}
StandardError=append:${join(harnessDir, 'server-error.log')}

[Install]
WantedBy=default.target
`;
  await writeFile(SERVICE_PATH, unit, 'utf8');
  execSync(`systemctl --user daemon-reload && systemctl --user enable --now ${SERVICE_NAME}`);
}

export function uninstallSystemd(): void {
  if (existsSync(SERVICE_PATH)) {
    try { execSync(`systemctl --user disable --now ${SERVICE_NAME}`); } catch { /* ignore */ }
    execSync(`rm ${SERVICE_PATH}`);
  }
}

export function statusSystemd(): string {
  try {
    return execSync(`systemctl --user status ${SERVICE_NAME} 2>&1`).toString();
  } catch {
    return 'not running';
  }
}
