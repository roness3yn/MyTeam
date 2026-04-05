class MyTeam extends HTMLElement {
    constructor(){
        console.log('MyTeam Constractor');
        super();
        this.attachShadow({mode:'open'});
        this.teamMembers = [];
    }

    static get observedAttributes(){
        return ['title','src'];
    }

    async connectedCallback(){
        console.log('MyTeam connectedCallback');
        await this.loadTemplete();
        await this.loadStyles();
        await this.fetchMembers();
        this.render();
    }

    /*attributeChangedCallback(name,newValue,oldValue){
        console.log('MyTeam attributeChangedCallback');
        this.render();
    }*/

    async fetchMembers(){
        const src = this.getAttribute("src");
        if(!src) return;
        
        const response = await fetch(src);
        this.teamMembers = await response.json();
    }

    async loadStyles(){
        const cssText = await fetch("/my-team/my-team.css").then(r => r.text());
        const sheet = new CSSStyleSheet();
        await sheet.replace(cssText);        
        this.shadowRoot.adoptedStyleSheets = [sheet];
    }

    async loadTemplete(){
        const html = await fetch('/my-team/my-team.html').then(r => r.text());
        const tpl = document.createElement("template");
        tpl.innerHTML = html;
        this.shadowRoot.appendChild(tpl.content.cloneNode(true));
    }

    render(){
        console.log(this.shadowRoot.innerHTML);
        console.log('MyTeam render');
        const titleEl = this.shadowRoot.querySelector('.title');
        const listEl = this.shadowRoot.querySelector('.members');

        titleEl.textContent = this.getAttribute('title') || 'My Team';
        listEl.innerHTML = '';

        this.teamMembers.forEach(memeber => {
            const el = document.createElement('team-member');
            el.setAttribute('name',memeber.name);
            el.setAttribute('role',memeber.role);
            el.setAttribute('avatar',memeber.avatar);
            listEl.appendChild(el);
        })
    }
}

customElements.define("my-team",MyTeam);