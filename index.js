import Koa from 'koa';
import {analysis, log, exists} from './api.js';
import path from 'path';
import { createReadStream } from 'node:fs';

export default async function main(config){
  const app = new Koa();
  app.context.hosts = Object.assign(...config.virtual.filter(entry=>entry.default).map(entry=>({default: entry})), ...config.virtual.map(entry=>({[entry.name]: entry})) );
  app.use(virtualServer);
  return app;
}

async function virtualServer(ctx) {
  const host = ctx.hosts[ctx.hostname]||ctx.hosts.default;
  const request = await analysis(host.root, ctx.path); log(request);
  if(request.error) ctx.throw(request.error);
  ctx.type = path.extname(request.location);
  ctx.body = createReadStream(request.location);
}
