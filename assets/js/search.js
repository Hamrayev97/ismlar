(function(){
  const DATA = window.NAMES_DATA || [];

  function basePrefix(){
    const script = document.querySelector('script[src$="assets/js/search.js"], script[src$="search.js"]');
    const src = script ? script.getAttribute('src') : '';
    return src.replace(/assets\/js\/search\.js$/, '').replace(/search\.js$/, '');
  }

  function localHref(url){
    if(!url) return '#';
    const clean = url.replace(/^\/+/, '');
    return basePrefix() + clean + (clean.endsWith('/') ? 'index.html' : '');
  }

  function norm(s){
    return (s || '')
      .toString()
      .toLowerCase()
      .replace(/o[‘’ʻ']/g,'o')
      .replace(/g[‘’ʻ']/g,'g')
      .replace(/[‘’ʻ']/g,'')
      .trim();
  }

  function filteredData(input){
    const group = input.dataset.group || '';
    const religious = input.dataset.religious || '';
    return DATA.filter(item => {
      if(group && item.group !== group) return false;
      if(religious === 'all' && !item.religious) return false;
      if(religious && religious !== 'all' && item.religious !== religious) return false;
      return true;
    });
  }

  function renderResults(input){
    const targetId = input.dataset.target || 'searchResults';
    const box = document.getElementById(targetId);
    if(!box) return [];

    const query = norm(input.value);
    box.innerHTML = '';
    if(query.length < 1){
      showAllNameLinks();
      return [];
    }

    const items = filteredData(input)
      .filter(x => norm(x.name).includes(query) || norm(x.meaning).includes(query))
      .slice(0, 20);

    if(!items.length){
      box.innerHTML = '<div class="empty">Mos ism topilmadi.</div>';
      filterVisibleNameLinks(query);
      return [];
    }

    box.innerHTML = items.map(x =>
      `<a class="result-item" href="${localHref(x.url)}"><b>${x.name}</b><span>${x.meaning}</span></a>`
    ).join('');
    filterVisibleNameLinks(query);
    return items;
  }

  function showAllNameLinks(){
    document.querySelectorAll('.name-link').forEach(link => link.classList.remove('hidden-by-search'));
  }

  function filterVisibleNameLinks(query){
    const links = document.querySelectorAll('.name-link');
    if(!links.length) return;
    links.forEach(link => {
      const text = norm(link.textContent);
      link.classList.toggle('hidden-by-search', !text.includes(query));
    });
  }

  function bindSearch(input){
    ['input','keyup','search','change'].forEach(evt => {
      input.addEventListener(evt, () => renderResults(input));
    });
    input.addEventListener('keydown', e => {
      if(e.key === 'Enter'){
        const items = renderResults(input);
        if(items.length){
          e.preventDefault();
          window.location.href = localHref(items[0].url);
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('[data-search]');
    inputs.forEach(bindSearch);

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if(q && inputs[0]){
      inputs[0].value = q;
      renderResults(inputs[0]);
    }
  });
})();
