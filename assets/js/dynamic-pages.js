(function(){
  const DATA = window.NAMES_DATA || [];
  const base = (document.body && document.body.dataset.base) || '';

  function escapeHtml(s){
    return String(s || '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  }
  function href(url){
    let u = String(url || '').replace(/^\/+/, '');
    return base + u;
  }
  function firstLetter(name){
    return String(name || '').trim().charAt(0).toUpperCase() || '#';
  }
  function sortNames(items){
    return items.slice().sort((a,b) => String(a.name).localeCompare(String(b.name), 'uz', {sensitivity:'base'}));
  }
  function filterItems(el){
    const group = el.dataset.group || '';
    const religious = el.dataset.religious || '';
    return sortNames(DATA.filter(item => {
      if(group && item.group !== group) return false;
      if(religious === 'all' && !item.religious) return false;
      if(religious && religious !== 'all' && item.religious !== religious) return false;
      return true;
    }));
  }
  function renderList(el){
    const items = filterItems(el);
    if(!items.length){
      el.innerHTML = '<div class="empty">Hozircha ism kiritilmagan.</div>';
      return;
    }
    const groups = {};
    items.forEach(item => {
      const letter = firstLetter(item.name);
      if(!groups[letter]) groups[letter] = [];
      groups[letter].push(item);
    });
    const letters = Object.keys(groups).sort((a,b)=>a.localeCompare(b,'uz',{sensitivity:'base'}));
    const alpha = '<div class="alpha">' + letters.map(l => '<a href="#'+encodeURIComponent(l)+'">'+escapeHtml(l)+'</a>').join('') + '</div>';
    const list = letters.map(letter => {
      const links = groups[letter].map(item => '<a class="name-link" href="'+href(item.url)+'"><span>'+escapeHtml(item.name)+'</span><small>›</small></a>').join('');
      return '<h2 id="'+escapeHtml(letter)+'" class="name-group-title">'+escapeHtml(letter)+'</h2><div class="name-grid">'+links+'</div>';
    }).join('');
    el.innerHTML = alpha + list;
  }
  function groupLabel(group){
    if(group === 'qiz-bolalar-ismlari') return 'Qiz bolalar ismlari';
    return 'O‘g‘il bolalar ismlari';
  }
  function groupUrl(group){
    if(group === 'qiz-bolalar-ismlari') return '/qiz-bolalar-ismlari/';
    return '/ogil-bolalar-ismlari/';
  }
  function religiousLabel(religious){
    if(religious === 'paygambarlar-ismlari') return 'Payg‘ambarlar ismlari';
    if(religious === 'sahobalar-ismlari') return 'Sahobalar ismlari';
    if(religious === 'tobeinlar-ismlari') return 'Tobeinlar ismlari';
    return '';
  }
  function findSlug(){
    const params = new URLSearchParams(location.search);
    const fromQuery = params.get('slug') || params.get('name');
    if(fromQuery) return fromQuery.replace(/^\/+|\/+$/g,'');
    const parts = location.pathname.split('/').filter(Boolean);
    const idx = parts.indexOf('ismlar');
    if(idx >= 0 && parts[idx+1]) return decodeURIComponent(parts[idx+1]);
    return '';
  }
  function renderDetail(el){
    const slug = findSlug();
    const item = DATA.find(x => String(x.slug) === slug);
    if(!item){
      document.title = 'Ism topilmadi';
      el.innerHTML = '<article class="detail-card"><div class="breadcrumb"><a href="/index.html">Bosh sahifa</a> / Ism topilmadi</div><h1>Ism topilmadi</h1><div class="meaning-box">Bu ism ma’lumotlar bazasida topilmadi.</div><div class="back-row"><a class="btn-soft" href="/index.html#search">Boshqa ism qidirish</a></div></article>';
      return;
    }
    document.title = item.name + ' ismining ma’nosi';
    const desc = item.name + ' ismining ma’nosi: ' + (item.meaning || '');
    document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', item.name + ' ismining ma’nosi');
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', desc);
    const same = sortNames(DATA.filter(x => x.slug !== item.slug && (x.group === item.group || (item.religious && x.religious === item.religious)))).slice(0, 6);
    const related = same.map(x => '<a class="name-link" href="/ismlar/'+escapeHtml(x.slug)+'/"><span>'+escapeHtml(x.name)+'</span><small>›</small></a>').join('');
    const relLabel = religiousLabel(item.religious);
    const relPill = relLabel ? '<span class="pill">Diniy bo‘lim: '+escapeHtml(relLabel)+'</span>' : '';
    el.innerHTML = '<article class="detail-card">'
      + '<div class="breadcrumb"><a href="/index.html">Bosh sahifa</a> / <a href="'+groupUrl(item.group)+'">'+groupLabel(item.group)+'</a> / '+escapeHtml(item.name)+'</div>'
      + '<h1>'+escapeHtml(item.name)+' ismining ma’nosi</h1>'
      + '<div class="meaning-box">'+escapeHtml(item.meaning)+'</div>'
      + '<div class="ad-box ad-inline-detail"><span>REKLAMA JOYI<br><small>(300x90)</small></span></div>'
      + '<div class="meta"><span class="pill">Bo‘lim: '+groupLabel(item.group)+'</span>'+relPill+'</div>'
      + '<div class="back-row"><a class="btn-soft" href="'+groupUrl(item.group)+'">← Bo‘limga qaytish</a><a class="btn-soft" href="/index.html#search">Boshqa ism qidirish</a></div>'
      + '</article>'
      + '<section class="section-card"><h2 class="section-title">O‘xshash ismlar</h2><div class="name-grid">'+related+'</div></section>';
  }
  function updateCounts(){
    document.querySelectorAll('[data-count-religious]').forEach(el => {
      const key = el.dataset.countReligious;
      const count = DATA.filter(x => x.religious === key).length;
      el.textContent = count + ' ta ism';
    });
    document.querySelectorAll('[data-count-group]').forEach(el => {
      const key = el.dataset.countGroup;
      const count = DATA.filter(x => x.group === key).length;
      el.textContent = count + ' ta ism';
    });
  }
  document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('[data-render-names]').forEach(renderList);
    document.querySelectorAll('[data-render-detail]').forEach(renderDetail);
    updateCounts();
  });
})();
