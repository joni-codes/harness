import { execSync } from 'child_process';

const SERVICE_NAME = 'HarnessServer';

export function installWindowsService(serverBin: string): void {
  execSync(`sc create ${SERVICE_NAME} binPath= "${serverBin}" start= auto`);
  execSync(`sc start ${SERVICE_NAME}`);
}

export function uninstallWindowsService(): void {
  try { execSync(`sc stop ${SERVICE_NAME}`); } catch { /* ignore */ }
  try { execSync(`sc delete ${SERVICE_NAME}`); } catch { /* ignore */ }
}

export function statusWindowsService(): string {
  try {
    return execSync(`sc query ${SERVICE_NAME} 2>&1`).toString();
  } catch {
    return 'not running';
  }
}
