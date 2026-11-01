// === State ===
let score = 72;
const scoreEl = document.getElementById('scoreValue');
const scoreCircle = document.getElementById('scoreCircle');
const scoreMessage = document.getElementById('scoreMessage');
const scoreBreakdown = document.getElementById('scoreBreakdown');

function updateScore(delta, reason) {
  score = Math.max(20, Math.min(98, score + delta));
  scoreEl.textContent = score;
  const pct = score;
  scoreCircle.style.background = `conic-gradient(var(--good) ${pct}%, #243044 0)`;
  localStorage.setItem('cs-score', score);
  renderBreakdown();
}

function renderBreakdown() {
  scoreBreakdown.innerHTML = `
    <span>Password hygiene: ${localStorage.getItem('cs-pw') || '—'}</span> · 
    <span>URL checks: ${localStorage.getItem('cs-url') || '—'}</span> · 
    <span>Device checks: ${document.querySelectorAll('#hygieneList input:checked').length}/6</span>
  `;
  if (score >= 85) scoreMessage.textContent = 'Strong protection. Keep the habits going.';
  else if (score >= 65) scoreMessage.textContent = 'Good foundation. Close the remaining gaps below.';
  else scoreMessage.textContent = 'Several gaps remain. Work through the tools to improve.';
}

// Load saved score
if (localStorage.getItem('cs-score')) {
  score = parseInt(localStorage.getItem('cs-score'), 10);
  scoreEl.textContent = score;
  scoreCircle.style.background = `conic-gradient(var(--good) ${score}%, #243044 0)`;
}

// === Tips ===
const tips = [
  { title: "Use a Password Manager", text: "Unique strong passwords for every account. Managers make this practical." },
  { title: "Enable MFA Everywhere", text: "App-based authenticator is stronger than SMS. Turn it on for email first." },
  { title: "Verify Before You Click", text: "Hover links. Check the real domain. Legitimate companies rarely demand urgent action via email." },
  { title: "Keep Devices Updated", text: "Automatic updates close the holes attackers actively exploit." },
  { title: "Limit App Permissions", text: "Review camera, contacts, and location access regularly." },
  { title: "Have a Recovery Plan", text: "Know how to freeze credit, change key passwords, and contact banks if compromised." },
  { title: "Family Conversations", text: "Share these habits with older relatives and kids — most successful scams target the less technical." }
];

function renderTips() {
  document.getElementById('tipsList').innerHTML = tips.map(t => `
    <div class="tip"><strong>${t.title}</strong><br>${t.text}</div>
  `).join('');
}

// === Password Coach ===
const passwordInput = document.getElementById('passwordInput');
const strengthFill = document.getElementById('strengthFill');
const strengthText = document.getElementById('strengthText');
const passwordTips = document.getElementById('passwordTips');

passwordInput.addEventListener('input', () => {
  const pw = passwordInput.value;
  if (!pw) {
    strengthFill.style.width = '0%';
    strengthText.textContent = 'Type to analyze';
    passwordTips.innerHTML = '';
    return;
  }

  let s = 0;
  const fb = [];
  if (pw.length >= 12) s += 30; else if (pw.length >= 8) s += 15; else fb.push('Use at least 12 characters');
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s += 20; else fb.push('Mix upper and lower case');
  if (/\d/.test(pw)) s += 15; else fb.push('Add numbers');
  if (/[^a-zA-Z0-9]/.test(pw)) s += 20; else fb.push('Add symbols');
  if (!/(.)\1{2,}/.test(pw)) s += 10; else fb.push('Avoid repeating characters');
  if (!/password|123456|qwerty|admin|welcome/i.test(pw)) s += 5; else fb.push('Avoid common words');

  s = Math.min(100, s);
  strengthFill.style.width = s + '%';
  if (s < 40) {
    strengthFill.style.background = '#ff5c7a';
    strengthText.textContent = 'Weak';
    localStorage.setItem('cs-pw', 'weak');
  } else if (s < 70) {
    strengthFill.style.background = '#ffb84d';
    strengthText.textContent = 'Fair';
    localStorage.setItem('cs-pw', 'fair');
  } else {
    strengthFill.style.background = '#00e5b0';
    strengthText.textContent = 'Strong';
    localStorage.setItem('cs-pw', 'strong');
    updateScore(3, 'strong password');
  }
  passwordTips.innerHTML = fb.length ? fb.map(f => `<li>${f}</li>`).join('') : '<li>Excellent</li>';
  renderBreakdown();
});

// === Phishing Checker ===
const urlInput = document.getElementById('urlInput');
const checkUrlBtn = document.getElementById('checkUrlBtn');
const urlResult = document.getElementById('urlResult');
const suspiciousTlds = ['xyz','top','tk','ml','ga','cf','gq','work','click','link','zip'];
const suspiciousWords = ['login','verify','account','secure','update','confirm','bank','paypal','apple','microsoft','amazon','wallet'];

checkUrlBtn.addEventListener('click', analyzeUrl);
urlInput.addEventListener('keypress', e => { if (e.key === 'Enter') analyzeUrl(); });

function analyzeUrl() {
  const raw = urlInput.value.trim();
  if (!raw) { urlResult.innerHTML = '<p>Enter a URL</p>'; urlResult.className = 'result'; return; }

  let url;
  try { url = new URL(raw.startsWith('http') ? raw : 'https://' + raw); }
  catch { urlResult.innerHTML = '<strong>Invalid URL</strong>'; urlResult.className = 'result danger'; return; }

  const issues = [];
  const host = url.hostname.toLowerCase();
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) issues.push('Raw IP address');
  const tld = host.split('.').pop();
  if (suspiciousTlds.includes(tld)) issues.push(`Suspicious TLD (.${tld})`);
  if (host.split('.').length > 4) issues.push('Deep subdomain structure');
  const lower = host + url.pathname;
  suspiciousWords.forEach(w => {
    if (lower.includes(w) && !host.endsWith(w + '.com') && !host.endsWith(w + '.net')) issues.push(`Keyword: "${w}"`);
  });
  if (raw.length > 110) issues.push('Unusually long URL');
  if ((raw.match(/@/g) || []).length > 1) issues.push('Multiple @ symbols');

  localStorage.setItem('cs-url', issues.length === 0 ? 'clean' : issues.length + ' flags');
  updateScore(issues.length === 0 ? 2 : -1);

  if (issues.length === 0) {
    urlResult.innerHTML = `<strong>✅ No major red flags</strong><p>Still verify the domain before entering credentials.</p>`;
    urlResult.className = 'result safe';
  } else if (issues.length <= 2) {
    urlResult.innerHTML = `<strong>⚠️ Caution</strong><ul>${issues.map(i => `<li>${i}</li>`).join('')}</ul>`;
    urlResult.className = 'result warning';
  } else {
    urlResult.innerHTML = `<strong>🚨 High risk</strong><ul>${issues.map(i => `<li>${i}</li>`).join('')}</ul><p>Do not enter personal information.</p>`;
    urlResult.className = 'result danger';
  }
  renderBreakdown();
}

// === Device Hygiene ===
const hygieneItems = [
  "Automatic OS updates enabled",
  "Antivirus / built-in protection active",
  "Screen lock with strong PIN or biometrics",
  "Find My Device / remote wipe enabled",
  "Only install apps from official stores",
  "Backup set up and tested recently"
];

function renderHygiene() {
  const el = document.getElementById('hygieneList');
  el.innerHTML = hygieneItems.map((item, i) => `
    <div class="check-item">
      <input type="checkbox" id="h${i}" onchange="onCheck()">
      <label for="h${i}">${item}</label>
    </div>
  `).join('');
}

// === Privacy Audit ===
const privacyItems = [
  "Reviewed app permissions in the last 3 months",
  "Location services limited to necessary apps",
  "Ad tracking limited or reset",
  "Social media privacy settings reviewed",
  "Using a password manager",
  "MFA enabled on primary email"
];

function renderPrivacy() {
  const el = document.getElementById('privacyList');
  el.innerHTML = privacyItems.map((item, i) => `
    <div class="check-item">
      <input type="checkbox" id="p${i}" onchange="onCheck()">
      <label for="p${i}">${item}</label>
    </div>
  `).join('');
}

function onCheck() {
  const total = document.querySelectorAll('#hygieneList input:checked, #privacyList input:checked').length;
  if (total >= 6) updateScore(2);
  renderBreakdown();
}

// === Premium button ===
document.getElementById('premiumBtn').addEventListener('click', () => {
  document.getElementById('premiumSection').scrollIntoView({ behavior: 'smooth' });
});

// === Init ===
renderTips();
renderHygiene();
renderPrivacy();
renderBreakdown();
