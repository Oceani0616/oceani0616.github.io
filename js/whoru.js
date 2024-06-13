function iswap() {
    var uA = navigator.userAgent.toLowerCase();
    var iPad = uA.match(/ipad/i) == "ipad";
    var iPhone = uA.match(/iphone os/i) == "iphone os";
    var midp = uA.match(/midp/i) == "midp";
    var uc7 = uA.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
    var uc = uA.match(/ucweb/i) == "ucweb";
    var Android = uA.match(/android/i) == "android";
    var Windowsce = uA.match(/windows ce/i) == "windows ce";
    var Windowsmd = uA.match(/windows mobile/i) == "windows mobile";
    if (!(iPad || iPhone || midp || uc7 || uc || Android || Windowsce || Windowsmd)) {
        // PC 端
    } else {
        // 移动端
    }
}
function fIsMobile(){
    return /Android|iPhone|iPad|iPod|BlackBerry|webOS|Windows Phone|SymbianOS|IEMobile|Opera Mini/i.test(navigator.userAgent);
}



var u = navigator.userAgent;
var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端


var ua = navigator.userAgent.toLowerCase();
if (/android|adr/gi.test(ua)) {
    // 安卓  
} else if (/\(i[^;]+;( U;)? CPU.+Mac OS X/gi.test(ua)) {
    //苹果  
} else if (/iPad/gi.test(ua)) {
    //ipad  
}

var ua = navigator.userAgent.toLowerCase();
if (/msie/i.test(ua) && !/opera/.test(ua)) {
    alert("IE");
    return;
} else if (/firefox/i.test(ua)) {
    alert("Firefox");
    return;
} else if (/chrome/i.test(ua) && /webkit/i.test(ua) && /mozilla/i.test(ua)) {
    alert("Chrome");
    return;
} else if (/opera/i.test(ua)) {
    alert("Opera");
    return;
} else if (/iPad/i) {
    alert("ipad");
    return;
}
if (/webkit/i.test(ua) && !(/chrome/i.test(ua) && /webkit/i.test(ua) && /mozilla/i.test(ua))) {
    alert("Safari");
    return;
} else {
    alert("unKnow");
    }

