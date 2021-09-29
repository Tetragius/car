export class BaseElement extends HTMLElement {

    shadow = null;
    sheet = null;

    connectedCallback() {
        this.shadow = this.attachShadow({ mode: 'open' });
        this.sheet = new CSSStyleSheet();
        this.render();
    }

    render() {
        this.sheet.replaceSync(this.css());
        this.shadow.adoptedStyleSheets = [this.sheet];
        this.shadow.innerHTML = this.html();
    }

    css = () => /*css*/``;

    html = () => /*html*/``;

}