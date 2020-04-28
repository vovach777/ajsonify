const { createJSONStream } = require('./index');
const { createWriteStream } = require('fs');

let o = {
   hello: 'world',
   num:  1,
   child : { arr: [1,2,3,4,'string'] },
   no : null,
   rus: 'русские буквы',
   rus2: '\\слеш \\ слеш \\ слеш \\ бэкслеш / бэкслеш /',
   kav1: `'`,
   kav2: `"`,
   special: '\t\n\r',
   date: new Date(),
   string: new String('string'),
   number: new Number(123456),
   boolean: new Boolean(false)
}
//circular ref. protection test
o.o = o;
o.child.arr.push({...o});
//test huge array
let very_big_array = [];
very_big_array[10000000] = o;

let out = createWriteStream( __dirname + '/out.json', 'utf8');

 console.time('stream');
 createJSONStream( very_big_array, null,2).pipe(out).on('close',()=>{
     console.timeEnd('stream');
     createJSONStream( o,null,3).pipe(process.stdout);
 });

setInterval(()=>process.stdout.write('.'),1000).unref();
