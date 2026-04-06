class MyTeam extends HTMLElement {
        
    constructor(){
        console.log('MyTeam Constractor');
        super();
        this.attachShadow({mode:'open'});
        this.teamMembers = [];
        this.state = {
            loading:false,
            error:null,
            members:[],
            page:1,
            pageSize:5,
            filter:''
        }
    }

    static cache = new Map();

    static get observedAttributes(){
        return ['title','src'];
    }

    async connectedCallback(){
        console.log('MyTeam connectedCallback');
        await this.loadTemplete();
        await this.loadStyles();
        this.setupEvents();
        await this.loadMembers();
        this.render();
    }

    async attributeChangedCallback(name,newValue,oldValue){
        console.log('MyTeam attributeChangedCallback');
        if(name === 'src' && oldValue !== newValue){
            await this.loadMembers();
            this.render();
        }        
    }

    setState(partial){
        this.state = {...this.state,...partial};
        this.render();
    }

    setupEvents(){
        this.shadowRoot.querySelector('.filter').addEventListener('input', e => {
            this.setState({filter:e.target.value,page:1});
        });

        this.shadowRoot.querySelector('.prev').addEventListener('click', () => {
            if(this.state.page > 1){
                this.setState({page:this.state.page-1});
            }            
        });

        this.shadowRoot.querySelector('.next').addEventListener('click', () => {            
            if(this.state.page < Math.ceil(this.state.members.length / this.state.pageSize)){    
                this.setState({page:this.state.page+1});            
            }
        });

        this.shadowRoot.querySelector('.changeSrc').addEventListener('click', () => {            
            document.querySelector('my-team').setAttribute("src","./OfficeTeam.json")
        });
    }

    async loadMembers(){
        const src = this.getAttribute("src");
        if(!src) return;
        
        this.setState({loading:true,error:null});
        if(MyTeam.cache.has(src)){
            this.setState({
                memebers:MyTeam.cache.get(src),
                loading:false
            });
            return;
        }
        
        try{
            const res = await fetch(src);
            if(!res.ok) throw new Error("Failed to load team");

            const data = await res.json();
            MyTeam.cache.set(src,data);
            this.setState({loading:false,members:data})
        }
        catch(error){
            this.setState({loading:false,error:error.message})
        }
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
        console.log('MyTeam render');
        const title = this.shadowRoot.querySelector('.title');
        const list = this.shadowRoot.querySelector('.members');
        const status = this.shadowRoot.querySelector('.status');
        const pageInfo = this.shadowRoot.querySelector('.page-info');

        title.textContent = this.getAttribute('title') || 'My Team';
        list.innerHTML = '';

        if(this.state.loading){
            status.textContent = 'Loading Team Members...';
            return;
        }

        if(this.state.error){
            status.textContent = `Error: ${this.state.error}`;
            return;
        }

        status.textContent = '';

        const filtered = this.state.members.filter(m => {
            return m.name.toLowerCase().includes(this.state.filter.toLowerCase())
        });

        const start = (this.state.page -1) * this.state.pageSize;
        const paged = filtered.slice(start,start + this.state.pageSize);

        paged.forEach(memeber => {
            const el = document.createElement('team-member');
            el.setAttribute('name',memeber.name);
            el.setAttribute('role',memeber.role);
            el.setAttribute('avatar',memeber.avatar);
            list.appendChild(el);
        });

        pageInfo.textContent = `Page ${this.state.page} / ${Math.ceil(filtered.length / this.state.pageSize)}`
    }
}

customElements.define("my-team",MyTeam);