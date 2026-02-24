import { LitElement, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

class HelloWorld extends LitElement {
  render() {
    return html`
      <article class="box">
        <h1 class="title is-4">Hello World!</h1>
        <p class="subtitle is-6">Ceci est un composant Lit Element avec Bulma CSS.</p>
      </article>
    `;
  }
}

customElements.define('hello-world', HelloWorld);