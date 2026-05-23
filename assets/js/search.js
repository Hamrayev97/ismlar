(function(){
  const DATA = window.NAMES_DATA || [];
  const base = (document.body && document.body.dataset.base) || '';

  function cleanUrl(url){
    let u = String(url || '').replace(/^\/+/, '');
    if(!u) return 'index.html';
    if(u.endsWith('/')) u += 'index.html';
    return u;
  }
  function href(url){ return base + cleanUrl(url); }
  function norm(s){
    return String(s || '')
      .toLowerCase()
      .replace(/ё/g,'yo')
      .replace(/ў/g,'o')
      .replace(/ғ/g,'g')
      .replace(/қ/g,'q')
      .replace(/ҳ/g,'h')
      .replace(/о[‘’ʻ']/g,'o')
      .replace(/ғ/g,'g')
      .replace(/g[‘’ʻ']/g,'g')
      .replace(/[‘’ʻ'`]/g,'')
      .replace(/\s+/g,' ')
      .trim();
  }
  function scopedItems(input){
    const group = input.dataset.group || '';
    const religious = input.dataset.religious || '';
    return DATA.filter(item => {
      if(group && item.group !== group) return false;
      if(religious === 'all' && !item.religious) return false;
      if(religious && religious !== 'all' && item.religious !== religious) return false;
      return true;
    });
  }
  function filterLinks(query){
    const links = document.querySelectorAll('.name-link');
    if(!links.length) return;
    links.forEach(link => {
      link.classList.toggle('hidden-by-search', query && !norm(link.textContent).includes(query));
    });
  }
  function render(input){
    const target = document.getElementById(input.dataset.target || 'searchResults');
    if(!target) return [];
    const q = norm(input.value);
    target.innerHTML = '';
    filterLinks(q);
    if(!q) return [];
    const items = scopedItems(input).filter(item =>
      norm(item.name).includes(q) || norm(item.meaning).includes(q) || norm(item.slug).includes(q)
    ).slice(0, 12);
    if(!items.length){
      target.innerHTML = '<div class="empty">Mos ism topilmadi.</div>';
      return [];
    }
    target.innerHTML = items.map(item =>
      '<a class="result-item" href="'+href(item.url)+'"><b>'+escapeHtml(item.name)+'</b><span>'+escapeHtml(item.meaning)+'</span></a>'
    ).join('');
    return items;
  }
  function escapeHtml(s){
    return String(s).replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  }
  document.addEventListener('DOMContentLoaded', function(){
    const inputs = Array.from(document.querySelectorAll('[data-search]'));
    inputs.forEach(input => {
      ['input','keyup','search','change'].forEach(evt => input.addEventListener(evt, () => render(input)));
      const form = input.closest('form');
      if(form){
        form.addEventListener('submit', function(e){
          e.preventDefault();
          const items = render(input);
          if(items.length){ window.location.href = href(items[0].url); }
        });
      }
    });
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if(q && inputs[0]){ inputs[0].value = q; render(inputs[0]); }
  });
})();