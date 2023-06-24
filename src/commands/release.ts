import path from 'path';
import { SimpleGit } from 'simple-git';
import { machine } from 'node-unique-machine-id';

import { ReleaseArgs } from '../args';
import { commitMessages, relativePaths } from '../consts';
import { getBucketBranchName, readFile, writeFile } from '../utils';
import { Lockdata, lockdata } from '../data/lockdata';
import { UclFailureError } from '../errors';

export async function release(
  args: ReleaseArgs,
  workingDir: string,
  git: SimpleGit,
) {
  const bucketBranchName = getBucketBranchName(args);
  const lockPath = path.join(workingDir, relativePaths.lock);
  const localActorId = await machine();
  let forceful = false;

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

  // exit if not locked
  // reject if locked by someone else
  if (!currentLockdata.isLocked) {
    console.log(`Not locked.`);
    if (args.force) {
      console.log(`Forcefully overwriting.`);
      forceful = true;
    } else {
      return;
    }
  } else if (currentLockdata.actorId !== localActorId) {
    console.log(`Locked by a foreign actor.`);
    if (args.force) {
      console.log(`Forcefully overwriting.`);
      forceful = true;
    } else {
      throw new UclFailureError(`Refusing to overwrite without --force.`);
    }
  }

  // write new lockdata
  const newLockdata: Lockdata = {
    isLocked: false,
    actorId: localActorId,
    message: args.message,
    timestamp: Date.now(),
  };
  const newRawLockdata = lockdata.serialize(newLockdata);
  await writeFile(lockPath, newRawLockdata);

  // commit and push
  await git.add(lockPath);
  await git.commit(`release\nforceful: ${forceful}\n${args.message}`);
  await git.push(['-u', 'origin', bucketBranchName]);
}
