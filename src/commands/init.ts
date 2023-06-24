import { SimpleGit } from 'simple-git';
import path from 'path';

import { InitArgs } from '../args';
import {
  getBranchNameOfHeadRef,
  getLogSafeWithDiffs,
  getOldestCommit,
  hasValue,
  isMainBranch,
  isValidMainInitialCommit,
  writeFile,
} from '../utils';
import {
  branchNames,
  commitMessages,
  readmeContent,
  relativePaths,
} from '../consts';
import { metadata } from '../data/metadata';
import { UclFailureError } from '../errors';

export async function init(args: InitArgs, workingDir: string, git: SimpleGit) {
  const readmePath = path.join(workingDir, relativePaths.readme);
  const metadataPath = path.join(workingDir, relativePaths.metadata);

  // refuse if main is not default branch
  const defaultBranch = await getBranchNameOfHeadRef(git);
  if (defaultBranch !== branchNames.main) {
    throw new UclFailureError(
      `Default branch is not '${branchNames.main}'. Default branch: '${defaultBranch}'`,
    );
  }

  // refuse if there are branches other than main
  const branches = await git.branch();
  if (!branches.all.every(isMainBranch)) {
    throw new UclFailureError(
      `Branches other than ${branchNames.main} exist. Branches: '${branches.all}'`,
    );
  }

  const mainLog = await getLogSafeWithDiffs(git);

  // refuse if has more than one commit
  if (mainLog.total > 1) {
    throw new UclFailureError(
      `${branchNames.main} branch has more than one commit. Commit count: ${mainLog.total}`,
    );
  }

  // ensure initial commit:
  // if no initial commit -> create
  // if invalid initial commit -> refuse
  // if valid initial commit -> do nothing
  const mainInitialCommit = getOldestCommit(mainLog);

  if (hasValue(mainInitialCommit)) {
    if (!isValidMainInitialCommit(mainInitialCommit)) {
      throw new UclFailureError(
        `${branchNames.main} branch initial commit is not in the required format. Initial commit SHA: ${mainInitialCommit.hash}`,
      );
    }
  } else {
    await git.commit(commitMessages.initialCommit, { '--allow-empty': null });
  }

  // create readme
  await writeFile(readmePath, readmeContent);

  // commit and push
  await git.add(readmePath);
  await git.commit(commitMessages.readmeCreation);
  await git.push('origin', branchNames.main, { '--set-upstream': null });

  // create metadata branch
  await git.checkoutLocalBranch('metadata');

  // create metadata file
  await writeFile(metadataPath, metadata.serialize(metadata.create()));

  // commit and push
  await git.add(metadataPath);
  await git.commit(commitMessages.metadataCreation);
  await git.push('origin', 'metadata', { '--set-upstream': null });
}
