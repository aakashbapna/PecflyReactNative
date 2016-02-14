let querystring = function(obj) {
  var str = [];
  for(var p in obj)
    if (obj.hasOwnProperty(p) && obj[p] != null) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}

class BaseApi {
  constructor(apiClient, path) {
    this.apiClient = apiClient;
    this.path = path;
  }

  request(method, path, params){
    path = this.path+path
    return this.apiClient.request(method, path, params)
  }
}


/** API classes**/
//TODO: improve this, make it more declarative, generate from discovery file

class UserApi extends BaseApi {
  auth_token_fb(params){
    return this.request("POST", "/auth_token/fb", params)
  }
  current(){
    return this.request("GET", "/current")
  }
  getWalletBalance(){
    return this.request("GET", "/getWalletBalance")
  }
  getSavedListings() {
    return this.request("GET", "/getSavedListings")
  }
  locations() {
    return this.request("GET", "/locations")
  }
  add_location(params) {
    return this.request("PUT", "/add_location", params)
  }

  update_location(params) {
    return this.request("POST", "/update_location", params)
  }
}

class FeedApi extends BaseApi {
  fetch(params){
    return this.request("GET", "/fetch", params)
  }

}

class ListingApi extends BaseApi {
  put(params) {
    return this.request("PUT", "/put", params)
  }

  put_feed(params) {
    return this.request("PUT", "/put_feed", params)
  }

  search(params) {
    return this.request("GET", "/search", params)
  }

  get_by_id(params) {
    return this.request("GET", "/get_by_id", params)
  }

  takedown(params) {
    return this.request("POST", "/takedown", params)
  }

  makeOffer(params) {
    return this.request("PUT", "/makeOffer", params)
  }

  getAllOffers(params) {
    return this.request("GET","/getOffersForListing", params)
  }

  markOfferAcceptReject(params) {
    return this.request("POST", "/markOfferAcceptReject", params)
  }

}


class OrderApi extends BaseApi {
  checkFulfillment(params) {
    return this.request("POST", "/checkFulfillment", params)
  }
  create(params) {
    return this.request("PUT", "/create", params)
  }
}


class ServerError extends Error {
  constructor(response){
     super("ServerError, status: "+response.status+" statusText: "+response.statusText)
     this.response_obj = response
  }
}


class MySwagApi {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
    this.user = new UserApi(this, "/user")
    this.listing = new ListingApi(this, "/listing");
    this.feed = new FeedApi(this, "/feed");
    this.order = new OrderApi(this, "/order");
  }

  setAuthToken(authtoken) {
    this.authtoken = authtoken
  }

  getAuthToken() {
    return this.authtoken
  }
  getBaseUrl() {
    return this.baseUrl
  }

  setBaseUrl(url) {
    this.baseUrl = url;
  }
  request(method, path, params){
      if(this.baseUrl == null) {
        throw new Error ("baseUrl not set on API Client")
      }

      var options = {
        "method": method,
        "headers":  {
              'Accept': 'application/json',
        }
      }

      var url = this.baseUrl + path;

      if(this.authtoken) {
        options.headers["Authorization"] = "Bearer "+this.authtoken
      }

      if(method == "POST" || method == "PUT"){
        options.headers["Content-Type"] = 'application/json'
        if(!params) {
          throw new Error("Params can't be null for method:"+method)
        }
        options.body = JSON.stringify(params)
      } else {
        //querystring
        if(params) {
          url = url+"?"+querystring(params)
        }
      }

      return fetch(url, options).then(this.checkStatus).then(this.toJson).catch(this.handleError)
  }

  checkStatus(response){
    if (response.status == 200) {
      return response
    } else if (response.status == 204) {
      return response
    }
    if(response.status == 401) {
      alert("Auth expired, you need to login again");
      //localStorage.clear();
      //window.location.href="/web";
    }
    throw new ServerError(response)
  }

  toJson(response){
    return response.status == 204? {} : response.json();
  }

  handleError(error){
    console.log("Request error")
    console.error(error);
    if(error instanceof ServerError){
        throw error
    } else {
      alert("Network Error, please try again")
    }
  }
}

var instance = new MySwagApi()

var MYSWAG_API_ROOT = __DEV__? "http://192.168.11.124:8080" :"https://mysweg-786.appspot.com"
 MYSWAG_API_ROOT = "https://mysweg-786.appspot.com"

instance.setBaseUrl(MYSWAG_API_ROOT+"/_ah/api/myswag/v1")



module.exports = instance
