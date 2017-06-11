function effectiveDeviceWidth() {
  var deviceWidth = window.screen.width;
  // iOS returns available pixels, Android returns pixels / pixel ratio
  // http://www.quirksmode.org/blog/archives/2012/07/more_about_devi.html
  
  if (navigator.userAgent.indexOf('Android') >= 0 && window.devicePixelRatio && false) {
    deviceWidth = deviceWidth / window.devicePixelRatio;
  }
  
  return deviceWidth;
}

function effectiveDeviceHeight() {
  var deviceHeight = window.screen.height;
  
	if (navigator.userAgent.indexOf('Android') >= 0 && window.devicePixelRatio && false) {

		deviceHeight = deviceHeight / window.devicePixelRatio;
	}
  
  return deviceHeight;
}

var effectiveHeight = effectiveDeviceHeight();
var effectiveWidth = effectiveDeviceWidth();

//alert(window.screen.height + ' ' + window.screen.width + " "  + window.devicePixelRatio);
//alert(effectiveHeight + ' ' + effectiveWidth);