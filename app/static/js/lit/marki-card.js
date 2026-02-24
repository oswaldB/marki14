import { LitElement, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

class MarkiCard extends LitElement {
  static properties = {
    title: { type: String },
    subtitle: { type: String },
    icon: { type: String },
    type: { type: String, reflect: true },
    elevated: { type: Boolean, reflect: true },
    loading: { type: Boolean, reflect: true }
  };

  constructor() {
    super();
    this.title = 'Card Title';
    this.subtitle = 'Card subtitle';
    this.icon = 'fa-regular fa-gem';
    this.type = 'primary'; // primary, info, success, warning, danger
    this.elevated = false;
    this.loading = false;
  }

  // Plus de styles CSS - tout est géré par Bulma

  render() {
    return html`
      <div class="box ${this.elevated ? 'has-shadow' : ''}">
        ${this.loading ? html`<div class="notification is-white" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 10;">
          <progress class="progress is-small is-link" max="100">100%</progress>
        </div>` : ''}
        
        <div class="media">
          <div class="media-left">
            <span class="icon is-large">
              <i class="${this.icon} has-text-${this.type}"></i>
            </span>
          </div>
          <div class="media-content">
            <h3 class="title is-4">${this.title}</h3>
            ${this.subtitle ? html`<p class="subtitle is-6 has-text-grey">${this.subtitle}</p>` : ''}
          </div>
        </div>
        
        <div class="content">
          <slot></slot>
        </div>
        
        ${this.renderFooter()}
      </div>
    `;
  }

  renderFooter() {
    const footerSlot = this.querySelector('[slot="footer"]');
    if (footerSlot) {
      return html`<div class="buttons" style="margin-top: 1.5rem;">
        <slot name="footer"></slot>
      </div>`;
    }
    return '';
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add('marki-card');
  }
}

customElements.define('marki-card', MarkiCard);