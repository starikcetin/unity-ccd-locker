#!/usr/bin/env node

import { app } from './app';
import { UclFailureError, UclInternalError } from './errors';
import { appInfo } from './data/appInfo';

app()
  .then(() => {
    console.log('Success.');
    process.exit(0);
  })
  .catch((e) => {
    handleFailure(e);
    process.exit(1);
  });

function handleFailure(e: any) {
  let isBug = false;

  if (e instanceof UclInternalError) {
    console.log('\nInternal error:', e);
    isBug = true;
  } else if (e instanceof UclFailureError) {
    console.log('Failure:', e.message);
  } else if (e instanceof Error) {
    console.log('\nThird party error:', e);
    isBug = true;
  } else {
    console.log('\nUnknown error:', new String(e));
    isBug = true;
  }

  if (isBug) {
    console.log(
      `\nThis is likely a bug. Please report by opening an issue at: ${appInfo.repoUrl}\n`,
    );
  }
}
