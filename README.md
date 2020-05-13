# Node: Asynchronous version of JSON.stringify()

```node
/*
   const { createJSONStream } = require('ajsonify');
   createJSONStream( <Object>, [null, [<spaces>, [[<readable options>], <block-size>]]]] ) : <stream>
*/


const { createJSONStream, copy_object, stringify_g } = require('ajsonify');
const { createWriteStream } = require('fs');

let o = {
   hello: 'world',
   num:  1,
   child : { arr: [1,2,3,4,'string'] },
   array: [null,void 0, void 0,null],
   no : null,
   undefined: void 0,
   rus: 'русские буквы',
   rus2: '\\слеш \\ слеш \\ слеш \\ бэкслеш / бэкслеш /',
   kav1: `'`,
   kav2: `"`,
   special: '\t\n\r',
   date: new Date(),
   string: new String('string'),
   number: new Number(123456),
   boolean: new Boolean(false),
   symbol:  Symbol('symbol'),
   empty_array: [],
   empty_object: {}
}
let o_cp = {...o};
//circular ref. protection test
o.o = o;
o[ o.special ] = 'special';
o.child2 = o.child;
o.empty_4 = [];
o.empty_4.length = 4;


console.dir( o , {depth: null});
console.dir( copy_object(o) , {depth: null});
const assert = require('assert').strict;
assert.ok( [...stringify_g(o_cp)].join('') === JSON.stringify(o_cp),'JSON not equal!' );

createJSONStream( o, null,3).pipe(process.stdout);
//you can change object - createJSONStream make a copy to continue processing async.
Object.keys(o).forEach(k => delete o[k]);

//test huge array
let very_big_array = [];
very_big_array[10000000] = 'last';

let out = createWriteStream( __dirname + '/out.json', 'utf8');
 console.time('stream');
 createJSONStream( very_big_array, null,2).pipe(out).on('close',()=>{
     console.timeEnd('stream');
 });
 very_big_array.length = 0; //it's ok!

setInterval(()=>process.stdout.write('.'),1000).unref();
```