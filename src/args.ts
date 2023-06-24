import yargs from 'yargs';

import { epilogueText } from './consts';
import { hasValue } from './utils';
import { appInfo } from './data/appInfo';
import { UclInternalError } from './errors';

export type CommonArgs = {
  repoUrl: string;
};

export type BucketLocationArgs = {
  projectId: string;
  envId: string;
  bucketId: string;
};

export type InitArgs = CommonArgs & {
  command: 'init';
};

export type CleanArgs = CommonArgs & {
  command: 'clean';
};

export type CleanInitArgs = OmitCommand<CleanArgs> &
  OmitCommand<InitArgs> & {
    command: 'clean-init';
  };

export type AcquireArgs = CommonArgs &
  BucketLocationArgs & {
    command: 'acquire';
    force: boolean;
    message: string;
  };

export type ReleaseArgs = CommonArgs &
  BucketLocationArgs & {
    command: 'release';
    force: boolean;
    message: string;
  };

export type ShowArgs = CommonArgs &
  BucketLocationArgs & {
    command: 'show';
  };

export type Args =
  | InitArgs
  | CleanArgs
  | CleanInitArgs
  | AcquireArgs
  | ReleaseArgs
  | ShowArgs;
export type Command = Args['command'];

type AllPossibleKeysOf<T> = T extends T ? keyof T : never;
type ArgKeys = Exclude<AllPossibleKeysOf<Args>, 'command'>;
type ArgConfigs = Record<ArgKeys, yargs.Options>;
type OmitCommand<T> = Omit<T, 'command'>;

const argConfigs = {
  projectId: {
    type: 'string',
    alias: 'p',
    demandOption: true,
    description: 'CCD project ID.',
  },
  envId: {
    type: 'string',
    alias: 'e',
    demandOption: true,
    description: 'CCD environment ID.',
  },
  bucketId: {
    type: 'string',
    alias: 'b',
    demandOption: true,
    description: 'CCD bucket ID.',
  },
  force: {
    type: 'boolean',
    alias: 'f',
    demandOption: false,
    description: 'Bypass safety checks.',
    default: false,
  },
  message: {
    type: 'string',
    alias: 'm',
    demandOption: true,
    description: 'The message to associate with the operation.',
  },
  repoUrl: {
    type: 'string',
    alias: 'u',
    demandOption: true,
    description: 'The URL of the locks repository.',
  },
} as const satisfies ArgConfigs;

export const args: Args = parse();

function parse(): Args {
  let args: Args | null = null;

  yargs(process.argv.slice(2))
    .help('help')
    .alias('help', 'h')
    .alias('help', '?')
    .version(appInfo.version)
    .alias('version', 'v')
    .config('config')
    .alias('config', 'c')
    .string('config')
    .options({
      repoUrl: argConfigs.repoUrl,
    })
    .command(
      ['init', 'i'],
      'Initialize the repository as a locks repository.',
      (yargs) => yargs.epilogue(epilogueText),
      (argv) => {
        args = { ...argv, command: 'init' };
      },
    )
    .command(
      ['clean', 'x'],
      `Delete everything in a locks repository.`,
      (yargs) => yargs.epilogue(epilogueText),
      (argv) => {
        args = { ...argv, command: 'clean' };
      },
    )
    .command(
      ['clean-init', 'xi'],
      `Perform a clean, followed by an init.`,
      (yargs) => yargs.epilogue(epilogueText),
      (argv) => {
        args = { ...argv, command: 'clean-init' };
      },
    )
    .command(
      ['acquire', 'a'],
      'Acquire the lock for a bucket.',
      (yargs) =>
        yargs
          .options({
            projectId: argConfigs.projectId,
            envId: argConfigs.envId,
            bucketId: argConfigs.bucketId,
            force: argConfigs.force,
            message: argConfigs.message,
          })
          .epilogue(epilogueText),
      (argv) => {
        args = { ...argv, command: 'acquire' };
      },
    )
    .command(
      ['release', 'r'],
      'Release the lock on a bucket.',
      (yargs) =>
        yargs
          .options({
            projectId: argConfigs.projectId,
            envId: argConfigs.envId,
            bucketId: argConfigs.bucketId,
            force: argConfigs.force,
            message: argConfigs.message,
          })
          .epilogue(epilogueText),
      (argv) => {
        args = { ...argv, command: 'release' };
      },
    )
    .command(
      ['show', 's'],
      'Print the lock status of a bucket.',
      (yargs) =>
        yargs
          .options({
            projectId: argConfigs.projectId,
            envId: argConfigs.envId,
            bucketId: argConfigs.bucketId,
          })
          .epilogue(epilogueText),
      (argv) => {
        args = { ...argv, command: 'show' };
      },
    )
    .strictCommands()
    .demandCommand(1, 1)
    .recommendCommands()
    .epilogue(epilogueText)
    .wrap(Math.min(90, yargs.terminalWidth()))
    .parse();

  if (!hasValue<Args>(args)) {
    throw new UclInternalError(`Could not parse arguments.`);
  }

  return args;
}
