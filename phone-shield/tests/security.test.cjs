const assert=require('node:assert/strict');
const {analyze}=require('../security.js');
const cases=[
['', 'invalid'],
['javascript:alert(1)', 'invalid'],
['file:///etc/passwd', 'invalid'],
['https://user:password@example.com', 'invalid'],
['https://example.com', 'unknown'],
['https://example.com/path', 'unknown'],
['http://example.com', 'caution'],
['https://127.0.0.1/login', 'caution'],
['https://login.verify.account.example.com', 'caution'],
['https://xn--pple-43d.com', 'caution'],
['https://example.com/'+ 'a'.repeat(190), 'caution']
];
for(const [input,expected] of cases) {
  const actual=analyze(input);
  assert.equal(actual.status,expected,input);
  assert(Array.isArray(actual.flags));
  assert(Array.isArray(actual.notes));
}
const maliciousText='<img src=x onerror=alert(1)>';
const invalid=analyze(maliciousText);
assert.equal(invalid.status,'invalid');
console.log('Phone Shield URL heuristic cases passed:',cases.length+1);
