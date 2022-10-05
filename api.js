import fs from 'fs/promises';
import {constants} from 'fs';
import path from 'path';
export {analysis, log, exists};

async function analysis(root, file){

  const response = {
    error: null,
    location: path.join(path.resolve(root), path.resolve(file)),
  };

  // resolve the path (including "../") and check is frags still begin with a dot.
  if (path.resolve(file).split(path.sep).some(frag => frag.startsWith('.'))) {
    response.message = 'Hidden files are not accessible.';
    response.error = 401;
    return response;
  }

  log('Existence of requested location');
  const readable = await exists(response.location);
  if(!readable){
    response.message = 'Location does not exist';
    response.error = 404;
    return response;
  }

  // Only allow files and directories
  const target = await fs.stat(response.location);
  const valid = (target.isFile()||target.isDirectory());
  if(!valid){
    response.message = 'Neither file nor directory';
    response.error = 400;
    return response;
  }

  const trailingSlash = file.endsWith("/");
  const missingSlash = (target.isDirectory()&&!trailingSlash);
  if(missingSlash){
    response.redirect = file + '/';
  }

  // Demand index.html for directories.
  if(target.isDirectory()) response.location = path.join(response.location, 'index.html');
  const presentable = await exists(response.location);
  if(!presentable){
    response.message = 'No index file in directory';
    response.error = 403;
    return response;
  }

  return response
}

function log (...a){
  if(process.env.DEBUG) console.log(`[${(new Date()).toISOString()}]`,...a);
}

async function exists(target){
  try {
    await fs.access(target, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
