import path from 'path';
import { SimpleGit } from 'simple-git';
import { machine } from 'node-unique-machine-id';

import { writeFile, readFile, getBucketBranchName } from '../utils';
import { relativePaths, commitMessages } from '../consts';
import { lockdata } from '../data/lockdata';
import { ShowArgs } from '../args';

export async function show(args: ShowArgs, workingDir: string, git: SimpleGit) {
  const bucketBranchName = getBucketBranchName(args);
  const lockPath = path.join(workingDir, relativePaths.lock);
  const localActorId = await machine();

  // check if bucket branch exists on remote
  const branches = await git.branch();
  if (branches.all.includes(`remotes/origin/${bucketBranchName}`)) {
    // checkout bucket branch
    await git.checkout(bucketBranchName);
  } else {
    // create bucket branch
    await git.checkoutLocalBranch(bucketBranchName);

    // create lockdata
    const initialLockdata = lockdata.create(localActorId);
    const initialRawLockdata = lockdata.serialize(initialLockdata);
    await writeFile(lockPath, initialRawLockdata);

    // commit and push
    await git.add(lockPath);
    await git.commit(commitMessages.lockCreation);
    await git.push(['-u', 'origin', bucketBranchName]);
  }

  // read lockdata
  const currentRawLockdata = await readFile(lockPath);
  const currentLockdata = lockdata.parse(currentRawLockdata);

  // print
  console.log();
  console.log(`Locked: ${currentLockdata.isLocked}`);
  console.log(`Actor: ${currentLockdata.actorId}`);
  console.log(`Timestamp: ${currentLockdata.timestamp}`);
  console.log(`Message: ${currentLockdata.message}`);
  console.log();
}
