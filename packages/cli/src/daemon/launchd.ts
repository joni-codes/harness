import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';

const PLIST_LABEL = 'com.harness.server';
const PLIST_PATH = join(homedir(), 'Library', 'LaunchAgents', `${PLIST_LABEL}.plist`);

export async function installLaunchd(serverBin: string): Promise<void> {
  const harnessDir = join(homedir(), '.harness');
  await mkdir(join(homedir(), 'Library', 'LaunchAgents'), { recursive: true });
  await mkdir(harnessDir, { recursive: true });

  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>${PLIST_LABEL}</string>
  <key>ProgramArguments</key>
  <array><string>${serverBin}</string></array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>HARNESS_PROJECT_DIR</key><string>${process.cwd()}</string>
  </dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>${join(harnessDir, 'server.log')}</string>
  <key>StandardErrorPath</key><string>${join(harnessDir, 'server-error.log')}</string>
</dict>
</plist>`;

  await writeFile(PLIST_PATH, plist, 'utf8');
  execSync(`launchctl load ${PLIST_PATH}`);
}

export function uninstallLaunchd(): void {
  if (existsSync(PLIST_PATH)) {
    try { execSync(`launchctl unload ${PLIST_PATH}`); } catch { /* ignore */ }
    execSync(`rm ${PLIST_PATH}`);
  }
}

export function statusLaunchd(): string {
  try {
    return execSync(`launchctl list ${PLIST_LABEL} 2>&1`).toString();
  } catch {
    return 'not running';
  }
}
