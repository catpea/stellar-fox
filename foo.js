import path from 'path';

const x = path.resolve('../../../../asdas.sss/../secret/foo/foo.xt/foo/').split(path.sep).some(frag=>frag.startsWith('.'))
// .startsWith('.')

console.log(x);