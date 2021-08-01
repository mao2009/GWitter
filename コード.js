const API_KEY = getProperty("API_KEY");
const API_SECRET_KEY = getProperty("API_SECRET_KEY");
const SERVICE_NAME = getProperty("SERVICE_NAME")

// インスタンスの生成
const twitter = new Gwitter(API_KEY, API_SECRET_KEY, SERVICE_NAME);

function test(){
  twitter.tweet("test");
}

// アプリを連携認証する
function authorize() {
  twitter.authorize();
}

// 認証を解除する
function reset() {
  twitter.reset();
}

// 認証後のコールバック
function authCallback(request) {
  return twitter.authCallback(request);
}

function getValue(sheetName, row , column){
  const book = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = book.getSheetByName(sheetName)
  const range =  sheet.getRange(row,column)
  return  range.getValue()
}

function setValue(sheetName, row , column, value){
  const book = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = book.getSheetByName(sheetName)
  sheet.getRange(row,column).setValue(value);
}

function setKeys(){
  setProperty("API_KEY", "");
  setProperty("API_SECRET_KEY", "");
  setProperty("SERVICE_NAME","");
}

function setProperty(key, value){
  PropertiesService.getScriptProperties().setProperty(key,value);
}

function getProperty(key){
  return PropertiesService.getScriptProperties().getProperty(key);
}
