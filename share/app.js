"use strict";
(() => {
  const $ = (id) => document.getElementById(id);
  const cfg = window.DODO_SHARE_CONFIG || {};
  const demo = (window.DODO_DEMO_RECORDS || []).map(x => ({...x, demo: true}));
  let records = demo;
  let liveConnected = false;
  let lastRequest = 0;
  const clean = (s) => String(s == null ? '' : s).trim();
  const topics = ['視力保健','口腔保健','全民健保','健康體位','菸檳防制','全面性教育','正向心理健康促進','其他'];

  function safeBackendUrl(value) {
    try {
      const u = new URL(value);
      if (u.protocol !== 'https:' || u.hostname !== 'script.google.com' || !/^(?:\/macros\/s|\/a\/macros\/[A-Za-z0-9.-]+\/s)\/[A-Za-z0-9_-]+\/exec\/?$/.test(u.pathname)) return null;
      return u;
    } catch { return null; }
  }
  function make(tag, cls, content) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (content !== undefined) el.textContent = String(content);
    return el;
  }
  function labelDemo(el, isDemo) {
    if (isDemo) el.append(make('span','demo-badge','示範案例'));
  }
  function filtered() {
    const term = clean($('search-box').value).toLocaleLowerCase();
    const topic = $('topic-filter').value;
    return records.filter(r => (!topic || r.topic === topic) && (!term || [r.school,r.title,r.topic,r.execution].some(v => clean(v).toLocaleLowerCase().includes(term))));
  }
  function groupSchools(data) {
    const groups = new Map();
    for (const r of data) {
      const name = clean(r.school) || '未填學校';
      if (!groups.has(name)) groups.set(name, []);
      groups.get(name).push(r);
    }
    return [...groups.entries()].sort((a,b) => a[0].localeCompare(b[0],'zh-Hant'));
  }
  function render() {
    const groups = groupSchools(filtered());
    $('school-total').textContent = String(groups.length).padStart(2,'0');
    const parent = $('schools');
    parent.replaceChildren();
    $('empty-message').hidden = groups.length > 0;
    for (const [school,items] of groups) {
      const b = make('button','school-card');
      b.type = 'button';
      const top = make('div','school-card-top');
      top.append(make('span','school-symbol','✳'),make('span','school-count',`${items.length} 項策略`));
      b.append(top, make('h3','',school));
      const topicSet = [...new Set(items.map(x=>x.topic).filter(Boolean))];
      b.append(make('p','',topicSet.join(' · ') || '健康促進策略'));
      labelDemo(b,items.every(x=>x.demo));
      b.append(make('span','school-more','查看策略 ↗'));
      b.addEventListener('click',()=>openSchool(school,items));
      parent.append(b);
    }
  }
  function showDialog(dialog) { if (!dialog.open) dialog.showModal(); }
  function openSchool(school, items) {
    $('school-dialog-title').textContent = school;
    const parent = $('school-strategies');
    parent.replaceChildren();
    for (const r of items) {
      const btn = make('button','strategy-list-row'); btn.type='button';
      const head = make('div','strategy-list-heading');
      head.append(make('strong','',r.title),make('span','arrow','↗'));
      btn.append(head,make('span','strategy-list-meta',r.topic || '健康促進'));
      labelDemo(btn,r.demo);
      btn.addEventListener('click',()=>{ $('school-dialog').close(); openStrategy(r); });
      parent.append(btn);
    }
    showDialog($('school-dialog'));
  }
  function appendSection(parent,title,content) {
    const section = make('section','detail-section');
    section.append(make('h3','',title),make('div','detail-text',content || '未提供'));
    parent.append(section);
  }
  function openStrategy(r) {
    const parent=$('strategy-details');parent.replaceChildren();
    parent.append(make('p','detail-topic',r.topic));
    parent.append(make('h2','detail-title',r.title));
    const meta=make('p','detail-meta',r.school + (r.demo ? ' · 虛構示範案例' : ' · 學員分享'));
    parent.append(meta);
    appendSection(parent,'（一）落地執行要領表',r.execution);
    appendSection(parent,'（二）成敗關鍵及行政檢核',r.evaluation);
    const copy=make('button','action action-outline copy-btn','複製完整策略');copy.type='button';
    copy.onclick=async()=>{try{await navigator.clipboard.writeText(`${r.school}\n${r.title}\n\n（一）落地執行要領表\n${r.execution}\n\n（二）成敗關鍵及行政檢核\n${r.evaluation}`);copy.textContent='已複製 ✓';}catch{copy.textContent='無法自動複製，請手動選取文字。';}};
    parent.append(copy);showDialog($('strategy-dialog'));
  }
  function setupForm(url) {
    let u;
    try { u = new URL(url); } catch { return; }
    if (u.protocol !== 'https:' || !['docs.google.com','forms.gle'].includes(u.hostname)) return;
    if (u.hostname==='docs.google.com' && !u.pathname.includes('/forms/')) return;
    // 直接顯示已連結 Google Sheets 的 Google 表單，不再開啟其他分頁。
    u.searchParams.set('embedded','true');
    $('form-connected').hidden=false;
    $('form-unconnected').hidden=true;
    const frame=$('form-frame');
    if(frame.dataset.loadedUrl!==u.href){
      frame.dataset.loadedUrl=u.href;
      $('embed-loading').hidden=false;
      frame.addEventListener('load',()=>{ $('embed-loading').hidden=true; },{once:true});
      frame.src=u.href;
    }
  }
  function normalizeRecord(r) {
    const school=clean(r.school).slice(0,120),title=clean(r.title).slice(0,180);
    if(!school||!title) return null;
    return {id:clean(r.id),school,topic:topics.includes(r.topic)?r.topic:'其他',title,execution:clean(r.execution).slice(0,50000),evaluation:clean(r.evaluation).slice(0,50000),date:clean(r.date),demo:false};
  }
  function jsonp(url) {
    return new Promise((resolve,reject)=>{
      const fname='dodoJsonp'+Math.random().toString(36).slice(2);
      const script=document.createElement('script');
      let done=false;
      const timer=window.setTimeout(()=>settle(new Error('連線逾時')),14000);
      function settle(error,data){if(done)return;done=true;clearTimeout(timer);delete window[fname];script.remove();error?reject(error):resolve(data);}
      window[fname]=(obj)=>settle(null,obj);
      const u=new URL(url);u.searchParams.set('callback',fname);u.searchParams.set('t',String(Date.now()));
      script.src=u.href;script.async=true;script.onerror=()=>settle(new Error('無法連線'));document.head.append(script);
    });
  }
  async function refresh() {
    const n=++lastRequest;
    const backend=safeBackendUrl(cfg.googleAppsScriptUrl);
    if(!backend){liveConnected=false;records=demo;render();$('connection-state').textContent='展示模式｜Google 表單尚未連接。以下為虛構示範案例。';return;}
    $('connection-state').textContent='正在讀取各校分享…';
    try {
      const data=await jsonp(backend.href);
      if(n!==lastRequest)return;
      if(!data||data.ok!==true||!Array.isArray(data.records))throw new Error(data?.error || '回傳格式不正確');
      liveConnected=true;
      records=data.records.map(normalizeRecord).filter(Boolean);
      // 沒有真實投稿時明確呈現示範案例，不把它混進真實成果數量。
      if(records.length===0)records=demo;
      if(data.formUrl) setupForm(data.formUrl);
      $('connection-state').textContent=data.records.length?`已連接 Google 表單｜目前收錄 ${data.records.length} 項策略`:'已連接 Google 表單｜目前尚無正式投稿，以下為虛構示範案例。';
      render();
    } catch(e) {
      if(n!==lastRequest)return;
      liveConnected=false;records=demo;render();
      $('connection-state').textContent='暫時無法取得 Google 表單資料，現僅顯示示範案例。';
    }
  }
  $('search-box').addEventListener('input',render);
  $('topic-filter').addEventListener('change',render);
  $('refresh-btn').addEventListener('click',refresh);
  $('view-submissions').addEventListener('click',()=>{ 
    $('explore').scrollIntoView({behavior:'smooth',block:'start'});
    refresh();
  });
  document.querySelectorAll('[data-close]').forEach(btn=>btn.addEventListener('click',()=>$(btn.dataset.close).close()));
  for(const id of ['school-dialog','strategy-dialog']) $(id).addEventListener('click',e=>{ if(e.target===$(id))$(id).close(); });
  refresh();
})();
