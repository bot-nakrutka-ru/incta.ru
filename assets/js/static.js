(() => {
  'use strict';
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
  $$('.static-menu-btn').forEach(button => button.addEventListener('click', () => {
    const nav=button.closest('.main-menu');const open=nav.classList.toggle('static-menu-open');
    button.setAttribute('aria-expanded', String(open));
  }));
  $$('.static-tip-next').forEach(button => button.addEventListener('click', () => {
    const body=button.closest('.sovet-item')?.querySelector('.sovet-item__body');
    if(!body || !Array.isArray(window.INCTA_TIPS) || !window.INCTA_TIPS.length)return;
    const list=window.INCTA_TIPS;
    const cur=Number(button.dataset.index||0);
    const next=(cur+1)%list.length;
    body.innerHTML=list[next];button.dataset.index=String(next);
  }));
  $$('.contents-wraps__title').forEach(button => button.addEventListener('click', () => {
    const root=button.closest('.contents-wraps');const collapsed=root.classList.toggle('is-collapsed');
    button.setAttribute('aria-expanded',String(!collapsed));
    const label=$('.contents-wraps__show-hide',button);if(label)label.textContent=collapsed?'Развернуть':'Свернуть';
  }));
  $$('.static-poll').forEach((poll) => {
    const button=$('.static-poll-send',poll); const msg=$('.static-poll-message',poll);
    const key='incta-poll-'+poll.dataset.pollId;
    try { const value=localStorage.getItem(key);if(value!==null){
      const input=$$('input[type=radio]',poll).find(i=>i.value===value);
      if(input)input.checked=true;
      if(msg){msg.hidden=false;msg.textContent='Ваш ответ: '+(input?.closest('label')?.textContent.trim()||'выбран');}
    } } catch(e) {}
    if(button)button.addEventListener('click',()=>{
      const selected=$('input[type=radio]:checked',poll);
      if(!selected){if(msg){msg.hidden=false;msg.textContent='Выберите вариант ответа.';}return;}
      try{localStorage.setItem(key,selected.value);}catch(e){}
      if(msg){msg.hidden=false;msg.textContent='Ваш ответ: '+(selected.closest('label')?.textContent.trim()||'выбран');}
    });
  });
  $$('.static-share').forEach(b=>b.addEventListener('click',async()=>{
    const data={title:document.title,url:location.href};
    try{if(navigator.share){await navigator.share(data);return;}
      await navigator.clipboard.writeText(data.url);b.textContent='Ссылка скопирована';
    }catch(e){ if(!navigator.share) window.prompt('Скопируйте ссылку:',data.url);}
  }));
  const results=$('#search-results');
  if(results && Array.isArray(window.INCTA_SEARCH)){
    const input=$('.static-search-form input');
    const q=(new URLSearchParams(location.search)).get('q')||'';
    if(input)input.value=q;
    const clean=v=>v.normalize('NFKC').toLocaleLowerCase('ru');
    const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const terms=clean(q).split(/\s+/).filter(Boolean);
    const hits=terms.length?window.INCTA_SEARCH.filter(post=>terms.every(t=>clean(post.title+' '+post.excerpt+' '+post.categories+' '+(post.body||'')).includes(t))).sort((a,b)=>{
      const score=post=>terms.reduce((n,t)=>n+(clean(post.title).includes(t)?9:0)+(clean(post.categories).includes(t)?4:0)+(clean(post.excerpt).includes(t)?2:0),0);
      return score(b)-score(a);
    }):window.INCTA_SEARCH.slice(0,25);
    const label=$('#search-count');if(label)label.textContent=terms.length?`Найдено материалов: ${hits.length}`:'Введите запрос или посмотрите последние материалы.';
    results.innerHTML=hits.length?hits.slice(0,100).map(post=>`<div class="static-result"><small>${esc(post.categories)}</small><h2><a href="${esc(post.url)}">${esc(post.title)}</a></h2><p>${esc(post.excerpt)}</p></div>`).join(''):'<p>По вашему запросу ничего не найдено. Попробуйте другие слова.</p>';
  }
  const lightbox=document.createElement('div');lightbox.className='static-lightbox';lightbox.setAttribute('role','dialog');lightbox.setAttribute('aria-label','Просмотр изображения');
  lightbox.innerHTML='<button type="button" aria-label="Закрыть">×</button><img alt="">';document.body.appendChild(lightbox);
  const close=()=>lightbox.classList.remove('is-open');$('.static-lightbox button',document)?.addEventListener('click',close);
  lightbox.addEventListener('click',e=>{if(e.target===lightbox)close();});document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  $$('.page-content__text a').forEach(a=>{
    const img=$('img',a); if(!img)return;
    a.addEventListener('click',e=>{
      const href=a.getAttribute('href')||'';
      if(!/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(href))return;
      e.preventDefault();$('.static-lightbox img').src=img.currentSrc||img.src;lightbox.classList.add('is-open');
    });
  });
})();
