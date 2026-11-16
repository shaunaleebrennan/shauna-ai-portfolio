const finder = document.querySelector('[data-proof-finder]');

if (finder) {
  const configuredEndpoint = finder.dataset.searchEndpoint?.trim();
  const localEndpoint = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://127.0.0.1:3000/api/search'
    : '';
  const endpoint = configuredEndpoint || localEndpoint;

  if (!endpoint) {
    finder.remove();
  } else {
    finder.hidden = false;

    const form = finder.querySelector('[data-proof-form]');
    const queryInput = finder.querySelector('[data-proof-query]');
    const submitButton = finder.querySelector('[data-proof-submit]');
    const status = finder.querySelector('[data-proof-status]');
    const results = finder.querySelector('[data-proof-results]');
    const resultList = finder.querySelector('[data-proof-list]');
    const suggestionButtons = [...finder.querySelectorAll('[data-proof-suggestion]')];
    const idleButtonLabel = submitButton.innerHTML;
    let activeRequest;

    const setLoading = loading => {
      finder.setAttribute('aria-busy', String(loading));
      submitButton.disabled = loading;
      queryInput.disabled = loading;
      suggestionButtons.forEach(button => { button.disabled = loading; });
      submitButton.textContent = loading ? 'Searching…' : '';
      if (!loading) submitButton.innerHTML = idleButtonLabel;
    };

    const safeEvidenceHref = value => {
      if (typeof value !== 'string') return null;
      const caseStudy = /^\.\/case-study\.html\?case=[a-z0-9-]+$/;
      const portfolioSection = /^\.\/index\.html#(?:scan|essentials|ask)$/;
      if (!caseStudy.test(value) && !portfolioSection.test(value)) return null;
      const url = new URL(value, window.location.href);
      return url.origin === window.location.origin ? url.href : null;
    };

    const renderBrowseFallback = message => {
      resultList.replaceChildren();
      const item = document.createElement('li');
      item.className = 'proof-result-fallback';

      const copy = document.createElement('p');
      copy.textContent = message;
      const link = document.createElement('a');
      link.href = '#work-grid';
      link.textContent = 'Browse selected work ↓';

      item.append(copy, link);
      resultList.append(item);
      results.hidden = false;
    };

    const renderResults = matches => {
      resultList.replaceChildren();

      for (const match of matches) {
        const href = safeEvidenceHref(match?.href);
        if (!href) continue;

        const item = document.createElement('li');
        const link = document.createElement('a');
        link.className = 'proof-result-card';
        link.href = href;

        const eyebrow = document.createElement('span');
        eyebrow.className = 'proof-result-eyebrow';
        eyebrow.textContent = typeof match.eyebrow === 'string' ? match.eyebrow : 'Case study';

        const title = document.createElement('h3');
        title.textContent = typeof match.title === 'string' ? match.title : 'Portfolio evidence';

        const excerpt = document.createElement('p');
        excerpt.textContent = typeof match.excerpt === 'string' ? match.excerpt : '';

        const cta = document.createElement('span');
        cta.className = 'proof-result-link';
        cta.textContent = 'View evidence ↗';

        link.append(eyebrow, title, excerpt, cta);
        item.append(link);
        resultList.append(item);
      }

      const count = resultList.children.length;
      if (!count) {
        renderBrowseFallback('No strong match yet. Try “agentic AI” or browse the case studies.');
        status.textContent = 'No evidence matches found.';
        return;
      }

      results.hidden = false;
      status.textContent = `${count} closest evidence ${count === 1 ? 'match' : 'matches'} found.`;
    };

    const runSearch = async rawQuery => {
      const query = rawQuery.replace(/\s+/g, ' ').trim();
      if (query.length < 2) {
        queryInput.focus();
        return;
      }

      activeRequest?.abort();
      const controller = new AbortController();
      activeRequest = controller;
      setLoading(true);
      results.hidden = true;
      status.textContent = 'Searching the evidence…';

      const wakingMessage = window.setTimeout(() => {
        status.textContent = 'Waking the evidence search… this can take a moment on the first visit.';
      }, 8_000);
      const timeout = window.setTimeout(() => controller.abort(), 90_000);
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
          signal: controller.signal
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) throw new Error(payload.error || 'Evidence search is temporarily unavailable.');
        if (!Array.isArray(payload.results)) throw new Error('Evidence search is temporarily unavailable.');
        renderResults(payload.results);
      } catch (error) {
        if (controller !== activeRequest) return;
        if (error.name === 'AbortError') {
          status.textContent = 'The search took too long. Please try again.';
        } else {
          status.textContent = error.message || 'Evidence search is temporarily unavailable.';
        }
        renderBrowseFallback('The semantic search is temporarily unavailable. The six case studies are still ready to explore.');
      } finally {
        window.clearTimeout(wakingMessage);
        window.clearTimeout(timeout);
        if (controller === activeRequest) {
          activeRequest = null;
          setLoading(false);
        }
      }
    };

    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      runSearch(queryInput.value);
    });

    suggestionButtons.forEach(button => {
      button.addEventListener('click', () => {
        queryInput.value = button.dataset.proofSuggestion;
        form.requestSubmit();
      });
    });
  }
}
