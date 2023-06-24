import { appInfo, appInfoSummary } from './data/appInfo';

export const epilogueText = `${appInfoSummary}\n\nFor more information, please visit: ${appInfo.repoUrl}`;
export const readmeContent = `# Unity CCD Locks\n\nThis repo is completely automated. Avoid making any manual changes.\n\n${epilogueText}`;

export const relativePaths = {
  lock: 'lock.json',
  readme: 'readme.md',
  metadata: 'metadata.json',
};

export const branchNames = {
  main: 'main',
};

export const commitMessages = {
  initialCommit: 'initial commit',
  readmeCreation: 'create readme',
  metadataCreation: 'create metadata',
  lockCreation: 'create lock',
};
