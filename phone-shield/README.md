# Phone Shield — MVP incubation

Phone Shield is a privacy-first mobile security companion. This folder is isolated from the existing CyberShield demo so it can be tested without disrupting the current site.

## Version 0.1 (working browser prototype)
- Suspicious-link checker with transparent, *heuristic* explanations.
- A guided emergency account-security checklist.
- Device security self-check, clearly labeled as user-attested rather than a device scan.
- Fully client-side: URLs and checklist selections are not uploaded to a server.
- No external dependencies, subscription integrations, malware scanning, VPN, or background monitoring.

Open `index.html` in a browser. It is intended for prototyping and is **not** an antivirus product or a verified commercial release.

## Product direction
1. **Scam Rescue:** Share or paste a suspicious link, inspect it without opening it, and see the reasons for caution plus safe next steps.
2. **Money Guard:** Explain banking, payment, crypto, and impersonation red flags without asserting that a particular person is fraudulent.
3. **Family Guardian:** Future consent-driven sharing and escalation to trusted contacts; no hidden monitoring.
4. **Evidence-first safety:** Separate observed signals, user responses, and unavailable device checks. Never claim “fully protected.”

## Privacy and safety rules
- Collect the minimum data. Avoid collecting passwords, banking credentials, OTPs, full messages, or unnecessary personal data.
- Avoid transmitting input to third-party APIs without explicit consent and a documented retention period.
- Do not store users' pasted sensitive content in analytics, logs, or crash reports.
- This prototype stores no checklist or URL history, and does not use localStorage.
- The detector must not automatically open or navigate to submitted links; links are displayed only as text.
- "No flags found" is **not** a declaration of safety. A link can be malicious even when checks find nothing.
- Before publishing as a native app, verify Apple/Google policies, security requirements, accessibility, consent flows, and claims with real-device tests.

## Release gate (not passed)
- Native mobile architecture and supported platform integrations determined.
- Threat model, privacy/data retention policy, and secure backend design reviewed.
- Test corpus with benign, suspicious, deceptive and internationalized URLs, and measurable false-positive/negative rates.
- Independent security/privacy review and accessibility verification.
- Store descriptions match actual implemented behavior.
- Pilot customers establish usability and willingness to pay.

This folder is intentionally separate from the existing CyberShield-Dashboard root application.
