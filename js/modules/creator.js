/** Zine creator */

import Sortable from 'sortablejs';
import Zine from './zine';
import Alert from '../util/alert';
import CreateElement from '../util/create_element';

class Creator {
  constructor() {}

  bind(root) {
    if (document.querySelector('#zine-creator-form') === null) {
      return;
    }

    // modules
    this.ref = {};
    this.ref.loadingScreen = root.modules.loadingScreen;

    // target elements
    this.el = {};
    this.el.input = {};
    this.el.form = document.querySelector('#zine-creator-form');
    this.el.input.ref = this.el.form.querySelector('input[name="ref"]');
    this.el.input.title = this.el.form.querySelector('input[name="title"]');
    this.el.input.author = this.el.form.querySelector('input[name="author"]');
    this.el.input.private = this.el.form.querySelector('input[name="private"]');
    this.el.input.protected = this.el.form.querySelector('input[name="protected"]');
    this.el.input.password = this.el.form.querySelector('input[name="password"]');
    this.el.input.draft = this.el.form.querySelector('input[name="draft"]');
    this.el.pageList = this.el.form.querySelector('#zine-page-list');

    // add pages from JSON
    try {
      const json = JSON.parse(document.querySelector('#zine-prefill-json').innerHTML);
      const pages = json.zine_content ? json.zine_content.split(';') : ['', '', ''];
      console.log(pages);
      pages.forEach(p => {
        this.addPage(p);
      });
    } catch(err) {
      console.log(err);
    }

    // init Sortable
    this.sortable = new Sortable(this.el.pageList, {
      draggable: '.page-list__page',
      handle: '.page-list__page--handle',
      ghostClass: 'page-list__page--ghost',
      dragClass: 'page-list__page--drag',
      animation: 150,
      onEnd: () => {
        this.updatePages();
      }
    });

    // clipboard
    this._clipboard = new ClipboardJS('#button-copy-url');
    document.querySelector('#button-copy-url').addEventListener('click', () => {
      document.querySelector('#button-copy-msg').innerHTML = 'Copied to clipboard';
    });

    // add page button
    document.querySelector('#button-add-page').addEventListener('click', () => {
      this.addPage();
    });

    // bind save/ publish events
    document.querySelector('#button-save-zine').addEventListener('click', () => {
      this.saveZine();
    });
    document.querySelector('#button-publish-zine').addEventListener('click', () => {
      this.el.input.draft.checked = false;
      this.saveZine();
    });

    // get session token
    const el = document.querySelector('[data-session-token]');
    this.sessionToken = el ? el.dataset.sessionToken : null;
    this.endpoint = {
      save: 'inc/action-save-zine.php',
    };

    // render zine
    this.updatePages();
  }

  addPage(content) {
    const value = content || '';
    const page = CreateElement({
      class: 'page-list__page',
      childNodes: [{
        class: 'label page-list__page--handle',
        childNodes: [{
          class: 'label--index',
          type: 'span',
        }, {
          innerHTML: 'Image URL'
        }]
      }, {
        type: 'input',
        attributes: {
          type: 'text',
        },
      }, {
        class: 'page-list__page--remove',
        innerHTML: '&times;',
        title: 'Delete page',
        addEventListener: {
          'click': () => {
            page.remove();
            this.updatePages();
          },
        }
      }]
    });
    const input = page.querySelector('input');
    input.value = value;
    input.addEventListener('change', () => { this.updatePages(); });
    this.el.pageList.appendChild(page);
    this.updatePages();
  }

  updatePages() {
    // set page indices
    const pages = this.el.pageList.querySelectorAll('.page-list__page');
    for (let i=0; i<pages.length; i++) {
      pages[i].querySelector('.label--index').innerHTML = `${i + 1})`;
    }

    // get page content as string
    const content = this.getContentString();

    // create zine
    if (!this.zine) {
      this.zine = new Zine({
        domTarget: document.querySelector('#zine-viewer'),
        data: {
          zine_content: content,
        },
      });

    // update zine
    } else {
      this.zine.updateContent(content);
    }
  }

  getContentString() {
    const urls = [];
    this.el.pageList.querySelectorAll('input').forEach(input => { urls.push(input.value); });
    const str = urls.join(';');
    return str;
  }

  saveZine() {
    const formData = new FormData();
    formData.append('session_token', this.sessionToken);
    formData.append('ref', this.el.input.ref.value);
    formData.append('title', this.el.input.title.value);
    formData.append('author', this.el.input.author.value);
    formData.append('private', this.el.input.private.checked ? '1' : '0');
    formData.append('protected', this.el.input.protected.checked ? '1' : '0');
    formData.append('password', this.el.input.password.value);
    formData.append('published', this.el.input.draft.checked ? '0' : '1');
    formData.append('content', this.getContentString());

    // show loading screen
    this.ref.loadingScreen.setMessage('Saving...');
    this.ref.loadingScreen.show();

    // submit
    fetch(this.endpoint.save, {method: 'POST', body: formData})
      .then(res => res.text())
      .then(text => {
        this.ref.loadingScreen.hide();
        const alert = new Alert({msg: 'Zine saved.'});
        try {
          const json = JSON.parse(text);
          console.log(json);
        } catch(err) {
          console.log(text);
        }
      });
  }
}

export default Creator;
