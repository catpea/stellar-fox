import Koa from 'koa';
import {analysis, log, exists} from './api.js';
import path from 'path';
import { createReadStream } from 'node:fs';

export default async function main(config){
  const virtualHosts = Object.assign(...config.virtual.map(entry=>({[entry.name]: entry})));
  const app = new Koa();
  app.use(async function(ctx, next) {
    const host = virtualHosts[ctx.hostname];
    if(host){
      const request = await analysis(host.root, ctx.path);
      log(request);
      if(!request.valid) ctx.throw(404);
      if(!request.readable) ctx.throw(404);
      ctx.type = path.extname(request.location);
      ctx.body = createReadStream(request.location);
    }else{
      ctx.throw(404);
    }
    return await next();
  });
  app.listen(process.env.PORT);
  return app;
}
