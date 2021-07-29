const API_KEY = getProperty("API_KEY");
const API_SECRET_KEY = getProperty("API_SECRET_KEY");

// インスタンスの生成
const twitter = new Gwitter(API_KEY, API_SECRET_KEY, "GwitterTest");

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

function updataName() {
  const NAME = "loach"; 
  const CAT = "ᓚᘏᗢ ";
  const MEOW = "ﾆｬｰﾝ";
  const SHEET_NAME = "猫";
  const ROW = "2";
  const COL = "1";

  const MAX_COUNT = 5;

  const count = getValue(SHEET_NAME, ROW, COL)
  const payload = {name:`${NAME} ${CAT.repeat(count)}${MEOW}`}
  twitter.updateProfile(payload);

  if (count >= MAX_COUNT) {
    setValue(SHEET_NAME, ROW, COL, 1);
  } else {
    setValue(SHEET_NAME, ROW, COL, count + 1);
  }

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
}
function setProperty(key, value){
  PropertiesService.getScriptProperties().setProperty(key,value);
}

function getProperty(key){
  return PropertiesService.getScriptProperties().getProperty(key);
}
