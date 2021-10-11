import { BLE } from '../services/BLE.js';
import { BaseElement } from '../services/BaseElement.js';
import '../components/stick.js';
import '../components/range.js';

class App extends BaseElement {

    #BLEinstanse = new BLE();

    async connect() {
        return this.#BLEinstanse.connect();
    }

    render() {
        super.render();

        const stick = this.shadow.getElementById('stick');
        const range = this.shadow.getElementById('range');
        const statusElm = this.shadow.getElementById('status');
        const cntBtn = this.shadow.getElementById('connect');

        stick?.addEventListener('change', ({ detail }) => {
            if (this.#BLEinstanse.device) {
                this.#BLEinstanse.send(new Uint8Array([detail.relativeX, detail.relativeY]));
            }
        });

        if (range) {
            this.#BLEinstanse.listen((value) => {
                range?.setAttribute('value', parseInt(value));
            })
        }

        cntBtn?.addEventListener('click', async () => {
            if (statusElm.textContent !== 'подключение') {
                try {
                    statusElm.textContent = 'подключение';
                    const status = await this.connect();
                    if (status) {
                        this.render();
                    }
                }
                catch (error) {
                    statusElm.textContent = error;
                }
            }
        });
    }

    css = () => /*css*/`
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

    html = () => /*html*/`
    <div id="container" class="container">
        ${!this.#BLEinstanse.device ? /*html*/`
            <div class="fade">
                <div id="connect" class="modal">
                    <span>Подключиться</span>
                    <div id="status"></div>
                </div>
            </div>
        ` : /*html*/`    
            <div class="controls">    
                <range-element id="range" value="Infinity"></range-element>
                <stick-element id="stick" min-x="255" max-x="0" min-y="0" max-y="255"></stick-element>
            </div>
        `}        
    </div>
    `;

}

customElements.define('app-element', App);
