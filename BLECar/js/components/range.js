import { BaseElement } from '../services/BaseElement.js';

class Range extends BaseElement {

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

    css = () => /*css*/`
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

    html = () => /*html*/`
        <div id="container" class="container"></div>
    `;

}

customElements.define('range-element', Range);