(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _BaseElement = require("../services/BaseElement.js");

class Range extends _BaseElement.BaseElement {
  #container = null;

  connectedCallback() {
    super.connectedCallback();
    this.#container = this.shadow.getElementById('container');
  }

  attributeChangedCallback(...attrs) {
    if (this.#container) {
      this.#container.textContent = `${this.getAttribute('value')}мм`;
    }
  }

  static get observedAttributes() {
    return ['value'];
  }

  css = () =>
  /*css*/
  `
        .container{
            color: red;
            width: 100%;
            height: 50px;
            font-family: monospace;
            font-size: 42px;
            margin: 32px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
        }
    `;
  html = () =>
  /*html*/
  `
        <div id="container" class="container"></div>
    `;
}

customElements.define('range-element', Range);

},{"../services/BaseElement.js":6}],2:[function(require,module,exports){
"use strict";

var _BaseElement = require("../services/BaseElement.js");

class Stick extends _BaseElement.BaseElement {
  #isDrag = false;
  #container = null;
  #stick = null;
  #attrs = {
    minX: 0,
    minY: 0,
    maxX: 100,
    maxY: 100
  };
  #prevPos = {
    x: 0,
    y: 0
  };
  #mouseDownHandler = e => {
    this.#isDrag = true;

    if (e.type === 'touchstart') {
      const touch = e.touches[0];
      this.#prevPos.x = touch.clientX;
      this.#prevPos.y = touch.clientY;
    }

    this.#stick.style.transition = 'all 0s';
    document.body.addEventListener('mouseup', this.#mouseUpHandler);
    document.body.addEventListener('mousemove', this.#mouseMoveHandler);
    document.body.addEventListener('touchend', this.#mouseUpHandler);
    document.body.addEventListener('touchmove', this.#touchMoveHandler);
  };
  #mouseUpHandler = e => {
    this.#isDrag = false;
    this.#stick.style.transition = '';
    this.#stick.style.left = ``;
    this.#stick.style.top = ``;
    const transformRange = this.#transformRange;
    this.dispatchEvent(new CustomEvent('change', {
      composed: true,
      bubbles: true,
      detail: {
        x: 0,
        y: 0,

        get relativeX() {
          return transformRange(this.x, 'x');
        },

        get relativeY() {
          return transformRange(this.y, 'y');
        }

      }
    }));
    document.body.removeEventListener('mouseup', this.#mouseUpHandler);
    document.body.removeEventListener('mousemove', this.#mouseMoveHandler);
    document.body.removeEventListener('touchend', this.#mouseUpHandler);
    document.body.removeEventListener('touchmove', this.#touchMoveHandler);
  };
  #mouseMoveHandler = e => {
    if (this.#isDrag) {
      this.#move(e.movementX, e.movementY);
    }
  };
  #transformRange = (value, axis) => {
    let scale = 0;

    if (axis === 'x') {
      scale = (this.#attrs.maxX - this.#attrs.minX) / (200 - -200);
      return (value - -200) * scale;
    }

    if (axis === 'y') {
      scale = (this.#attrs.maxY - this.#attrs.minY) / (200 - -200);
      return this.#attrs.maxY - (value - -200) * scale;
    }
  };
  #move = (movementX, movementY) => {
    const shadowRect = this.#container.getBoundingClientRect();
    const rect = this.#stick.getBoundingClientRect();
    const newLeft = rect.left - shadowRect.left + movementX;
    const newRight = rect.top - shadowRect.top + movementY;
    const check = Math.sqrt(Math.pow(newLeft - 200, 2) + Math.pow(newRight - 200, 2)) < 200;

    if (check) {
      this.#stick.style.left = `${newLeft}px`;
      this.#stick.style.top = `${newRight}px`;
      const transformRange = this.#transformRange;
      this.dispatchEvent(new CustomEvent('change', {
        composed: true,
        bubbles: true,
        detail: {
          x: newLeft - 200,
          y: newRight - 200,

          get relativeX() {
            return transformRange(this.x, 'x');
          },

          get relativeY() {
            return transformRange(this.y, 'y');
          }

        }
      }));
    }
  };
  #touchMoveHandler = e => {
    if (this.#isDrag) {
      const touch = e.touches[0];
      const x = touch.clientX;
      const y = touch.clientY;
      const movementX = x - this.#prevPos.x;
      const movementY = y - this.#prevPos.y;
      this.#move(movementX, movementY);
      this.#prevPos.x = x;
      this.#prevPos.y = y;
    }
  };

  connectedCallback() {
    super.connectedCallback();
    this.#container = this.shadow.getElementById('container');
    this.#stick = this.shadow.getElementById('stick');
    this.#attrs.minX = this.getAttribute('min-x') ?? this.#attrs.minX;
    this.#attrs.minY = this.getAttribute('min-y') ?? this.#attrs.minY;
    this.#attrs.maxX = this.getAttribute('max-x') ?? this.#attrs.maxX;
    this.#attrs.maxY = this.getAttribute('max-y') ?? this.#attrs.maxY;
    this.#stick.addEventListener('mousedown', this.#mouseDownHandler);
    this.#stick.addEventListener('touchstart', this.#mouseDownHandler);
  }

  disconnectedCallback() {
    document.body.removeEventListener('mouseup', this.#mouseUpHandler);
    document.body.removeEventListener('mousemove', this.#mouseMoveHandler);
    document.body.removeEventListener('touchend', this.#mouseUpHandler);
    document.body.removeEventListener('touchmove', this.#touchMoveHandler);
  }

  css = () =>
  /*css*/
  `
        .container{
            position: relative;
            display: inline-block;
            width: 500px;
            height: 500px;
            background: lightgray;
            border-radius: 250px;
            user-select: none;
            box-shadow: inset 0 0 20px 0px gray;
            box-sizing: border-box;
        }

        .stick{
            position: absolute;
            top: calc(50% - 50px);
            left: calc(50% - 50px);
            width: 100px;
            height: 100px;
            background: gray;
            border-radius: 50px;
            cursor: pointer;
            transition: all .2s;
            box-shadow: 0 0 20px 0px gray;
        }
    `;
  html = () =>
  /*html*/
  `
    <div id="container" class="container">
        <div id="stick" class="stick"></div>
    </div>
    `;
}

customElements.define('stick-element', Stick);

},{"../services/BaseElement.js":6}],3:[function(require,module,exports){
"use strict";

var _BLE = require("../services/BLE.js");

var _BaseElement = require("../services/BaseElement.js");

require("../components/stick.js");

require("../components/range.js");

class App extends _BaseElement.BaseElement {
  #BLEinstanse = new _BLE.BLE();

  async connect() {
    return this.#BLEinstanse.connect();
  }

  render() {
    super.render();
    const stick = this.shadow.getElementById('stick');
    const range = this.shadow.getElementById('range');
    const statusElm = this.shadow.getElementById('status');
    const cntBtn = this.shadow.getElementById('connect');
    stick?.addEventListener('change', ({
      detail
    }) => {
      if (this.#BLEinstanse.device) {
        this.#BLEinstanse.send(new Uint8Array([detail.relativeX, detail.relativeY]));
      }
    });

    if (range) {
      this.#BLEinstanse.listen(value => {
        range?.setAttribute('value', parseInt(value));
      });
    }

    cntBtn?.addEventListener('click', async () => {
      if (statusElm.textContent !== 'подключение') {
        try {
          statusElm.textContent = 'подключение';
          const status = await this.connect();

          if (status) {
            this.render();
          }
        } catch (error) {
          statusElm.textContent = error;
        }
      }
    });
  }

  css = () =>
  /*css*/
  `
        .container{
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .controls{
            margin: 16px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .fade{
            position: fixed;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 1;
            background: rgba(64, 64, 64, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .modal{
            position: relative;
            width: 80%;
            height: 80%;
            border-radius: 64px;
            background: white;
            user-select: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 24pt;
        }
        .modal span{
            font-size: 24pt;
        }

        .modal div{
            margin-top: 32px;
            font-size: 14pt;
            width: 50%;
            height: 45%;
            text-align: center;
        }
    `;
  html = () =>
  /*html*/
  `
    <div id="container" class="container">
        ${!this.#BLEinstanse.device ?
  /*html*/
  `
            <div class="fade">
                <div id="connect" class="modal">
                    <span>Подключиться</span>
                    <div id="status"></div>
                </div>
            </div>
        ` :
  /*html*/
  `    
            <div class="controls">    
                <range-element id="range" value="Infinity"></range-element>
                <stick-element id="stick" min-x="0" max-x="255" min-y="0" max-y="255"></stick-element>
            </div>
        `}        
    </div>
    `;
}

customElements.define('app-element', App);

},{"../components/range.js":1,"../components/stick.js":2,"../services/BLE.js":5,"../services/BaseElement.js":6}],4:[function(require,module,exports){
"use strict";

require("./containers/app.js");

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(reg => {
    if (reg.installing) {
      console.log('installing');
    } else if (reg.waiting) {
      console.log('installed');
    } else if (reg.active) {
      console.log('active');
    }
  }).catch(error => {
    console.log(error);
  });
}

},{"./containers/app.js":3}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BLE = void 0;

class BLE {
  #send = null;
  #read = null;
  #sended = true;
  #deviceId = 0x180d;
  #characteristicId = 0x2a37;
  #characteristic = null;
  #disconnect = null;
  device = null;
  connect = async () => {
    return new Promise((resolve, reject) => {
      navigator.bluetooth.requestDevice({
        optionalServices: [this.#deviceId],
        acceptAllDevices: true
      }).then(device => {
        this.#disconnect = () => device.gatt.disconnect();

        this.device = device;
        return device.gatt.connect();
      }).then(server => server.getPrimaryService(this.#deviceId)).then(service => service.getCharacteristic(this.#characteristicId)).then(characteristic => {
        let timer = null;

        this.#send = str => {
          if (this.#sended) {
            this.#sended = false;
            let buf;

            if (typeof str === 'string') {
              buf = new ArrayBuffer(str.length);
              const bufView = new Uint8Array(buf);

              for (let i = 0, strLen = str.length; i < strLen; i++) {
                bufView[i] = str.charCodeAt(i);
              }

              if (timer) {
                clearTimeout(timer);
                timer = null;
              }
            } else {
              buf = str;
            }

            timer = setTimeout(() => {
              characteristic.writeValue(buf).then(() => this.#sended = true);
            }, 100);
          }
        };

        this.#characteristic = characteristic;

        this.#read = () => Promise.resolve(characteristic.value);

        resolve(true);
      }).catch(error => {
        reject(error);
      });
    });
  };
  send = data => {
    if (this.#send) {
      this.#send(data);
    }
  };
  read = () => {
    return this.#read().then(val => {
      const enc = new TextDecoder();
      const res = enc.decode(new Uint8Array(val.buffer));
      return res;
    });
  };
  disconnect = () => {
    this.#disconnect();
    this.device = null;
  };
  listen = callback => {
    this.#characteristic.startNotifications();
    this.#characteristic.addEventListener('characteristicvaluechanged', () => {
      this.read().then(callback);
    });
  };
}

exports.BLE = BLE;

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BaseElement = void 0;

class BaseElement extends HTMLElement {
  shadow = null;
  sheet = null;

  connectedCallback() {
    this.shadow = this.attachShadow({
      mode: 'open'
    });
    this.sheet = new CSSStyleSheet();
    this.render();
  }

  render() {
    this.sheet.replaceSync(this.css());
    this.shadow.adoptedStyleSheets = [this.sheet];
    this.shadow.innerHTML = this.html();
  }

  css = () =>
  /*css*/
  ``;
  html = () =>
  /*html*/
  ``;
}

exports.BaseElement = BaseElement;

},{}]},{},[4]);
