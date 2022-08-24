import { appendFile } from 'fs';
import { rm } from 'fs/promises';
import { join } from 'path';
import { DataSource } from 'typeorm';

global.beforeEach(async () => {
  try {
    await rm(join(__dirname, '..', 'test.sqlite'));
  } catch {}
});
