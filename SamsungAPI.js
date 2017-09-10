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

var SamsungAPI = new (function ($api) {

  var isSST = isPresent($api);

  var macAddress;

  this.tvKey = {
    KEY_RETURN: 27, // esc
    KEY_ENTER: 13, // enter
    KEY_INFO: 112, // F1
    KEY_TOOLS: 113, // F2
    KEY_0: 96, // arrow-left
    KEY_LEFT: 37, // arrow-left
    KEY_UP: 38, // arrow-up
    KEY_RIGHT: 39, // arrow-right
    KEY_DOWN: 40, // arrow-down
    KEY_FF: 76, // L
    KEY_RW: 74, // J
  };

  this.eventName = EVENT_NAME;

  this.onLoad = function () {
    if (!isSST) {
      return;
    }

    (new $api.Widget()).sendReadyEvent();

    this.tvKey = new $api.TVKeyValue();
  };

  this.isSamsungTv = function() {
    return isSST;
  }

  this.onKeyDown = function () {
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
    
    if ((keyCode === this.tvKey.KEY_RETURN || keyCode === this.tvKey.KEY_INFO) || DISABLED_KEYS[keyCode]) {
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
})(isPresent(window.Common) ? Common.API : null);

function isPresent(obj) {
  return obj !== undefined && obj !== null;
}