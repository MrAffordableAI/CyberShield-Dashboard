/* Pure, local-only URL heuristics. Never fetch, follow or open submitted URLs. */
(function(root) {
  'use strict';
  function analyze(raw) {
    if (typeof raw !== 'string' || !raw.trim()) return {status:'invalid', title:'Enter a website address', flags:[], notes:[]};
    const input = raw.trim();
    if (input.length > 2048 || /[\u0000-\u001f\u007f\s]/.test(input)) return {status:'invalid', title:'Invalid web address', flags:[], notes:['Use a web address without spaces or control characters.']};
    let url;
    try {
      url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(input) ? input : 'https://' + input);
    } catch (_) {
      return {status:'invalid',title:'Invalid web address',flags:[],notes:['Check the spelling of the address.']};
    }
    if (!['https:', 'http:'].includes(url.protocol) || !url.hostname || !url.hostname.includes('.') || url.username || url.password) {
      return {status:'invalid',title:'Unsupported or potentially deceptive address',flags:[],notes:['Only ordinary HTTP/HTTPS website addresses without embedded credentials are accepted.']};
    }
    const host = url.hostname.toLowerCase();
    const flags = [];
    if (url.protocol === 'http:') flags.push('The address uses unencrypted HTTP, not HTTPS.');
    if (host.startsWith('xn--') || host.includes('.xn--')) flags.push('The domain uses internationalized encoding; verify the spelling independently.');
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith('[')) flags.push('The address uses a numeric internet address instead of a recognizable domain.');
    if (host.split('.').length >= 5) flags.push('The hostname contains many subdomains, which can obscure the actual destination.');
    if (/@/.test(input)) flags.push('The address contains an @ character. Check for misleading formatting.');
    if (/(?:login|verify|support|account|secure|payment|wallet)[-.]/i.test(host) && host.split('.').length >= 3) flags.push('Security or payment words appear within a complex hostname; inspect the full domain carefully.');
    if (url.port && !['80','443'].includes(url.port)) flags.push('The website uses an unusual port.');
    if (input.length > 180) flags.push('The URL is unusually long.');
    if (/[\u0080-\uffff]/.test(input)) flags.push('The input contains non-ASCII characters; look carefully for confusing characters.');
    return {
      status: flags.length ? 'caution' : 'unknown',
      title: flags.length ? 'Caution: review these indicators' : 'No selected warning indicators found',
      host,
      flags,
      notes: [
        'A URL-only heuristic cannot determine whether a site is legitimate, compromised or newly malicious.',
        'Open the organization’s official app or type its known address yourself, rather than following an unexpected link.',
        'Never share passwords, one-time codes or payment details to resolve an unexpected alert.'
      ]
    };
  }
  root.PhoneShieldSecurity = { analyze };
  if (typeof module !== 'undefined' && module.exports) module.exports = {analyze};
})(typeof window !== 'undefined' ? window : globalThis);
