#!/usr/bin/env node
import { Command } from 'commander';
import { registerSave } from './commands/save.js';
import { registerList } from './commands/list.js';
import { registerShow } from './commands/show.js';
import { registerSearch } from './commands/search.js';
import { registerStatus } from './commands/status.js';
import { registerEdit } from './commands/edit.js';
import { registerMove } from './commands/move.js';
import { registerDelete } from './commands/delete.js';
import { registerConsolidate } from './commands/consolidate.js';
import { registerClear } from './commands/clear.js';
import { registerReset } from './commands/reset.js';
import { registerExport } from './commands/exportCmd.js';
import { registerImport } from './commands/importCmd.js';
import { registerServerCommands } from './commands/server.js';
import { registerInit } from './commands/init.js';
import { registerConfig } from './commands/config.js';

const program = new Command();

program
  .name('harness')
  .description('Provider-agnostic AI memory and learning system')
  .version('0.1.0');

registerInit(program);
registerConfig(program);
registerSave(program);
registerList(program);
registerShow(program);
registerSearch(program);
registerStatus(program);
registerEdit(program);
registerMove(program);
registerDelete(program);
registerConsolidate(program);
registerClear(program);
registerReset(program);
registerExport(program);
registerImport(program);
registerServerCommands(program);

program.parse();
