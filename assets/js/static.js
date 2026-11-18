(() => {
  'use strict';
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

  // The mobile navigation expands in normal document flow and stays clickable.
  $$('.static-menu-btn').forEach(button => {
    const nav = button.closest('.main-menu');
    const links = nav?.querySelector('.site-nav__list');
    if (!nav || !links) return;
    if (!links.id) links.id = 'site-mobile-nav';
    button.setAttribute('aria-controls', links.id);
    const close = () => {
      nav.classList.remove('static-menu-open');
      button.setAttribute('aria-expanded', 'false');
      button.textContent = '☰ Меню';
    };
    button.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('static-menu-open');
      button.setAttribute('aria-expanded', String(isOpen));
      button.textContent = isOpen ? '× Закрыть' : '☰ Меню';
    });
    links.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
    document.addEventListener('pointerdown', event => {
      if (!nav.contains(event.target)) close();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('static-menu-open')) {
        close();
        button.focus();
      }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 850 && nav.classList.contains('static-menu-open')) close();
    });
  });
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

  // Single source of truth for service cards on every static page.
  const usefulServices = [
    {name:'@InstaAnonymBot', description:'Анонимный просмотр сторис и других медиа в Инстаграм, ТикТок и VK.', url:'https://spyig.com/r?start=569CE832', image:'local:services/spyig.jpg'},
    {name:'@Smm_bloger_bot', description:'Телеграм-бот с инструментами продвижения в социальных сетях.', url:'https://t.me/Smm_bloger_bot?start=site-inctanew', image:'local:services/smmbot.jpg'},
    {name:'ВК Шпион', description:'Отслеживание времени онлайн и активности пользователей ВКонтакте.', url:'https://kogdavseti.ru/?p=9fc31733b273680a0531eee5c8a1e502', image:'local:services/kogdavseti.ico'},
    {name:'Instashpion', description:'Смотреть анонимно информацию о профиле и активности в Инстаграм.', url:'https://instashpion.ru?p=921de55fab9b959bd25b87375cf9e0f9', image:'local:services/item-3.png'},
    {name:'InstaParser', description:'Сбор и анализ аудитории Инстаграм по аккаунтам, хештегам и геолокации.', url:'https://insta-parser.ru?p=c9437b5a39a886169827e5f43de34eeb', image:'local:services/insta-parser.ico'},
    {name:'Getwinner', description:'Сервис для проведения розыгрышей и выбора победителей.', url:'https://getwinner.ru?p=523e10f83226bd9651c0d603277d19d0', image:'local:services/getwinner.ico'},
    {name:'Spamguardapp', description:'Умный сервис очистки и мониторинга спам-активности.', url:'https://ru.spamguardapp.com?p=bf454866c06f29b8c41a21107e1f5801', image:'local:services/item-5.png'},
    {name:'livedune', description:'Аналитика аккаунтов и статистики в социальных сетях.', url:'https://livedune.ru/?from=8e852a8500', image:'local:services/item-7.png'}
  ];
  const assetRoot = (document.querySelector('link[href*="assets/css/static.css"]')?.getAttribute('href') || './assets/css/static.css').split('assets/css/static.css')[0];
  $$('.list-services, .list-services-aside').forEach(list => {
    const fragment = document.createDocumentFragment();
    usefulServices.forEach(service => {
      const item = document.createElement('div');
      item.className = 'item-service list-services__item';
      const iconWrapper = document.createElement('div');
      iconWrapper.className = 'item-service__img';
      const icon = document.createElement('img');
      icon.src = service.image.startsWith('local:') ? assetRoot + 'assets/theme/img/' + service.image.slice(6) : service.image;
      icon.alt = service.name;
      icon.loading = 'lazy';
      icon.width = 61;
      icon.height = 61;
      icon.addEventListener('error', () => {
        if (icon.dataset.fallback) return;
        icon.dataset.fallback = '1';
        icon.src = assetRoot + 'assets/theme/img/icon-services.png';
      });
      iconWrapper.appendChild(icon);
      const contents = document.createElement('div');
      contents.className = 'item-service__content';
      const title = document.createElement('a');
      title.className = 'item-service__title';
      title.href = service.url;
      title.target = '_blank';
      title.rel = 'noopener noreferrer sponsored';
      title.textContent = service.name;
      const description = document.createElement('div');
      description.className = 'item-service__text';
      description.textContent = service.description;
      contents.append(title, description);
      item.append(iconWrapper, contents);
      fragment.appendChild(item);
    });
    list.replaceChildren(fragment);
  });
  const homeServices = $('.page-site--index .section-item--aside');
  const homeFaq = $('.page-site--index .section-item--faq');
  if (homeServices && homeFaq && homeServices.parentNode === homeFaq.parentNode) {
    homeFaq.parentNode.insertBefore(homeServices, homeFaq);
  }
  $$('aside.item-section--aside').forEach(aside => {
    const blocks = $$('.section-aside', aside);
    const faq = blocks.find(block => $('.title-middle', block)?.textContent.trim() === 'Частые вопросы');
    const services = blocks.find(block => $('.title-middle', block)?.textContent.trim() === 'Полезные сервисы');
    // Keep services above both the FAQ and the useful tip on every page.
    if (services && blocks.length && blocks[0] !== services) {
      aside.insertBefore(services, blocks[0]);
    }
  });

})();
