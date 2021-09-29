import { BaseElement } from '../servuces/BaseElement.js';

class Stick extends BaseElement {

    #isDrag = false;
    #container = null;
    #stick = null;
    #attrs = { minX: 0, minY: 0, maxX: 100, maxY: 100 };
    #prevPos = { x: 0, y: 0 }

    #mouseDownHandler = (e) => {
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
    }

    #mouseUpHandler = (e) => {
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
                get relativeX() { return transformRange(this.x, 'x') },
                get relativeY() { return transformRange(this.y, 'y') }
            }
        }));

        document.body.removeEventListener('mouseup', this.#mouseUpHandler);
        document.body.removeEventListener('mousemove', this.#mouseMoveHandler);
        document.body.removeEventListener('touchend', this.#mouseUpHandler);
        document.body.removeEventListener('touchmove', this.#touchMoveHandler);
    }

    #mouseMoveHandler = (e) => {
        if (this.#isDrag) {
            this.#move(e.movementX, e.movementY);
        }
    }

    #transformRange = (value, axis) => {
        let scale = 0;
        if (axis === 'x') {
            scale = (this.#attrs.maxX - this.#attrs.minX) / (200 - (-200))
            return (value - (-200)) * scale;
        }
        if (axis === 'y') {
            scale = (this.#attrs.maxY - this.#attrs.minY) / (200 - (-200))
            return this.#attrs.maxY - (value - (-200)) * scale;
        }
    }

    #move = (movementX, movementY) => {

        const shadowRect = this.#container.getBoundingClientRect();
        const rect = this.#stick.getBoundingClientRect();

        const newLeft = (rect.left - shadowRect.left) + movementX;
        const newRight = (rect.top - shadowRect.top) + movementY;
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
                    get relativeX() { return transformRange(this.x, 'x') },
                    get relativeY() { return transformRange(this.y, 'y') }
                }
            }));
        }
    }


    #touchMoveHandler = (e) => {
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
    }

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


    css = () => /*css*/`
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

    html = () => /*html*/`
    <div id="container" class="container">
        <div id="stick" class="stick"></div>
    </div>
    `;

}

customElements.define('stick-element', Stick);