# Node: Asynchronous version of JSON.stringify()

```node
const { JSONStream } = require('./index');
const fs = require('fs');


let o = {
   hello: 'world',
   num:  1,
   child : { arr: [1,2,3,4,'string'] },
   no : null,
   rus: 'русские буквы',
   rus2: '\\слеш \\ слеш \\ слеш \\ бэкслеш / бэкслеш /',
   kav1: `'`,
   kav2: `"`,
   special: '\t\n\r'
}

// circular ref test
o.o = o;
o.child.arr.push({...o});
o.z = {...o.child}

let out = fs.createWriteStream( __dirname + '/out.json', 'utf8');

JSONStream( o,null, 3 ).pipe( out );

//or JSONStream( o ).pipe( out );
```