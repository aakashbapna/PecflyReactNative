export default {
  distanceKM: function(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var a =
       0.5 - Math.cos((lat2 - lat1) * Math.PI / 180)/2 +
       Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
       (1 - Math.cos((lon2 - lon1) * Math.PI / 180))/2;

    return Math.ceil(R * 2 * Math.asin(Math.sqrt(a)));
  },
   autodone: function(fn) {
    return function () {
      fn.apply(this, arguments).done();
    }
  },
  getListingImageLinkByParams: function(original, params) {
    if(/googleusercontent/.test(original)) {
        original = original.replace("http:", "https:")
        if(params) {
          return original+"="+params;
        } else {
          return original+"";
        }
    } else {
      return original
    }
  },

  prettyDate: function(time){
  	var date = new Date((time || "").replace(/-/g,"/").replace(/[TZ]/g," ")),
  		diff = (((new Date()).getTime() - date.getTime()) / 1000),
  		day_diff = Math.floor(diff / 86400);

  	if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 )
  		return "a while ago";

  	return day_diff == 0 && (
  			diff < 60 && "just now" ||
  			diff < 120 && "1 minute ago" ||
  			diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
  			diff < 7200 && "1 hour ago" ||
  			diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
  		day_diff == 1 && "Yesterday" ||
  		day_diff < 7 && day_diff + " days ago" ||
  		day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago";
  },
  getURLParameter: function(name) {
     return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
  },
  updateURLParameter: function(url, param, paramVal){
    var newAdditionalURL = "";
    var tempArray = url.split("?");
    var baseURL = tempArray[0];
    var additionalURL = tempArray[1];
    var temp = "";
    if (additionalURL) {
        tempArray = additionalURL.split("&");
        for (i=0; i<tempArray.length; i++){
            if(tempArray[i].split('=')[0] != param){
                newAdditionalURL += temp + tempArray[i];
                temp = "&";
            }
        }
    }

    var rows_txt = temp + "" + param + "=" + paramVal;
    return baseURL + "?" + newAdditionalURL + rows_txt;
 },
  resizeImage:function(bytes_base64, height) {
                  var MAX_HEIGHT = height;
                  return new Promise(function (resolve, reject){
                                      var image = new Image();
                                      image.onload = function(){
                                          var canvas = document.createElement("canvas");
                                          canvas.style.display = "none";
                                          document.body.appendChild(canvas);
                                          if(image.height > MAX_HEIGHT) {
                                              image.width *= MAX_HEIGHT / image.height;
                                              image.height = MAX_HEIGHT;
                                          }
                                          var ctx = canvas.getContext("2d");
                                          ctx.clearRect(0, 0, canvas.width, canvas.height);
                                          canvas.width = image.width;
                                          canvas.height = image.height;
                                          ctx.drawImage(image, 0, 0, image.width, image.height);
                                          var image_data_url = canvas.toDataURL("image/jpeg", 0.85);
                                          resolve(image_data_url);
                                          document.body.removeChild(canvas);
                                      };
                                      image.src = bytes_base64;
                                      image.onerror = function(e) {
                                          reject(e);
                                      }
                  });

  }


}
