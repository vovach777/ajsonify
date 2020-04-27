# Node: Asynchronous version of JSON.stringify()

```node
const { createJSONStream  } = require('ajsonify');

/*
   createJSONStream( <Object>, [null, [<spaces>, [[<readable options>], <block-size>]]]] ) : <stream>
*/

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
//circular ref. protection test
o.o = o;
o.child.arr.push({...o});
o.z = {...o.child}

//test huge array
let very_big_array = [];
very_big_array[1000000] = o;

let out = fs.createWriteStream( __dirname + '/out.json', 'utf8');
console.time('stream');
createJSONStream( very_big_array, null,2).pipe(out).on('close',()=>console.timeEnd('stream'));
createJSONStream( o,null,3).pipe(process.stdout);
```