"use strict";
(() => {
  const $ = (id) => document.getElementById(id);
  const form = $('strategy-form');
  const status = $('service-status');
  const formStatus = $('form-status');
  const schoolCount = $('school-count');
  const schoolGrid = $('schools');
  const galleryMessage = $('gallery-message');
  const detailDialog = $('detail-dialog');
  const schoolDialog = $('school-dialog');
  const submitButton = $('submit-button');
  const previewButton = $('preview-button');
  const loadMore = $('load-more');
  const PAGE_SIZE = 200;
  const fields = [
    'school_name', 'topic', 'activity_code', 'activity_name', 'activity_description',
    'target_audience','suggested_time','key_opinions','indicators',
    'hps_focus','hps_evidence','ophelia_focus','ophelia_evidence',
    'hps_success','ophelia_success','hps_pitfalls','ophelia_pitfalls',
    'hps_collab','ophelia_collab','hps_check','ophelia_check'
  ];
  const cfg = window.HEALTH_DODO_SHARE_CONFIG || {};
  const dbReady = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test((cfg.supabaseUrl||'').trim()) && /^sb_publishable_|^eyJ/.test((cfg.supabasePublishableKey||'').trim());
  let db = null;
  let posts = [];
  let filteredSchools = [];
  let nextPage = 0;
  let hasMore = false;
  let demo = !dbReady;
  let isBusy = false;

  function ntext(text) { return document.createTextNode(String(text ?? '')); }
  function node(tag, cls, text) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = String(text ?? '');
    return el;
  }
  function setService(mode, message) {
    status.className = 'service-status' + (mode ? ' ' + mode : '');
    status.textContent = message;
  }
  function setFormMessage(message, type='') {
    formStatus.textContent = message;
    formStatus.className = 'form-status' + (type ? ' ' + type : '');
  }
  function schoolKey(name) { return String(name || '').normalize('NFKC').replace(/[\s\u3000]+/g,'').toLocaleLowerCase('zh-TW'); }
  function safeValue(v) { return (v && String(v).trim()) || '尚未填寫'; }
  function formData() {
    const d = new FormData(form);
    return Object.fromEntries(fields.map((f) => [f, String(d.get(f) || '').trim()]));
  }
  function formatDate(s) {
    if (!s) return '';
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? '' : new Intl.DateTimeFormat('zh-TW',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Asia/Taipei'}).format(d);
  }
  function groupSchools(query='') {
    const map = new Map();
    for (const p of posts) {
      const key = schoolKey(p.school_name);
      if (!key) continue;
      if (!map.has(key)) map.set(key,{key,name:p.school_name,posts:[]});
      map.get(key).posts.push(p);
    }
    const schools = [...map.values()].sort((a,b)=>{
      const da = a.posts[0]?.created_at||''; const dbb = b.posts[0]?.created_at||'';
      return dbb.localeCompare(da) || a.name.localeCompare(b.name,'zh-Hant');
    });
    const q = query.trim().toLocaleLowerCase('zh-TW');
    return q ? schools.filter(s=>[s.name,...s.posts.flatMap(p=>[p.activity_name,p.activity_code,p.topic])].some(v=>String(v||'').toLocaleLowerCase('zh-TW').includes(q))) : schools;
  }
  function renderSchools() {
    const q = $('search-schools').value;
    filteredSchools = groupSchools(q);
    const overall = groupSchools();
    schoolCount.textContent = `${overall.length} 所學校 · ${posts.length} 項策略`;
    schoolGrid.replaceChildren();
    galleryMessage.textContent = demo ? '以下為示範資料，非實際投稿。啟用資料庫後，此處將顯示各校公開分享的內容。' : (hasMore ? '已載入部分分享；可按「載入更多策略」取得其他資料。' : '點選學校查看所有已載入的策略。');
    loadMore.hidden = demo || !hasMore;
    if (!filteredSchools.length) {
      const empty = node('div','empty');
      empty.append(node('strong',null, q ? '找不到符合條件的分享' : '目前還沒有策略分享'));
      empty.append(node('p',null,q?'請更換學校名稱或策略關鍵字。':'歡迎成為第一位分享健康促進策略的夥伴。'));
      schoolGrid.append(empty);
      return;
    }
    filteredSchools.forEach((school,i)=>{
      const b = node('button','school-card'); b.type='button';
      b.setAttribute('aria-label',`開啟 ${school.name} 的 ${school.posts.length} 項策略`);
      const top=node('div','school-card-top');
      top.append(node('span','school-index',String(i+1).padStart(2,'0')));
      top.append(node('span','school-count',`${school.posts.length} 項策略`));
      const mid=node('div');mid.append(node('h3',null,school.name));
      mid.append(node('p','school-topics',[...new Set(school.posts.map(x=>x.topic).filter(Boolean))].slice(0,3).join(' · ')));
      const foot=node('div','school-card-bottom');foot.append(node('span',null,`最近分享 ${formatDate(school.posts[0].created_at)||'示範'}`));foot.append(node('span',null,'查看成果 ↗'));
      b.append(top,mid,foot); b.addEventListener('click',()=>openSchool(school.key)); schoolGrid.append(b);
    });
  }
  function openSchool(key) {
    const s = groupSchools().find(x=>x.key===key);
    if (!s) return;
    $('school-dialog-title').textContent = s.name;
    const area=$('school-items');area.replaceChildren();
    s.posts.forEach(p=>{
      const b=node('button','school-entry');b.type='button';
      const left=node('div');left.append(node('small',null,`${p.topic||'健康促進'} ｜ ${p.activity_code ? p.activity_code+' ｜ ':''}${formatDate(p.created_at)||'示範資料'}`));left.append(node('b',null,p.activity_name));
      b.append(left,node('span','arrow','↗'));
      b.addEventListener('click',()=>{schoolDialog.close();openDetail(p)});
      area.append(b);
    });
    schoolDialog.showModal();
  }
  function row(label,value) {
    const r=node('div','detail-row');r.append(node('div','head',label),node('div','value',safeValue(value)));return r;
  }
  function matrixCell(text,cls='') {return node('div',cls,safeValue(text));}
  function openDetail(p,preview=false) {
    $('detail-eyebrow').textContent = preview ? 'PREVIEW · 尚未發布' : (p.demo ? 'DEMO · 示範策略' : 'PUBLISHED · 策略分享');
    const content=$('detail-content');content.replaceChildren();
    const head=node('div','detail-heading');
    const code=p.activity_code?`${p.activity_code} · `:'';
    head.append(node('span','detail-tag',p.topic||'健康促進'),node('span','detail-tag',p.school_name||'學校未填'));
    const h=node('h2');h.id='detail-title';h.textContent=code+p.activity_name;head.append(h);
    head.append(node('p',null,preview?'請確認內容，關閉預覽後再按下發布。':`分享日期：${formatDate(p.created_at)||'示範資料'}`));content.append(head);
    content.append(node('h3','table-caption','（一）落地執行要領表'));
    const t=node('div','detail-table');
    for(const [label,key] of [
      ['活動名稱','activity_name'],['活動執行說明','activity_description'],['建議對象','target_audience'],
      ['建議時間','suggested_time'],['關鍵意見','key_opinions'],['成效指標','indicators'],
      ['HPS 六大範疇中特別需要注意的事項','hps_focus'],['HPS 判定依據與執行重點','hps_evidence'],
      ['Ophelia 八大原則中特別需要注意的事項','ophelia_focus'],['Ophelia 判定依據與執行重點','ophelia_evidence']
    ])t.append(row(label,key==='activity_name' ? code+p.activity_name:p[key]));
    content.append(t);
    content.append(node('h3','table-caption','（二）成敗關鍵及行政檢核'));
    const m=node('div','detail-matrix');
    for(const x of ['注意事項','HPS 六大範疇','Ophelia 八大原則'])m.append(matrixCell(x,'matrix-head'));
    for(const [label,a,b] of [
      ['成敗關鍵提醒','hps_success','ophelia_success'],['常見問題','hps_pitfalls','ophelia_pitfalls'],
      ['建議搭配','hps_collab','ophelia_collab'],['行政檢核問句','hps_check','ophelia_check']
    ])m.append(matrixCell(label,'matrix-label'),matrixCell(p[a]),matrixCell(p[b]));
    content.append(m);
    content.append(node('p','detail-disclaimer',p.demo?'本頁為虛構教學示範，不代表真實學校投稿。':'內容由分享者自行提供，代表學校與資料均未經網站驗證；請依實際校情自行判讀。'));
    detailDialog.showModal();
  }
  async function loadPage(reset=false) {
    if(!db || isBusy) return;
    isBusy=true;
    $('refresh').disabled=true;
    loadMore.disabled=true;
    try {
      if(reset){nextPage=0;posts=[];hasMore=false;}
      const {data,error}=await db.from('strategy_shares').select('*').order('created_at',{ascending:false}).range(nextPage,nextPage+PAGE_SIZE-1);
      if(error) throw error;
      const fresh=Array.isArray(data)?data:[];
      const existing=new Set(posts.map(p=>p.id));
      posts.push(...fresh.filter(x=>!existing.has(x.id)));
      nextPage+=fresh.length;
      hasMore=fresh.length===PAGE_SIZE;
      setService('',`共用資料庫已連線。所有學員可瀏覽策略成果，發布內容會儲存在跨裝置共用的資料庫中。`);
      renderSchools();
    } catch(e){
      setService('error','資料庫連線或讀取失敗：目前無法確認最新分享。請檢查設定與網路連線。');
      galleryMessage.textContent=`讀取失敗：${e.message||'未知錯誤'}`;
      renderSchools();
    } finally{isBusy=false;$('refresh').disabled=false;loadMore.disabled=false;}
  }
  async function publish(e) {
    e.preventDefault();
    if(!db){setFormMessage('尚未啟用共用資料庫，暫時只能預覽，不能將策略公開發布。','error');return;}
    if(!form.reportValidity()) {setFormMessage('請先完成必填欄位。','error');return;}
    if(!$('consent').checked){setFormMessage('請先確認公開分享及個人資料聲明。','error');return;}
    const data=formData();
    if(data.school_name.length<2 || data.activity_name.length<2 || data.activity_description.length<12){setFormMessage('學校與活動名稱至少2字，活動執行說明至少12字。','error');return;}
    if(isBusy)return;
    isBusy=true;submitButton.disabled=true;submitButton.textContent='發布中…';setFormMessage('正在儲存策略，請勿重複提交。');
    try{
      const {error}=await db.from('strategy_shares').insert(data);
      if(error)throw error;
      form.reset();
      setFormMessage('策略已成功儲存在共用資料庫，現在可以在學校策略地圖中找到它。','success');
      await loadAfterPublish();
      $('gallery').scrollIntoView({behavior:'smooth'});
    }catch(err){setFormMessage(`發布失敗，資料尚未保存：${err.message||'未知錯誤'}`,'error');}
    finally{isBusy=false;submitButton.disabled=false;submitButton.textContent='確認發布策略 ↗';}
  }
  async function loadAfterPublish(){
    // 避免重入，發布完成後直接重取第一頁；新稿會排在最前。
    const {data,error}=await db.from('strategy_shares').select('*').order('created_at',{ascending:false}).range(0,PAGE_SIZE-1);
    if(error){setService('error','發布成功，但重新載入清單失敗。可使用「重新整理」稍後再試。');return;}
    posts=data||[];nextPage=posts.length;hasMore=posts.length===PAGE_SIZE;renderSchools();
  }
  function init() {
    $('goto-compose').addEventListener('click',()=>$('compose').scrollIntoView({behavior:'smooth'}));
    $('goto-gallery').addEventListener('click',()=>$('gallery').scrollIntoView({behavior:'smooth'}));
    $('search-schools').addEventListener('input',renderSchools);
    $('refresh').addEventListener('click',()=>loadPage(true));
    loadMore.addEventListener('click',()=>loadPage(false));
    $('preview-button').addEventListener('click',()=>{
      if(!form.reportValidity()){setFormMessage('請先填寫學校、活動名稱與執行說明，再預覽。','error');return;}
      openDetail({...formData(),created_at:new Date().toISOString()},true);
    });
    form.addEventListener('submit',publish);
    document.querySelectorAll('[data-close]').forEach(btn=>btn.addEventListener('click',()=>$(btn.dataset.close).close()));
    [detailDialog,schoolDialog].forEach(d=>d.addEventListener('click',(e)=>{if(e.target===d)d.close()}));
    if(!dbReady){
      demo=true;
      posts=Array.isArray(window.HEALTH_DODO_DEMO_STRATEGIES)?window.HEALTH_DODO_DEMO_STRATEGIES:[];
      setService('demo','目前為示範模式：可點選學校檢視範例、填寫並預覽策略。尚未連接共用資料庫，因此不能公開投稿。');
      submitButton.disabled=true;submitButton.title='須由管理者完成 Supabase 資料庫設定後才可發布';
      $('refresh').disabled=true;
      renderSchools();
      return;
    }
    if(!window.supabase || typeof window.supabase.createClient!=='function') {
      setService('error','目前無法載入資料庫連線元件，請確認網路或聯繫網站管理者。');
      submitButton.disabled=true;
      renderSchools();
      return;
    }
    db=window.supabase.createClient(cfg.supabaseUrl.trim().replace(/\/$/,''),cfg.supabasePublishableKey.trim(),{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
    demo=false;
    setService('','正在連接共用資料庫…');
    loadPage(true);
  }
  init();
})();
