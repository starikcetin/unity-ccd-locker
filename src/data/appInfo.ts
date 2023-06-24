import generatedAppInfo from '../generated/appInfo.json';

export type AppInfo = {
  name: string;
  version: string;
  repoUrl: string;
};

export const appInfo: AppInfo = generatedAppInfo;
export const appInfoSummary = `${appInfo.name} version ${appInfo.version}`;
