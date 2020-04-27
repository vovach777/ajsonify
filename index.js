const  { Readable } = require('stream');

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
         case 34: sb += '\\"'; break;
         case 92: sb += '\\\\'; break;
         case 47: sb += '\\/'; break;
         default:
            sb += ((cc >= 0x20) && (cc <= 0x7f)) ? s[i] : '\\u'+('000' + cc.toString(16)).slice(-4);
      }
   }
   return sb;
}

function * blockify_sync( generator, size = 4096 ) {
   let buffer = '';
   for (let value of generator) {
     buffer += value;
     while (buffer.length >= size) {
        yield buffer.slice(0,size);
        buffer = buffer.slice(size)
     }
   }
   yield buffer;
}

function * bufferify_sync( generator ) {
   for (let value of generator) {
      yield Buffer.from(value);
   }
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
         if (circular_protection_set)
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
exports.bufferify_g = bufferify_sync;

exports.createJSONStream = (o, ignore, spaces, options, block_size) => {
   if ((typeof options === 'number') &&
      (typeof block_size !== 'number')) {
         block_size = options;
         options = void 0;
      }

   return Readable.from( blockify_sync( prettify_sync(o,spaces), block_size ), options );
}
