const  { PassThrough } = require('stream');

function encodeJSONText(s) {
   let sb = '';
    for (let i=0; i<s.length; i++) {
      let cc = s.charCodeAt(i);
      switch ( cc ) {
         case 8:  sb += '\\b'; break;
         case 9:  sb += '\\t'; break;
         case 10: sb += '\\n'; break;
         case 12: sb += '\\f'; break;
         case 13: sb += '\\r'; break;
         case '"'.charCodeAt(0):  sb += '\\"';  break;
         case '\\'.charCodeAt(0): sb += '\\\\'; break;
         case '/'.charCodeAt(0):  sb += '\\/';  break;
         default:
            sb += ((cc >= 0x20) && (cc <= 0x7f)) ? s[i] : '\\u'+('000' + cc.toString(16)).slice(-4);
      }
   }
   return sb;
}

/*
async genetator was disabled
node-13 memory leak.

async function * stringify( value, circular_protection_set ) {
   switch (typeof value) {
   case 'boolean':
         yield value ? 'true' : 'false';
         break;
   case 'number':
         yield String(value);
         break;
   case 'string':
         yield `"${encodeJSONText(value)}"`
         break;
   case 'object':
         if (value === null) {
            yield 'null';
            break;
         }
         if ((circular_protection_set) && (circular_protection_set.has(value))) {
            yield 'null';
            break;
         }
         if (circular_protection_set instanceof Set)
            circular_protection_set.add(value);
         else
            circular_protection_set = new Set([value]);
         if (Array.isArray(value)) {
            yield '[';
            for (let i=0; i< value.length; i++) {
               if (i > 0)
                  yield ',';
               if (value[i] !== void 0) {
                  yield * stringify( value[i], circular_protection_set );
               } else {
                  yield 'null';
               }
            }
            yield ']';
         } else {
            yield '{';
               let count = 0;
               for (let key in value) {
                  let item = value[key];
                  if (item !== void 0) {
                  if (count++ > 0)
                     yield ',';
                  yield `"${encodeJSONText(key)}":`;
                  yield * stringify( item, circular_protection_set );
                  }
               }
            yield '}';
         }
         circular_protection_set.delete(value);
         break;
   default:
      yield `"${encodeJSONText(String(value))}"`
   }
}

async function * stringify_pretty( value, cur, inc, circular_protection_set  ) {
   switch (typeof value) {
   case 'boolean':
         yield value ? 'true' : 'false';
         break;
   case 'number':
         yield String(value);
         break;
   case 'string':
         yield `"${encodeJSONText(value)}"`
         break;
   case 'object':
         if (value === null) {
            yield 'null';
            break;
         }
         if ((circular_protection_set) && (circular_protection_set.has(value))) {
            yield 'null';
            break;
         }
         if (circular_protection_set instanceof Set)
            circular_protection_set.add(value);
         else
            circular_protection_set = new Set([value]);
         if (Array.isArray(value)) {
            yield '[\n'+' '.repeat(cur+inc);
            for (let i=0; i< value.length; i++) {
               if (i > 0)
                  yield ',\n'+' '.repeat(cur+inc);
               if (value[i] !== void 0) {
                  yield * stringify_pretty( value[i], cur+inc,inc, circular_protection_set );
               } else {
                  yield 'null';
               }
            }
            yield '\n'+' '.repeat(cur)+']';
         } else {
            yield '{\n'+' '.repeat(cur+inc);
               let count = 0;
               for (let key in value) {
                  let item = value[key];
                  if (item !== void 0) {
                  if (count++ > 0)
                     yield ',\n'+' '.repeat(cur+inc);
                  yield `"${encodeJSONText(key)}": `;
                  yield * stringify_pretty( item, cur+inc,inc, circular_protection_set);
                  }
               }
            yield '\n'+' '.repeat(cur)+'}';
         }
         circular_protection_set.delete(value);
         break;
   default:
      yield `"${encodeJSONText(String(value))}"`
   }
}

const { Readable } = require('stream');
module.exports.JSONStream = (o,ignore,format=0) => Readable.from(  ((format|0)<=0 ? stringify(o) : stringify_pretty(o,0,format|0)) );

*/

function * blockify_sync( generator, size = 4096 ) {

   let buffer = '';
   for (let value of generator) {
     buffer += value;
     if (buffer.length > size) {
        yield buffer;
        buffer = '';
     }
   }
   return buffer;
}


function * stringify_sync( value, circular_protection_set ) {
   switch (typeof value) {
   case 'boolean':
         yield value ? 'true' : 'false';
         break;
   case 'number':
         yield String(value);
         break;
   case 'string':
         yield `"${encodeJSONText(value)}"`
         break;
   case 'object':
         if (value === null) {
            yield 'null';
            break;
         }
         if ((circular_protection_set) && (circular_protection_set.has(value))) {
            yield 'null';
            break;
         }
         if (circular_protection_set instanceof Set)
            circular_protection_set.add(value);
         else
            circular_protection_set = new Set([value]);
         if (Array.isArray(value)) {
            yield '[';
            for (let i=0; i< value.length; i++) {
               if (i > 0)
                  yield ',';
               if (value[i] !== void 0) {
                  yield * stringify_sync( value[i], circular_protection_set );
               } else {
                  yield 'null';
               }
            }
            yield ']';
         } else {
            yield '{';
               let count = 0;
               for (let key in value) {
                  let item = value[key];
                  if (item !== void 0) {
                  if (count++ > 0)
                     yield ',';
                  yield `"${encodeJSONText(key)}":`;
                  yield * stringify_sync( item, circular_protection_set );
                  }
               }
            yield '}';
         }
         circular_protection_set.delete(value);
         break;
   default:
      yield `"${encodeJSONText(String(value))}"`
   }
}

function * prettify_sync( value, spaces=0 ) {
   spaces = spaces|0;
   if (spaces<=0) {
      yield * stringify_sync( value );
      return;
   }
   let cur = 0;
   for (let elem of stringify_sync( value )) {
      switch (elem) {
         case '[':
         case '{':
            cur += spaces;
            yield elem+'\n'+' '.repeat(cur);
            break;
         case ',':
            yield elem+'\n'+' '.repeat(cur);
            break;
         case ']':
         case '}':
            cur -= spaces;
            yield '\n'+' '.repeat(cur)+elem;
            break;
         default:
            yield elem;
      }
   }
}

//low level function exports...
exports.stringify_g = stringify_sync;
exports.prettify_g = prettify_sync;
exports.blockify_g = blockify_sync;

exports.createJSONStream = (o, ignore, spaces, timeoutValue=0, block_size=512) => {

   let stream = new PassThrough();
   let gen = blockify_sync( prettify_sync(o,spaces), block_size );
   process.nextTick( gen_to_stream );
   return stream;
   function gen_to_stream() {
      try {
         let v = gen.next();
         if (v.done)
            stream.end(v.value);
         else {
            stream.write(v.value);
            if (timeoutValue===0)
               setImmediate( gen_to_stream  );
            else
               setTimeout( gen_to_stream,timeoutValue|0);
         }
      } catch(e) {
         stream.destroy(e);
      }
   }
}
