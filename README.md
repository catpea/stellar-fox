# stellar-fox
Static Virtual Hosting

### Usage

```javascript

import sf from 'stellar-fox';

const conf = {

  virtual:[

    { name: 'catpea.net', root:'./www/catpea-net' },
    { name: 'catpea.com', root:'./www/catpea-com' },
    { name: 'catpea.org', root:'./www/catpea-org' },

  ],
}

sf(conf);

```
