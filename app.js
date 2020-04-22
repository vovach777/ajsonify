const { createJSONStream  } = require('./index');
const fs = require('fs');
const  { PassThrough } = require('stream');


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
o.o = o;
o.child.arr.push({...o});
o.z = {...o.child}

let very_big_array = [];
very_big_array[10000000] = o;

let out = fs.createWriteStream( __dirname + '/out.json', 'utf8');

createJSONStream( very_big_array ,null,3).pipe(out);


