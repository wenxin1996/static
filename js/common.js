document.write("<script src=\"https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js\"></script>");
document.write("<script src=\"https://cdn.bootcss.com/twitter-bootstrap/4.3.1/js/bootstrap.min.js\"></script>");
document.write("<script src=\"https://cdn.bootcdn.net/ajax/libs/sweetalert/2.1.2/sweetalert.min.js\"></script>");

function clearCache() {
  let url = "http://148.70.73.59:8002/clear/cache";
  $.get(url, function (json) {
    let data = json.info;
    if (data == "success") {
      swal("清除缓存完成", data, "success");
    } else {
      swal("清除缓存失败", data, "error");
    }
  })
}

function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) {
    return decodeURI(r[2]);
  } else {
    return null;
  }
}


Date.prototype.Format = function (fmt) {
  var o = {
      "M+": this.getMonth() + 1, //月份 
      "d+": this.getDate(), //日 
      "H+": this.getHours(), //小时 
      "m+": this.getMinutes(), //分 
      "s+": this.getSeconds(), //秒 
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
      "S": this.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
  if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}