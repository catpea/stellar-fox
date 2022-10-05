import { strict as assert } from 'assert';
import sf from './index.js';
const conf = {
  
  koa:{
    proxy: true,
    proxyIpHeader: 'x-forwarded-for',
  },

  morgan:{
    enabled: true,
    tokens: {
      remoteAddr: 'x-forwarded-for',
    },
  },

  virtual:[
    { 
      name: 'stellar-fox.tld',
      root:'fake-www',
      default: true
    }
  ]
  
};
import supertest from 'supertest';
const server = (await sf(conf)).listen(process.env.PORT);
const request = supertest.agent(server);

describe('Debug Virtual Host', () => {
  before(() => {
    conf.debug = true;
    conf.morgan.enabled = false;
  });
  after(() => server.close());
  describe('default vhost behavior', () => {
    describe('when requests', () => {
      it('koa\'s ctx.request.ip should return ip from x-forwarded-for', done => { request.get('/ip') .set('x-forwarded-for','69.69.69.69') .set('Host', '127.0.0.1') .expect(res => assert.equal(res.body.ip, '69.69.69.69')) .expect(200, done) });
      it('should 401/unauthorized for dot files/dirs', done => { request.get('/abc/.secret/passwords.txt').set('x-forwarded-for','69.69.69.69').set('Host', '127.0.0.1').expect(401, done) });
      it('should 200 for index.html', done => { request.get('/').set('x-forwarded-for','69.69.69.69').set('Host', '127.0.0.1').expect(200, done) });
      it('should 200 for image/jpeg portfolio.jpg', done => { request.get('/abc/little.jpg').set('x-forwarded-for','69.69.69.69').set('Host', 'catpea.com').expect('Content-Type', "image/jpeg").expect(200, done) });
      it('should 404 for gibberish', done => { request.get('/b98e89b2-47fd-4f54-96b1-13eeff7a2cf5').set('x-forwarded-for','69.69.69.69').set('Host', '127.0.0.1').expect(404, done) });
      it('should 403 for folder without index.html', done => { request.get('/empty-directory').set('x-forwarded-for','69.69.69.69').set('Host', '127.0.0.1').expect(403, done) });
      it('should redirect for dir without slash', done => { request.get('/abc').set('x-forwarded-for','69.69.69.69').set('Host', '127.0.0.1').expect('Location', "/abc/").expect(302, done) });
    });
  });
});

describe('Live Virtual Host Behavior', () => {
  before(() => {
    conf.debug = false;
    conf.morgan.enabled = false;
  });
  after(() => server.close());
  describe('default vhost behavior', () => {
    describe('when requests', () => {
      it('should 200 for index.html', done => { request.get('/').set('x-forwarded-for','69.69.69.69').set('Host', '127.0.0.1').expect(200, done) });
      it('should 200 for image/jpeg portfolio.jpg', done => { request.get('/abc/little.jpg').set('x-forwarded-for','69.69.69.69').set('Host', 'catpea.com').expect('Content-Type', "image/jpeg").expect(200, done) });
      it('should not 404 for gibberish', done => { request.get('/b98e89b2-47fd-4f54-96b1-13eeff7a2cf5').set('x-forwarded-for','69.69.69.69').set('Host', '127.0.0.1').expect('Location', "/").expect(302, done) });
      it('should not 403 for folder without index.html', done => { request.get('/empty-directory').set('x-forwarded-for','69.69.69.69').set('Host', '127.0.0.1').expect('Location', "/").expect(302, done) });
      it('should redirect for dir without slash', done => { request.get('/abc').set('x-forwarded-for','69.69.69.69').set('Host', '127.0.0.1').expect('Location', "/abc/").expect(302, done) });
      
    });
  });
});

 