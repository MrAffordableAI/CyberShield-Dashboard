// Security Tips Database
const tips = [
  { title: "Use a Password Manager", text: "Never reuse passwords. A manager generates and stores strong unique ones for every site." },
  { title: "Enable MFA Everywhere", text: "Turn on multi-factor authentication for email, banking, and social accounts. App-based is better than SMS." },
  { title: "Beware of Phishing", text: "Hover over links before clicking. Check the real domain carefully. Banks never ask for passwords via email." },
  { title: "Keep Software Updated", text: "Enable automatic updates for your OS, browser, and apps. Patches close the holes attackers use." },
  { title: "Use a VPN on Public Wi-Fi", text: "Coffee shop Wi-Fi is a favorite hunting ground. A VPN encrypts your traffic." },
  { title: "Backup Your Data", text: "Follow the 3-2-1 rule: 3 copies, 2 different media, 1 offsite. Test your restores." },
  { title: "Review App Permissions", text: "Regularly check which apps have access to your camera, contacts, and location. Remove what you don't need." },
  { title: "Watch for Social Engineering", text: "If someone creates urgency or asks you to bypass normal procedures, slow down and verify." }
];

// Render tips
function renderTips() {
  const list = document.getElementById('tipsList');
  list.innerHTML = tips.map(t => `
    <div class="tip">
      <strong>${t.title}</strong><br>
      ${t.text}
    </div>
  `).join('');
}

// Password strength
const passwordInput = document.getElementById('passwordInput');
const strengthFill = document.getElementById('strengthFill');
const strengthText = document.getElementById('strengthText');
const passwordTips = document.getElementById('passwordTips');

passwordInput.addEventListener('input', () => {
  const pw = passwordInput.value;
  if (!pw) {
    strengthFill.style.width = '0%';
    strengthText.textContent = 'Type a password to analyze';
    passwordTips.innerHTML = '';
    return;
  }

  let score = 0;
  const feedback = [];

  if (pw.length >= 12) score += 30; else if (pw.length >= 8) score += 15; else feedback.push('Use at least 12 characters');
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 20; else feedback.push('Mix upper and lower case');
  if (/\d/.test(pw)) score += 15; else feedback.push('Add numbers');
  if (/[^a-zA-Z0-9]/.test(pw)) score += 20; else feedback.push('Add symbols (!@#$ etc.)');
  if (!/(.)\1{2,}/.test(pw)) score += 10; else feedback.push('Avoid repeating characters');
  if (!/password|123456|qwerty|admin/i.test(pw)) score += 5; else feedback.push('Avoid common words');

  score = Math.min(100, score);

  strengthFill.style.width = score + '%';
  if (score < 40) {
    strengthFill.style.background = '#ff4d6d';
    strengthText.textContent = 'Weak — easily cracked';
  } else if (score < 70) {
    strengthFill.style.background = '#ffb020';
    strengthText.textContent = 'Fair — could be stronger';
  } else {
    strengthFill.style.background = '#00d4aa';
    strengthText.textContent = 'Strong — good job';
  }

  passwordTips.innerHTML = feedback.length
    ? feedback.map(f => `<li>${f}</li>`).join('')
    : '<li>Excellent password strength!</li>';
});

// Phishing URL checker (heuristic AI-style rules)
const urlInput = document.getElementById('urlInput');
const checkUrlBtn = document.getElementById('checkUrlBtn');
const urlResult = document.getElementById('urlResult');

const suspiciousTlds = ['xyz', 'top', 'tk', 'ml', 'ga', 'cf', 'gq', 'work', 'click', 'link'];
const suspiciousWords = ['login', 'verify', 'account', 'secure', 'update', 'confirm', 'bank', 'paypal', 'apple', 'microsoft', 'amazon'];

checkUrlBtn.addEventListener('click', analyzeUrl);
urlInput.addEventListener('keypress', e => { if (e.key === 'Enter') analyzeUrl(); });

function analyzeUrl() {
  const raw = urlInput.value.trim();
  if (!raw) {
    urlResult.innerHTML = '<p>Please enter a URL</p>';
    urlResult.className = 'result';
    return;
  }

  let url;
  try {
    url = new URL(raw.startsWith('http') ? raw : 'https://' + raw);
  } catch {
    urlResult.innerHTML = '<strong>Invalid URL</strong><p>Could not parse this address.</p>';
    urlResult.className = 'result danger';
    return;
  }

  const issues = [];
  const host = url.hostname.toLowerCase();

  // IP address
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) issues.push('Uses raw IP address instead of domain');

  // Suspicious TLD
  const tld = host.split('.').pop();
  if (suspiciousTlds.includes(tld)) issues.push(`Suspicious top-level domain (.${tld})`);

  // Too many subdomains
  if (host.split('.').length > 4) issues.push('Unusually deep subdomain structure');

  // Suspicious keywords in domain
  const lower = host + url.pathname;
  suspiciousWords.forEach(w => {
    if (lower.includes(w) && !host.endsWith(w + '.com') && !host.endsWith(w + '.net')) {
      issues.push(`Contains sensitive keyword: "${w}"`);
    }
  });

  // Long URL
  if (raw.length > 100) issues.push('Unusually long URL (possible obfuscation)');

  // Multiple @ or other tricks
  if ((raw.match(/@/g) || []).length > 1) issues.push('Contains multiple @ symbols');

  // Result
  if (issues.length === 0) {
    urlResult.innerHTML = `
      <strong>✅ Looks relatively safe</strong>
      <p>No major red flags detected in this URL. Still verify the domain carefully before entering credentials.</p>
    `;
    urlResult.className = 'result safe';
  } else if (issues.length <= 2) {
    urlResult.innerHTML = `
      <strong>⚠️ Caution advised</strong>
      <ul>${issues.map(i => `<li>${i}</li>`).join('')}</ul>
      <p>Double-check this site before trusting it.</p>
    `;
    urlResult.className = 'result warning';
  } else {
    urlResult.innerHTML = `
      <strong>🚨 High risk indicators</strong>
      <ul>${issues.map(i => `<li>${i}</li>`).join('')}</ul>
      <p>This URL shows multiple phishing traits. Do not enter any personal information.</p>
    `;
    urlResult.className = 'result danger';
  }
}

// Init
renderTips();
