import Koa from 'koa';
import {analysis, log, exists} from './api.js';
import path from 'path';
import morgan from 'koa-morgan';
import { createReadStream } from 'fs';
const logger = morgan('combined');

export default async function main(conf){
  const app = new Koa(conf.koa);
  app.context.conf = conf;
  app.context.hosts = Object.assign(...conf.virtual.filter(entry=>entry.default).map(entry=>({default: entry})), ...conf.virtual.map(entry=>({[entry.name]: entry})) );
  app.use(morgan('combined'))
  app.use(virtualServer);
  return app;
}


async function virtualServer(ctx) {

  // request analysis
  const host = ctx.hosts[ctx.hostname]||ctx.hosts.default;
  const request = await analysis(host.root, ctx.path); log(request);

  // smart redirects
  if (ctx.conf.debug && request.error) ctx.throw(request.error);
  if (!ctx.conf.debug && request.error) return ctx.redirect('/');
  if (request.redirect) ctx.redirect(request.redirect);
  
  // default response
  ctx.type = path.extname(request.location);
  const dataStream = createReadStream(request.location);
  dataStream.on('error',(err)=>log(err));
  ctx.body = dataStream;

}
