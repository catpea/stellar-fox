import Koa from 'koa';
import {analysis, log, exists} from './api.js';
import path from 'path';
import {kebabCase} from 'lodash-es';
import morgan from 'koa-morgan';
import { createReadStream } from 'fs';
const logger = morgan('combined');

export default async function main(conf){
  const app = new Koa(conf.koa);
  app.context.conf = conf;
  app.context.hosts = Object.assign(...conf.virtual.filter(entry=>entry.default).map(entry=>({default: entry})), ...conf.virtual.map(entry=>({[entry.name]: entry})) );
  Object.entries(conf.morgan.tokens).map(([key, val])=>morgan.token(kebabCase(key), (req, res) => req.headers[val]));
  app.use(morgan('combined', { skip: (req, res) => { return !conf.morgan.enabled } }))
  app.use(virtualServer);
  return app;
}

async function virtualServer(ctx) {

  if (ctx.conf.debug && ctx.path=='/header') return ctx.body = ctx.request.header;
  if (ctx.conf.debug && ctx.path=='/ip') return ctx.body = {ip: ctx.request.ip};

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
