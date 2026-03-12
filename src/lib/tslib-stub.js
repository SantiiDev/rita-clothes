// tslib stub — provides the minimum helpers required by @supabase/functions-js
export function __extends(d, b) {
  Object.setPrototypeOf(d, b);
  function __() { this.constructor = d; }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
export function __assign() {
  return Object.assign.apply(Object, arguments);
}
export function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  return t;
}
export function __awaiter(thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
    function rejected(value) { try { step(generator['throw'](value)); } catch (e) { reject(e); } }
    function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
export function __generator(thisArg, body) {
  // minimal stub
  return { next: () => ({ done: true, value: undefined }) };
}
export function __spreadArrays() {
  return [].concat.apply([], arguments);
}
export function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o), r, ar = [], e;
  try { while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value); }
  catch (error) { e = { error: error }; }
  finally { try { if (r && !r.done && (m = i["return"])) m.call(i); } finally { if (e) throw e.error; } }
  return ar;
}
export function __spread() {
  for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
  return ar;
}
export const __esDecorate = () => {};
export const __runInitializers = () => {};
export const __propKey = (x) => x;
export const __setFunctionName = (f, name) => { f.name = name; return f; };
export default {
  __extends,
  __assign,
  __rest,
  __awaiter,
  __generator,
  __spreadArrays,
  __read,
  __spread,
  __esDecorate,
  __runInitializers,
  __propKey,
  __setFunctionName,
};
