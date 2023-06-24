import fs from 'fs';
import path from 'path';
import * as semver from 'semver';

import { LogOptions, LogResult, SimpleGit, TaskOptions } from 'simple-git';
import { branchNames, commitMessages } from './consts';
import { BucketLocationArgs } from 'args';
import { UclFailureError } from './errors';

type NotNullOrUndef<T> = T extends null | undefined ? never : T;
type LogResultCommit = NotNullOrUndef<LogResult['latest']>;
type LogOptionsParam = TaskOptions | LogOptions;

export function hasValue<T>(x: T | null | undefined): x is T {
  return x !== null && x !== undefined;
}

export function isValidSemver(version: string): boolean {
  return semver.valid(version) !== null;
}

export function isValidTimestamp(timestamp: number): boolean {
  return timestamp > 0;
}

export function isValidActorId(actorId: string): boolean {
  return actorId.length > 0;
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function readFile(path: string): Promise<string> {
  return fs.promises.readFile(path, { encoding: 'utf-8' });
}

export function writeFile(path: string, content: string): Promise<void> {
  return fs.promises.writeFile(path, content, { encoding: 'utf-8' });
}

export function getErrorMessage(e: any): string {
  if (!hasValue(e)) {
    return 'Unknown error.';
  }

  if (e instanceof Error) {
    return e.message;
  }

  return e;
}

/** This is like `git.log(...)` but it doesn't throw if there are no commits yet. */
export async function getLogSafe(
  git: SimpleGit,
  options?: LogOptionsParam,
): Promise<LogResult> {
  try {
    return await git.log(options);
  } catch (error: any) {
    // if it is the 'fatal: your current branch 'xxx' does not have any commits yet' error, then no commits
    if (error?.result?.exitCode === 128) {
      return { total: 0, latest: null, all: [] };
    }
    throw error;
  }
}

/** Same as `getLogSafe(...)`, but passes option `--stat=4096` which includes diff data in result. Do not pass any stat-inducing options. */
export async function getLogSafeWithDiffs(
  git: SimpleGit,
  options?: LogOptionsParam,
): Promise<LogResult> {
  return getLogSafe(git, { ...options, '--stat': 4096 });
}

/** Returns the oldest commit in the log result, or null if no commits. */
export function getOldestCommit(logResult: LogResult): LogResultCommit | null {
  return logResult.all.length > 0
    ? logResult.all[logResult.all.length - 1]
    : null;
}

/** Returns whether the given branch is the main branch, local or remote. */
export function isMainBranch(branchName: string) {
  return [branchNames.main, `remotes/origin/${branchNames.main}`].includes(
    branchName,
  );
}

/**
 * Returns whether the given commit is a valid main branch initial commit made by this tool.
 *
 * IMPORTANT: The log must be taken with diff data, otherwise this function will return false-positives!
 * Use `getLogWithDiffsSafe(...)` or pass in an argument such as `--stat=4096` to the log.
 */
export function isValidMainInitialCommit(commit: LogResultCommit) {
  const isEmpty = !hasValue(commit.diff) || commit.diff.files.length === 0;
  return isEmpty && commit.message === commitMessages.initialCommit;
}

/** Returns the name of the branch that HEAD is currently pointing at. This is the default branch name immediately after a clone. */
export async function getBranchNameOfHeadRef(git: SimpleGit): Promise<string> {
  const headRef = (await git.raw(['symbolic-ref', 'HEAD'])).trim();
  if (!headRef.startsWith('refs/heads/')) {
    throw new UclFailureError(
      `HEAD is not pointing to a branch. HEAD: ${headRef}`,
    );
  }
  return headRef.slice('refs/heads/'.length);
}

export function getBucketBranchName(args: BucketLocationArgs) {
  return `locks/project__${args.projectId}/environment__${args.envId}/bucket__${args.bucketId}`;
}

/** Removes all immediate items under given root path except ones that have the given names. */
export async function rmAllChildren(params: {
  dir: string;
  except?: string[];
}) {
  const { dir, except: except = [] } = params;

  const items = await fs.promises.readdir(dir, {
    withFileTypes: true,
  });

  return Promise.all(
    items.map(async (item) => {
      if (!except.includes(item.name)) {
        const itemPath = path.join(dir, item.name);
        await fs.promises.rm(itemPath, { recursive: true });
      }
    }),
  );
}
