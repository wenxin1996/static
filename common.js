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