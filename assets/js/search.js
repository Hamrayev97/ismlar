
const DATA = window.NAMES_DATA || [];
function localHref(url){
  if(location.protocol === 'file:' && url && url.startsWith('/')){
    const css = document.querySelector('link[rel=\"stylesheet\"]');
    const pref = css ? css.getAttribute('href').replace('assets/css/style.css','') : '';
    return pref + url.replace(/^\\//,'') + (url.endsWith('/') ? 'index.html' : '');
  }
  return url;
}
function norm(s){return (s||'').toString().toLowerCase().replace(/[‘’ʻ']/g,'').replace(/oʻ|o‘/g,'o').replace(/gʻ|g‘/g,'g').trim()}
function renderResults(q, targetId){
  const box=document.getElementById(targetId); if(!box) return;
  const query=norm(q); box.innerHTML='';
  if(query.length<1){return;}
  const items=DATA.filter(x => norm(x.name).includes(query) || norm(x.meaning).includes(query)).slice(0,12);
  if(!items.length){box.innerHTML='<div class="empty">Mos ism topilmadi.</div>';return;}
  box.innerHTML=items.map(x=>`<a class="result-item" href="${localHref(x.url)}"><b>${x.name}</b><span>${x.meaning}</span></a>`).join('');
}
document.addEventListener('input',e=>{ if(e.target.matches('[data-search]')) renderResults(e.target.value, e.target.dataset.target || 'searchResults'); });
