class Gwitter { 
  /**
   * @param {string} apiKey
   * @param {string} apiSecretKey
   * @param {string} name
   * @param {string} callbackName
   * @return {Gwitter}
   */
  constructor(apiKey, apiSecretKey, name, callbackName = "authCallback") {
    this.apiKey = apiKey;
    this.apiSecretKey = apiSecretKey;
    this.name = name;
    this.callbackName = callbackName

    this.service = this.getService();
  }

  /**
   * @return {string}
   */
  static get apiUrl(){
    return "https://api.twitter.com";
  }

  /**
   * @return {Service_}
   */
  getService() {
    return OAuth1.createService(this.name)
      // Set the endpoint URLs.
      .setAccessTokenUrl("https://api.twitter.com/oauth/access_token")
      .setRequestTokenUrl("https://api.twitter.com/oauth/request_token")
      .setAuthorizationUrl("https://api.twitter.com/oauth/authorize")

      // Set the consumer key and secret.
      .setConsumerKey(this.apiKey)
      .setConsumerSecret(this.apiSecretKey)

      .setCallbackFunction(this.callbackName)
      .setPropertyStore(PropertiesService.getUserProperties());
  }
  /**
   * @return {void}
   */
  logCallbackUrl() {
    Logger.log(this.service.logCallbackUrl());
  }

  /**
   * OAuth認証
   * @return {void}
   */
  authorize() {
    if (!this.service.hasAccess()) {
      const authorizationUrl = this.service.authorize();
      Logger.log(authorizationUrl);
    } else {
      Logger.log("Already authenticated.")
    }
  }

  /**
   * Auth認証後のコールバック
   * @param {Object} request
   * @return {HtmlService.HtmlOutput}
   */
  authCallback(request) {
    const isAuthorized = this.service.handleCallback(request);
    if (isAuthorized) {
      return HtmlService.createHtmlOutput("Success! You can close this tab.");
    } else {
      return HtmlService.createHtmlOutput("Denied. You can close this tab");
    }
  }

  /**
   * Auth認証取り消し
   * @return {void}
   */
  resetAuth() {
    OAuth1.createService(this.name)
    .setPropertyStore(PropertiesService.getUserProperties())
    .reset();
  }

  /**
   * @param {string|object} data
   * @return {object}
   */
  tweet(data) {
    const method = "post";
    const endpoint = (data.media) ? "/1.1/statuses/update_with_media" : "/1.1/statuses/update.json";
    const url = Gwitter.apiUrl + endpoint
    const params = Gwitter.getParams(data, method);

    if (typeof data === "string") {
      params.payload = {status: data};
    }
    return this.fetch(url, params);
  }

  /**
   * @param {string} id id : tweet id
   * @retrune {object}
   */
  deleteTweet(id) {
    const method = "post";
    const endpoint = `/1.1/statuses/destroy/${id}.json`
    const url = `${Gwitter.apiUrl}${endpoint}`
    return this.fetch(url,{method:method});
  }
  
  /**
   * @param {string} id id : tweet id
   * @return {object}
   */
  retweet(id) {
    const method= "post";
    const url = `${Gwitter.apiUrl}/1.1/statuses/retweet/${id}.json`;
    return this.fetch(url, {method:method,});
  }

  /**
   * @param {string} id
   * @return {object}
   */
  unretweet(id) {
    const method= "post";
    const url = `${Gwitter.apiUrl}/1.1/statuses/unretweet/${id}.json`;
    return this.fetch(url, {method:method});
  }

  /**
   * @param {string} id
   * @return {object}
   */
  favorite (id) {
    const method= "post";
    const url = `${Gwitter.apiUrl}/1.1/favorites/create.json`;
    return this.fetch(url, {
      method: method,
      payload: {id: id}
    });
  }

    /**
   * @param {string} id
   * @return {object}
   */
  unfavorite(id) {
    const method= "post";
    const endpoint = '/1.1/favorites/destroy.json';
    const url = `${url}${endpoint}`;
    const reg = /^\d*$/;
    const payload = (reg.test(id)) ? {user_id: id} : {screen_name: id};
  
    return this.fetch(url, {
      method: method,
      payload: payload
    });
  }

  /**
   * @param {string} user_id
   * @param {bool} follow_
   * @return {object}
   */
  follow(id, follow_=true) {
    const method= "post";
    const endpoint = '/1.1/friendships/create.json';
    const url = `${Gwitter.apiUrl}${endpoint}`;
    const reg = /^\d*$/;
    const payload = (reg.test(id)) ? {user_id: id} : {screen_name: id};
    payload["follow"] = follow_;

    return this.fetch(url, {
      method: method,
      payload: payload
    });
  }
  
  /**
   * @param {string} user_id
   * @return {object}
   */
  unfollow(id, follow=true) {
    const method= "post";
    const endpoint = '/1.1/friendships/destroy.json';
    const url = `${url}${endpoint}`;
    const reg = /^\d*$/;
    const payload = (reg.test(id)) ? {user_id: id} : {screen_name: id};
  
    return this.fetch(url, {
      method: method,
      payload: payload
    });
  }

  /**
   * @param {object} data data:
   *   -  name : optional
   *   -  url : optional
   *   -  location : optional
   *   -  description : optional
   *   -  profile_link_color : optional
   * 
   * @retrun {object}
   */
  updateProfile(data) {
    const method = "post";
    const endpoint = "/1.1/account/update_profile.json";
    const url = `${Gwitter.apiUrl}${endpoint}`;
    const params = Gwitter.getParams(data, method);
    return this.fetch(url, params);
    this.search
  }

  /**
   * @param {object} data
   * data:
   *   q           required
   *   geocode     optional
   *   lang        optional
   *   locale      optional
   *   result_type optional
   *     mixed : Include both popular and real time results in the response.
   *     recent : return only the most recent results in the response
   *     popular : return only the most popular results in the response.
   *   count            optional
   *   until            optional
   *   since_id         optional
   *   max_id           optional
   *   include_entities optional
   * @return {object}
   */
  search(data) {
    const method = "get";
    const endpoint = "/1.1/search/tweets.json"
    const query = (typeof data === "string") ? `?q=${Gwitter.encodeUrl(data)}` : Gwitter.getQuery(data);
    const url = `${Gwitter.apiUrl}${endpoint}${query}`;
    
    const response = this.fetch(url, {method: method});
    return response.statuses;
  }

  /**
   * @paaram {string} id
   * @return {object}
   */
  showStatuses(id) {
    const method = "get";
    const endpoint ="/1.1/statuses/show.json"
    const url = `${Gwitter.apiUrl}${endpoint}?id=${id}`
    return this.fetch(url, {method:method});
  }

  /**
   * 
   * @return {object}
   */
  friendsList() {
    const method = "get";
    const endpoint = "/1.1/friends/list.json";
    const url = `${Gwitter.apiUrl}${endpoint}`
    return this.fetch(url, {method: method});
  }

  /**
   * 
   * @returns {object}
   */
  followsList() {
    const method = "get";
    const endpoint = "/1.1/followers/list.json";
    const url = `${Gwitter.apiUrl}${endpoint}`;
    return this.fetch(url, {method: method});
  }

  /**
   * @param
   * en
   * @param {string} url - endpint url
   * @param {Object} params - {method: "post", payload:{status : "foo"}}
   * @return {Object}
   */ 
  fetch(url, params) {
    try {
      const response = this.service.fetch(url, params);
      const json = JSON.parse(response.getContentText());

      if (json) {
        if (json.error) {
          throw new Error(`${json.error} (json.request)`);
        } else if (json.errors) {
          let err = [];
          for (let i = 0, l = json.errors.length; i < l; i++) {
              const error = json.errors[i];
              err.push(error.message + ` (code : ${error.code}`);
          }
          throw new Error(err.join("\n"));
        } else {
          return json;
        }
      }
    } catch(e) {
      Gwitter.logError(e);
    }
    return {};
  }

  /**
   * @param {object} payload
   * @return {string}
   */
  static getQuery(payload) {
    let query = "";
    if (!Gwitter.isEmpty(payload)) {
      query = "?" + Object.keys(payload).map(
        key => {
          return `${Gwitter.encodeUrl(key)}=${Gwitter.encodeUrl(payload[key])}`
        }
      ).join("&");
    }
    return query;
  }

  /**
   * @param {object} data
   * @param {string} method
   * @return {object}
   */
  static getParams(data, method) {
    const params = {
      method: method,
      muteHttpExceptions: true
    }

    if (data.media) {
      params.contentType = "multipart/form-data;charset=UTF-8";
    }

    if (method.toLowerCase() === "post" && !Gwitter.isEmpty(data)) {;
      if(!params.payload){
        params.payload = {}
      }
      for (const key in data) {
        params.payload[key] = data[key];
      }
    }
      
    return params;
  }

  /**
   * @param {string} str
   * @return {string}
   */
  static encodeUrl(str) {
    return encodeURIComponent(str).replace(/[!'()]/g, char => {escape(char);}).replace(/\*/g, "%2A");
  }

  /**
   * @param {object} obj]
   * @return {bool}
   */
  static isEmpty(obj) {
    if (obj == null) return true;
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;
    for (var key in obj) {
      if (hasOwnProperty.call(obj, key)) return false;
    }
    return true;
  }
  
  /**
   * @param {object} error
   * @return {void}
   */
  static logError(error) {
    if (typeof error === "object"  && error.message) {
      const message = error.message + ` ('${error.fileName}.gs : ${error.lineNumber}')`;
      Logger.log(message);
    } else {
      Logger.log(error);
    }
  }
}
