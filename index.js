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

module.exports.stringify = stringify;
module.exports.encodeJSONText = encodeJSONText;

const { Readable } = require('stream');

module.exports.JSONStream = (o,ignore,format=0) => Readable.from( (format|0)<=0 ? stringify(o) : stringify_pretty(o,0,format|0));
