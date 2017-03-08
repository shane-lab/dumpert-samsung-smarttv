var widgetAPI = typeof Common !== 'undefined' ? new Common.API.Widget() : { sendReadyEvent: function ( ) { } };
var tvKey = typeof Common !== 'undefined' ? new Common.API.TVKeyValue() : {};
var pluginAPI = typeof Common !== 'undefined' ? new Common.API.Plugin() : undefined;

const DISABLED_KEYS = {
  8: 1,   // backspace
  9: 1,   // tab
  32: 1,  // space
  33: 1,  // page up
  34: 1,  // page down
  35: 1,  // end
  36: 1,  // home
  37: 1,  // arrow left
  38: 1,  // arrow up
  39: 1,  // arrow right
  40: 1   // arrow down
};

const EVENT_NAME = 'SamsungKeyPress';

var SamsungAPI = new (function() {

  var isSST = false;

  var audioPlugin;

  this.tvKey = tvKey;

  this.eventName = EVENT_NAME;

  this.onLoad = function() {
    widgetAPI.sendReadyEvent();
    
    if (navigator.userAgent.search(/Maple/) > -1) {
      isSST = true;
      
      // hack to disable scrolling on SST
      var style = 'html, body { overflow: hidden; }';

      var styletag = document.createElement('style');
      styletag.type = 'text/css';
      if (styletag.styleSheet) {
        styletag.cssText = style;
      } else {
        styletag.appendChild(document.createTextNode(style));
      }

      var head = document.head || document.getElementsByTagName('head')[0];

      head.appendChild(styletag);

      window.onShow = function() {
        //var pluginAPI = document.getElementById('pluginObjectTVMW');
        if (pluginAPI) {
          var nnaviPlugin = document.getElementById('pluginObjectNNavi');
          if (nnaviPlugin) {
            pluginAPI.SetBannerState(1);
            nnaviPlugin.SetBannerState(1);
            pluginAPI.unregistKey(tvKey.KEY_VOL_UP);
            pluginAPI.unregistKey(tvKey.KEY_VOL_DOWN);
            pluginAPI.unregistKey(tvKey.KEY_MUTE);
          }

          audioPlugin = document.getElementById('pluginObjectAudio');
        }
      }
    }
  };

  this.isSamsungSmartTV = function() {
    return isSST;
  }

  this.onUnload = function() {
    // anything to unload ?
  };

  this.onKeyDown = function() {
    if (!isSST) {
      return;
    }

    var keyCode = event.keyCode;

    var evt;

    try {
      evt = new CustomEvent(EVENT_NAME, {
        detail: {
          keyCode: keyCode
        }
      });
    } catch (e) {
      // deprecated approach
      evt = document.createEvent('HTMLEvents');
      evt.initEvent(EVENT_NAME, true, true, {
        detail: {
          keyCode: keyCode
        }
      });
    }
    evt.keyCode = keyCode;

    if (evt) {
      window.dispatchEvent(evt);
    }

    if (keyCode === tvKey.KEY_VOL_UP) {
      setRelativeAudio(1);
    } else if (keyCode === tvKey.KEY_VOL_DOWN) {
      setRelativeAudio(-1);
    }
    
    if ((keyCode === tvKey.KEY_RETURN) || DISABLED_KEYS[keyCode]) {
      preventDefault(event);

      return false;
    }
  };

  function preventDefault(e) {
    e = e || window.event;
    if (e.preventDefault) {
      e.preventDefault();
    }
    if (e.returnValue) {
      e.returnValue = false;
    }
  }

  function setRelativeAudio(delta) {
    if (audioPlugin) {
      var volume = audioPlugin.GetVolume();

      var newVolume = volume + delta;
      if (newVolume >= 0) {
        audioPlugin.SetVolumeWithKey(newVolume);
      }
    }
  }
})();
