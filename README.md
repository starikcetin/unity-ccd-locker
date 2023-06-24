# Unity CCD Locker

A git-based locking mechanism for Unity CCD bucket operations. Can be used to prevent simultaneous operations.

## Requirements

- Node.js version `8.0.0` or higher.
- You have Git installed and it is in your PATH.

## Installation

```sh
npm i -g unity-ccd-locker
```

## Usage

```
unity-ccd-locker <command> <arguments>
```

You can also call `ucl` instead of `unity-ccd-locker`.

### Setup a locks repository

`unity-ccd-locker` requires a git reposiory to store the locks. :

1. Create an empty repository.
2. Run `unity-ccd-locker init --repoUrl <REPO URL>`.
3. (Optional) Set up a config file to prevent providing all arguments in the command line every time.

Notes:

- You only need to perform the setup once per locks repository.
- You can use the same locks repository for everything. You can also have multiple locks repositories for different purposes.
- Do not use the locks repositories for any purpose other than `unity-ccd-locker` usage.
- It is highly recommended to use brand new empty repositories for setup. However, you can use existing repositories as well. If you are using an existing repository, run `unity-ccd-locker clean-init` instead of `unity-ccd-locker init`.

### Working with locks

After you have a repo set up, then you can work with locks. This is the recommended workflow:

1. Acquire the lock on a bucket.
2. Perform any CCD operations you wish.
3. Release the lock on the bucket.

### Cleaning a locks repository

If your locks repository got corrupted, or if for some reason you want to start over, you can clean it by running `unity-ccd-locker clean --repoUrl <REPO URL>`. This will delete everything in the repository except the main branch and the initial commit. 

Notes:
- After cleaning, a locks repository needs to be setup again before usage.
- If you want to clean and re-setup the repository in one go, you can use `unity-ccd-locker clean-init` instead of running `unity-ccd-locker clean` followed by `unity-ccd-locker init`.

### Commands

| Name         | Aliases | Description                                      |
| ---          | ---     | ---                                              |
| `init`       | `i`     | Initialize the repository as a locks repository. |
| `clean`      | `x`     | Delete everything in a locks repository.         |
| `clean-init` | `xi`    | Perform a clean, followed by an init.            |
| `acquire`    | `a`     | Acquire the lock for a bucket.                   |
| `release`    | `r`     | Release the lock on a bucket.                    |
| `show`       | `s`     | Print the lock status of a bucket.               |

### Arguments

| Name          | Aliases    | Type   | Required          | Description                                  |
| ---           | ---        | ---    | ---               | ---                                          |
| `--help`      | `-h`, `-?` | flag   | No                | Print help.                                  |
| `--version`   | `-v`       | flag   | No                | Print version info.                          |
| `--config`    | `-c`       | string | No                | Path to a JSON config file.                  |
| `--repoUrl`   | `-u`       | string | Yes               | The URL of the locks repository.             |
| `--projectId` | `-p`       | string | For lock commands | CCD project ID.                              |
| `--envId`     | `-e`       | string | For lock commands | CCD environment ID.                          |
| `--bucketId`  | `-b`       | string | For lock commands | CCD bucket ID.                               |
| `--message`   | `-m`       | string | For lock commands | The message to associate with the operation. |
| `--force`     | `-f`       | flag   | No                | Bypass safety checks.                        |

Lock commands = `acquire`, `release`, `show`

### Config Files

You can optionally have a JSON config file that you can pass with the `--config` argument that defines some of the arguments in it, so you don't have to write them all the time. 

Keys should correspond to argument names without the dashes. This is how it should look like:

```json
{
	"repoUrl": "<URL OF THE LOCKS REPO>",
	"projectId": "<YOUR PROJECT ID>",
	"envId": "<YOUR ENVIRONMENT ID>"
}
```

Notes:

- Arguments provided in the CLI have a higher priority than the arguments provided in the config file. This means that if the same argument is provided in both, then the CLI argument will be used.

## Motivation

CCD misbehaves when doing simultaneous operations on the same bucket. If you have ever seen one of these errors, then you very well know what I am talking about:

```
Error! The state of the bucket changed unexpectedly. Please retry this operation.
```

```
You have an entry specified, but the matching file has not been uploaded, or the file size, or md5 hash of what was uploaded does not match
```

Sometimes simply retrying works. Other times however, the bucket state gets corrupted and no further operations work properly.

This tool provides a way for you to have _locks_ on buckets, just like how some source control software allows you to lock files to prevent other people from changing them, or how an OS provides file locks to prevent files being altered by multiple processes.

## License

MIT License. Refer to the [LICENSE.md](LICENSE.md) file.

Copyright (c) 2023 [S. Tarık Çetin](https://github.com/starikcetin)
