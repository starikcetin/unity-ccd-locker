import { SimpleGit } from 'simple-git';

import { CleanInitArgs } from '../args';
import { rmAllChildren } from '../utils';
import { clean } from './clean';
import { init } from './init';

export async function cleanInit(
  args: CleanInitArgs,
  workingDir: string,
  git: SimpleGit,
) {
  await clean({ ...args, command: 'clean' }, workingDir, git);

  // delete everything and clone again
  await rmAllChildren({ dir: workingDir });
  await git.clone(args.repoUrl, workingDir);

  await init({ ...args, command: 'init' }, workingDir, git);
}
