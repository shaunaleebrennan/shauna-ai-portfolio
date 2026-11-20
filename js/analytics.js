const GA_MEASUREMENT_ID = 'G-CC8B7EZNLM';
const CONSENT_KEY = 'shauna-portfolio-analytics-consent';

const loadGoogleAnalytics = () => {
  if (window.gtag) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'granted'
  });
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.append(script);
};

const saveConsent = value => {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Continue without persistence when storage is unavailable.
  }
};

const readConsent = () => {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
};

const showConsentBanner = () => {
  const banner = document.createElement('aside');
  banner.className = 'analytics-consent';
  banner.setAttribute('aria-label', 'Analytics preferences');
  banner.innerHTML = `
    <div>
      <strong>Your privacy, your choice</strong>
      <p>I use Google Analytics to understand which portfolio content is useful. Analytics stays off unless you accept.</p>
    </div>
    <div class="analytics-consent__actions">
      <button type="button" data-analytics-decline>Decline</button>
      <button type="button" class="analytics-consent__accept" data-analytics-accept>Accept analytics</button>
    </div>`;

  banner.querySelector('[data-analytics-accept]').addEventListener('click', () => {
    saveConsent('granted');
    loadGoogleAnalytics();
    banner.remove();
  });
  banner.querySelector('[data-analytics-decline]').addEventListener('click', () => {
    saveConsent('denied');
    banner.remove();
  });
  document.body.append(banner);
};

const consent = readConsent();
if (consent === 'granted') loadGoogleAnalytics();
else if (consent !== 'denied') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showConsentBanner);
  else showConsentBanner();
}
