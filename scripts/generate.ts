#!/usr/bin/env node

import fs from "fs";
import packageJson from "../package.json";
import { AppInfo } from '../src/data/appInfo';

const appInfo: AppInfo = {
    name: packageJson.name,
    repoUrl: packageJson.repository.url,
    version: packageJson.version,
}
const rawAppInfo = JSON.stringify(appInfo, null, 2);
fs.mkdirSync("./src/generated", { recursive: true });
fs.writeFileSync("./src/generated/appInfo.json", rawAppInfo, { encoding: "utf-8" });
