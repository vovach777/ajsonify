/*
    ver. 2.0.0
         pass1: object copy with stringify field (JSON.stringify()), circular detect, filter not JSON fields (sync phase)
         pass2: Create JSON generator. make Readable stream from generator. (async phase)
*/
const  { Readable } = require('stream');

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

function try_stringify( value) {
   /* type unboxing first */
   if (typeof value === 'object') {

      if ((value === null) ||
         ((Array.isArray(value) && (value.length===0))) ||
         (value instanceof String) ||
         (value instanceof Number) ||
         (value instanceof Date)   ||
         (value instanceof Boolean))
         return JSON.stringify(value);
      else
         return;
   }
   switch (typeof value) {
   case 'boolean':
   case 'number':
   case 'string':
         return JSON.stringify(value);
   }
}

function copy_object( from, set ) {
   if (from === void 0) {
      return;
   }
   let to = try_stringify(from);
   if (typeof to === 'string' ) {
      return to;
   }
   if (typeof from !== 'object')
      return;
   if (set) {
      if (set.has(from)) {
         return;
      }
      set.add(from);
   }
   else
      set = new Set([from]);

   const is_array = Array.isArray(from);

   let result;
   let empty  = true;

   if (is_array) {
      result = [];
      result.length = from.length;
   } else
      result = {};

   for (let item of Object.entries(from)) {
      let value = copy_object( item[1], set );
      if (value === void 0) {
         if (is_array)
            result[ item[0] ] = 'null';
      } else {
         result[ item[0] ] = value;
         empty = false;
      }
   }
   set.delete(from);
   if ((!is_array) && (empty))
      return '{}'
   else
      return result;
}

function * stringify_sync( value ) {

   if (value === void 0)
      return;

   if (typeof value === 'string') {
      yield value;
      return;
   }

   if (Array.isArray(value)) {
      yield '[';
      for (let i=0; i< value.length; i++) {
         if (i > 0)
            yield ',';
         if (value[i] !== void 0) {
            yield * stringify_sync( value[i] );
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
            yield JSON.stringify(key);
            yield ':';
            yield * stringify_sync( item  );
         }
      }
      yield '}';
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
         case ':':
            yield ': ';
            break;
         default:
            yield elem;
      }
   }
}

//low level function exports...
exports.stringify_g = (value, spaces) => prettify_sync( copy_object(value),spaces );
exports.blockify_g = blockify_sync;
exports.bufferify_g = bufferify_sync;
exports.copy_object = copy_object;

exports.createJSONStream = (o, ignore, spaces, options, block_size) => {
   if ((typeof options === 'number') &&
      (typeof block_size !== 'number')) {
         block_size = options;
         options = void 0;
      }
   return Readable.from( blockify_sync( prettify_sync( copy_object( o ),spaces), block_size ), options );
}
