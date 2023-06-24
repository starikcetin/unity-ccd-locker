import path from 'path';
import fs from 'fs';
import os from 'os';
import simpleGit, { SimpleGit } from 'simple-git';

import { Args, args } from './args';
import { UclInternalError } from './errors';
import { appInfo, appInfoSummary } from './data/appInfo';
import { acquire } from './commands/acquire';
import { clean } from './commands/clean';
import { init } from './commands/init';
import { release } from './commands/release';
import { show } from './commands/show';
import { cleanInit } from './commands/cleanInit';

export async function app() {
  console.log(appInfoSummary);

  const workDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), `${appInfo.name}-`),
  );

  try {
    const git = simpleGit({
      baseDir: workDir,
      errors(error, result) {
        return error instanceof Error
          ? Object.assign(error, { result })
          : error;
      },
    });

    // clone the repo
    await git.clone(args.repoUrl, workDir);

    await handleCommand(workDir, git);
  } finally {
    await fs.promises.rm(workDir, { recursive: true, force: true });
  }
}

async function handleCommand(workDir: string, git: SimpleGit) {
  switch (args.command) {
    case 'init':
      return init(args, workDir, git);

    case 'clean':
      return clean(args, workDir, git);

    case 'acquire':
      return acquire(args, workDir, git);

    case 'release':
      return release(args, workDir, git);

    case 'show':
      return show(args, workDir, git);

    case 'clean-init':
      return cleanInit(args, workDir, git);

    default:
      throw new UclInternalError(
        `Unknown command '${(args as Args).command}'.`,
      );
  }
}
