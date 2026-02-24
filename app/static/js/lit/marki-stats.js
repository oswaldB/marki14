import { LitElement, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

class MarkiStats extends LitElement {
  static properties = {
    items: { type: Array },
    columns: { type: Number }
  };

  constructor() {
    super();
    this.items = [];
    this.columns = 4;
  }

  // Plus de styles CSS - tout est géré par Bulma

  render() {
    return html`
      <div class="columns is-multiline">
        ${this.items.map(item => html`
          <div class="column is-${12/this.columns}">
            <div class="box">
              <div class="media">
                <div class="media-left">
                  <i class="${item.icon} is-size-3 has-text-${item.type || 'primary'}" style="opacity: 0.8;"></i>
                </div>
                <div class="media-content">
                  <div class="title is-4" style="color: var(--bulma-${item.type || 'primary'});">
                    ${item.value}
                  </div>
                  <div class="subtitle is-6 has-text-grey">
                    ${item.label}
                  </div>
                  ${this.renderTrend(item)}
                </div>
              </div>
            </div>
          </div>
        `)}
      </div>
    `;
  }

  renderTrend(item) {
    if (item.trend) {
      const isPositive = item.trend > 0;
      return html`
        <div class="tags has-addons" style="margin-top: 0.5rem;">
          <span class="tag is-${isPositive ? 'success' : 'danger'}">
            <i class="fa-regular fa-arrow-${isPositive ? 'up' : 'down'}"></i>
          </span>
          <span class="tag is-${isPositive ? 'success' : 'danger'}-light">
            ${Math.abs(item.trend)}%
          </span>
        </div>
      `;
    }
    return '';
  }
}

customElements.define('marki-stats', MarkiStats);