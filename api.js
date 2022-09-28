import fs from 'node:fs/promises';
import {constants} from 'node:fs/promises';
import path from 'path';

export {analysis, log, exists};

async function analysis(root, file){

  const response = {
    valid: false,
    readable: false,
    location: path.join(path.resolve(root), path.resolve(file)),
  };

  response.readable = await exists(response.location);
  if(!response.readable) return response;

  const target = await fs.stat(response.location);
  response.valid = target.isFile()||target.isDirectory();
  if(!response.valid) return response;


  if(target.isDirectory()){
    response.location = path.join(response.location, 'index.html');
    response.readable = await exists(response.location);
    if(!response.readable) return response;
  }

  return response
}

function log (...a){
  if(process.env.DEBUG) console.log(`[${(new Date()).toISOString()}]`,...a);
}

async function exists(target){
  try {
    log(target);
    await fs.access(target, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
