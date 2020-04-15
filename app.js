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
// o.o = o;
// o.child.arr.push({...o});
// o.z = {...o.child}

let out = fs.createWriteStream( __dirname + '/out.json', 'utf8');

JSONStream( '\t\r\n',null, 2 ).pipe( out );

