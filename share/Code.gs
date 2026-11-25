/**
 * 健促 AI 健多多｜策略共創分享區
 * 資料主體：Google Forms（回覆會自動連動至私有 Google Sheets）
 * 網站讀取：Apps Script 唯讀 JSONP，供 GitHub Pages 跨網域瀏覽。
 *
 * 管理者只需第一次執行 setup()，授權並部署網路應用程式。
 * 嚴禁將表單設定成收集電子郵件，或在分享表單填寫個資。
 */
const DODO = Object.freeze({
  FORM_ID_KEY: 'DODO_STRATEGY_FORM_ID',
  SHEET_ID_KEY: 'DODO_STRATEGY_SHEET_ID',
  LIMIT: 500,
  FIELDS: Object.freeze({
    school: '代表學校',
    topic: '健康促進議題',
    title: '活動名稱（可含代碼）',
    execution: '（一）落地執行要領表',
    evaluation: '（二）成敗關鍵及行政檢核'
  }),
  TOPICS: ['視力保健','口腔保健','全民健保','健康體位','菸檳防制','全面性教育','正向心理健康促進','其他']
});

/** 第一次手動執行；再次執行不會重複建立表單。 */
function setup() {
  const props = PropertiesService.getScriptProperties();
  const priorId = props.getProperty(DODO.FORM_ID_KEY);
  if (priorId) {
    const original = FormApp.openById(priorId);
    const info = {
      message: '表單已建立，不重複建立。',
      formUrl: original.getPublishedUrl(),
      formEditUrl: original.getEditUrl(),
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/' + props.getProperty(DODO.SHEET_ID_KEY) + '/edit'
    };
    Logger.log(JSON.stringify(info, null, 2));
    return info;
  }

  const form = FormApp.create('健多多｜健康促進策略共創分享表');
  form.setDescription('只要填寫代表學校、健康促進議題、活動名稱，再將健多多輸出的兩份完整分析整段貼上。\n本表單的回覆會公開顯示於策略分享區，請勿填入可辨識個人的資料。')
    .setCollectEmail(false)
    .setLimitOneResponsePerUser(false)
    .setAllowResponseEdits(false)
    .setPublishingSummary(false)
    .setConfirmationMessage('感謝分享！請返回健多多分享區，按「重新整理」查看已分享的策略。');

  form.addTextItem().setTitle(DODO.FIELDS.school).setHelpText('請填完整學校名稱；相同校名會自動彙整在同一張卡片。').setRequired(true);
  form.addListItem().setTitle(DODO.FIELDS.topic).setChoiceValues(DODO.TOPICS).setRequired(true);
  form.addTextItem().setTitle(DODO.FIELDS.title).setHelpText('例如：A01 我的壓力紅綠燈').setRequired(true);
  form.addParagraphTextItem().setTitle(DODO.FIELDS.execution)
    .setHelpText('把活動名稱、執行說明、對象、時間、關鍵意見、指標、HPS 與 Ophelia 等全部原文貼入，不必拆分。').setRequired(true);
  form.addParagraphTextItem().setTitle(DODO.FIELDS.evaluation)
    .setHelpText('把成敗關鍵、常見問題、建議搭配與行政檢核問句整段貼入，不必拆分。').setRequired(true);

  // 新版 Google Forms 的發布狀態可能要求明確設定；無此 API 的舊環境請在表單介面手動按「發布」。
  try { if (typeof form.setPublished === 'function') form.setPublished(true); }
  catch (err) { Logger.log('請到 Google 表單編輯頁確認已發布：' + err); }
  try { form.setAcceptingResponses(true); }
  catch (err) { Logger.log('若無法接受回覆，請先發布表單：' + err); }

  const spreadsheet = SpreadsheetApp.create('健多多｜策略分享回覆資料（管理用）');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, spreadsheet.getId());
  // 不開放試算表公開檢視；由 Apps Script 僅回傳表單指定公開欄位。
  props.setProperty(DODO.FORM_ID_KEY, form.getId());
  props.setProperty(DODO.SHEET_ID_KEY, spreadsheet.getId());

  const info = {
    message: '建立完成。',
    formUrl: form.getPublishedUrl(),
    formEditUrl: form.getEditUrl(),
    spreadsheetUrl: spreadsheet.getUrl()
  };
  Logger.log(JSON.stringify(info, null, 2));
  return info;
}

/** 公開唯讀 API，網站使用 callback 參數作 JSONP。禁止加入寫入功能。 */
function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const callback = String(params.callback || '');
  // 僅允許簡單 JavaScript 識別字，杜絕 JSONP 任意函式運算。
  if (callback && !/^[A-Za-z_$][A-Za-z0-9_$]{0,63}$/.test(callback)) {
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:'Invalid callback'}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  let payload;
  try {
    const formId = PropertiesService.getScriptProperties().getProperty(DODO.FORM_ID_KEY);
    if (!formId) throw new Error('請先由管理者執行 setup()。');
    const form = FormApp.openById(formId);
    const responses = form.getResponses();
    const sample = responses.slice(-DODO.LIMIT).reverse();
    const records = sample.map(r => {
      const values = {};
      r.getItemResponses().forEach(item => {
        values[item.getItem().getTitle()] = String(item.getResponse() ?? '');
      });
      return {
        id: String(r.getId() || ''),
        school: (values[DODO.FIELDS.school] || '').slice(0,120),
        topic: (values[DODO.FIELDS.topic] || '').slice(0,100),
        title: (values[DODO.FIELDS.title] || '').slice(0,180),
        execution: (values[DODO.FIELDS.execution] || '').slice(0,50000),
        evaluation: (values[DODO.FIELDS.evaluation] || '').slice(0,50000),
        date: r.getTimestamp().toISOString()
      };
    }).filter(r => r.school && r.title);
    payload = {ok:true, formUrl:form.getPublishedUrl(), records, total:responses.length, more:responses.length>DODO.LIMIT};
  } catch (error) {
    payload = {ok:false,error:'表單資料暫時無法取得，請聯絡管理者。'};
    console.error(error);
  }
  const data = JSON.stringify(payload).replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  return callback
    ? ContentService.createTextOutput(`${callback}(${data});`).setMimeType(ContentService.MimeType.JAVASCRIPT)
    : ContentService.createTextOutput(data).setMimeType(ContentService.MimeType.JSON);
}
