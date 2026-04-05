class TeamMember extends HTMLElement {
    constructor(){
        console.log('TeamMember Constractor');
        super();
        this.attachShadow({mode:'open'});
    }

    static get observedAttributes(){
        return ['name','role','avatar'];
    }

    async connectedCallback(){
        console.log('TeamMember connectedCallback');
        await this.loadTemplete();
        await this.loadStyles();
        this.render();
    }

    attributeChangedCallback(name,newValue,oldValue){
        console.log('TeamMember attributeChangedCallback');
        this.render();
    }

    async loadStyles(){
        const cssText = await fetch("/team-member/team-member.css").then(r => r.text());
        const sheet = new CSSStyleSheet();
        await sheet.replace(cssText);        
        this.shadowRoot.adoptedStyleSheets = [sheet];
    }

    async loadTemplete(){
        const html = await fetch("team-member/team-member.html").then(r => r.text());
        const tpl = document.createElement("template");
        tpl.innerHTML = html;
        this.shadowRoot.appendChild(tpl.content.cloneNode(true));
    }

    render(){
        console.log('TeamMember render');
        if(!this.shadowRoot.querySelector('.name')) return;

        this.shadowRoot.querySelector('.name').textContent = this.getAttribute('name') || 'DefauleName';
        this.shadowRoot.querySelector('.role').textContent = this.getAttribute('role') || 'DefaultRole';
        this.shadowRoot.querySelector('.avatar').textContent = this.getAttribute('avatar') || 'DefaultAvatar';


    }
}

customElements.define("team-member",TeamMember);