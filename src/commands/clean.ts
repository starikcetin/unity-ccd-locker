import { SimpleGit } from 'simple-git';

import { CleanArgs } from '../args';
import { branchNames, commitMessages } from '../consts';
import {
  getBranchNameOfHeadRef,
  getLogSafe,
  getOldestCommit,
  hasValue,
  isMainBranch,
  rmAllChildren,
} from '../utils';
import { UclFailureError, UclInternalError } from '../errors';

export async function clean(
  args: CleanArgs,
  workingDir: string,
  git: SimpleGit,
) {
  const defaultBranch = await getBranchNameOfHeadRef(git);
  // NOTE: log has no diff data!
  const defaultBranchLog = await getLogSafe(git);

  // make sure that if the default branch is not main, it doesn't have any commits
  if (!isMainBranch(defaultBranch)) {
    // if there are no commits then checkout main, otherwise throw
    if (defaultBranchLog.total > 0) {
      throw new UclFailureError(
        `Default branch is not '${branchNames.main}' and it has commits. Default branch: '${defaultBranch}'`,
      );
    } else {
      await git.checkoutLocalBranch(branchNames.main);
    }
  }

  // delete all branches except main on local and remote
  const branches = await git.branch();
  await Promise.all(
    branches.all.map(async (branch) => {
      if (branch.startsWith('remotes/origin/')) {
        const asLocal = branch.slice('remotes/origin/'.length);
        if (asLocal !== branchNames.main) {
          await git.push('origin', `:${asLocal}`);
        }
      } else {
        if (branch !== branchNames.main) {
          await git.deleteLocalBranch(branch, true);
        }
      }
    }),
  );

  // delete all tags on local and remote
  const tags = await git.tags();
  await Promise.all(
    tags.all.map(async (tag) => {
      await git.raw(['tag', '-d', tag]);
      await git.push('origin', `:${tag}`);
    }),
  );

  // ensure initial commit
  // no initial commit -> create it
  // initial commit exists -> reset to it
  // NOTE: log has no diff data!
  const mainLog = await getLogSafe(git);
  if (mainLog.total < 1) {
    await git.commit(commitMessages.initialCommit, { '--allow-empty': null });
  } else {
    const initialCommit = getOldestCommit(mainLog);

    if (!hasValue(initialCommit)) {
      throw new UclInternalError(`No initial commit.`);
    }

    await git.reset(['--hard', initialCommit.hash]);
  }

  // delete everything in the working directory except .git
  await rmAllChildren({ dir: workingDir, except: ['.git'] });

  // amend the initial commit
  await git.add(workingDir);
  await git.commit(commitMessages.initialCommit, {
    '--amend': null,
    '--allow-empty': null,
  });

  // push the amended initial commit
  await git.push('origin', branchNames.main, { '--force': null });
}
