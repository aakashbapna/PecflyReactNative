export default {
  get: function(key) {
    var data =  window.localStorage[key]? JSON.parse(window.localStorage[key]) : null;
    console.info("got from localstorage", key, data)
    return data;
  },
  set: function(key, data) {
    if(data == null) {
      console.warn("tried to set null data in localStorage for key", key);
      return;
    }
    console.info("setting in localstorage", key, data)
    window.localStorage.setItem(key, JSON.stringify(data));
    window.localStorage.setItem("_time_"+key, new Date().getTime())
  }

}
