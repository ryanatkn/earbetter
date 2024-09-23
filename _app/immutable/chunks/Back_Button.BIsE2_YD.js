var ye=Object.defineProperty;var me=(n,e,t)=>e in n?ye(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t;var ue=(n,e,t)=>(me(n,typeof e!="symbol"?e+"":e,t),t),$=(n,e,t)=>{if(!e.has(n))throw TypeError("Cannot "+t)};var z=(n,e,t)=>($(n,e,"read from private field"),t?t.call(n):e.get(n)),P=(n,e,t)=>{if(e.has(n))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(n):e.set(n,t)},ee=(n,e,t,c)=>($(n,e,"write to private field"),c?c.call(n,t):e.set(n,t),t);var oe=(n,e,t)=>($(n,e,"access private method"),t);import{e as we,u as xe,p as q,g as l,c as se,t as j,f as le,r as F,a as J,d as o,j as te,$ as ne,_ as Te,Z as Ee,Y as Me}from"./index-client.BfCuAN0g.js";import{d as he,b as ce,s as ze,a as M,c as _e,e as Y,t as O}from"./disclose-version.DScDdLmE.js";import{c as fe,s as N,t as B,b as H,e as Le}from"./string.C2WA7m-2.js";import{p as y,i as G}from"./props.BNuNwr8n.js";import{B as ge,s as re,C as ae,E as Be,a as Se,b as Ae,F as He}from"./index.nj7nPNN4.js";var S,I,U,X,be;const Z=class Z{constructor(e){P(this,X);P(this,S,new WeakMap);P(this,I,void 0);P(this,U,void 0);ee(this,U,e)}observe(e,t){var c=z(this,S).get(e)||new Set;return c.add(t),z(this,S).set(e,c),oe(this,X,be).call(this).observe(e,z(this,U)),()=>{var f=z(this,S).get(e);f.delete(t),f.size===0&&(z(this,S).delete(e),z(this,I).unobserve(e))}}};S=new WeakMap,I=new WeakMap,U=new WeakMap,X=new WeakSet,be=function(){return z(this,I)??ee(this,I,new ResizeObserver(e=>{for(var t of e){Z.entries.set(t.target,t);for(var c of z(this,S).get(t.target)||[])c(t)}}))},ue(Z,"entries",new WeakMap);let de=Z;var Ie=new de({box:"border-box"});function Ve(n,e,t){var c=Ie.observe(n,()=>t(n[e]));we(()=>(xe(()=>t(n[e])),c))}const Ke=(n,e)=>{let t=n.previousSibling;for(;t;){if(e(t))return t;t=t.previousSibling}return null},Pe=(n,e)=>{let t=n.nextSibling;for(;t;){if(e(t))return t;t=t.nextSibling}return null};var De=O('<div class="middle_c svelte-gdrax4"><!></div>'),Ye=O('<button type="button" class="piano_key svelte-gdrax4"><!></button>');function Ne(n,e){q(e,!0);const t=y(e,"clickable",3,!0),c=y(e,"enabled",3,!0),f=y(e,"pressed",3,!1),r=y(e,"highlighted",3,!1),b=y(e,"emphasized",3,!1),h=y(e,"middle_c_label",3,!0),d=y(e,"allow_sticking",3,!1),k=o(()=>ge.has(e.note)),v=o(()=>!l(k)),m=o(()=>e.note===60),g=i=>{const a=Ke(i,u=>u instanceof HTMLButtonElement);a==null||a.focus()},x=i=>{const a=Pe(i,u=>u instanceof HTMLButtonElement);a==null||a.focus()},T=i=>{var u;const{key:a}=i;switch(a){case" ":case"Enter":{re(i),(u=e.onpress)==null||u.call(e,e.note),i.currentTarget.focus();break}case"ArrowLeft":{g(i.currentTarget);break}case"ArrowRight":{x(i.currentTarget);break}}},E=i=>{var u;const{key:a}=i;switch(a){case" ":case"Enter":{re(i),(u=e.onrelease)==null||u.call(e,e.note);break}}},_=o(()=>t()&&c());var s=Ye();s.__keydown=function(...i){var a;(a=l(_)?T:void 0)==null||a.apply(this,i)},s.__keyup=function(...i){var a;(a=l(_)?E:void 0)==null||a.apply(this,i)};var w=o(()=>l(_)?i=>{var a;(a=e.onpress)==null||a.call(e,e.note),i.currentTarget.focus()}:void 0);s.__mousedown=function(...i){var a;(a=l(w))==null||a.apply(this,i)};var L=o(()=>l(_)?()=>{var i;(i=e.onrelease)==null||i.call(e,e.note)}:void 0);s.__mouseup=function(...i){var a;(a=l(L))==null||a.apply(this,i)};var A=o(()=>l(_)&&e.pressing_any?i=>{var a;(a=e.onpress)==null||a.call(e,e.note),i.currentTarget.focus()}:void 0),Q=o(()=>l(_)?()=>{var i;(i=e.onrelease)==null||i.call(e,e.note)}:void 0),R=o(()=>l(_)&&!d()?()=>{var i;(i=e.onrelease)==null||i.call(e,e.note)}:void 0);s.__focusout=function(...i){var a;(a=l(R))==null||a.apply(this,i)};var V=se(s);G(V,()=>l(m)&&h(),i=>{var a=De(),u=se(a);G(u,()=>typeof h()=="string",C=>{var K=ce();j(()=>ze(K,h())),M(C,K)},C=>{var K=_e(),ke=le(K);G(ke,()=>typeof h()=="boolean",p=>{var W=ce("C4");M(p,W)},p=>{var W=_e(),ve=le(W);fe(ve,h),M(p,W)},!0),M(C,K)}),F(a),M(i,a)}),F(s),j(()=>{N(s,"tabindex",l(_)?void 0:-1),N(s,"aria-label",`piano key for midi ${e.note??""}`),N(s,"data-note",e.note),B(s,"natural",l(k)),B(s,"accidental",l(v)),B(s,"disabled",!c()),B(s,"clickable",l(_)),B(s,"active",f()),B(s,"highlighted",r()),B(s,"emphasized",b()),H(s,"left",`${e.left_offset??""}px`)}),Y("mouseenter",s,function(...i){var a;(a=l(A))==null||a.apply(this,i)}),Y("mouseleave",s,function(...i){var a;(a=l(Q))==null||a.apply(this,i)}),M(n,s),J()}he(["keydown","keyup","mousedown","mouseup","focusout"]);const Ue=5,We=7/12,Ge=.7,ie={1:0,2:-3/5,3:0,4:-2/5,5:0,6:0,7:-2/3,8:0,9:-1/2,10:0,11:-1/3,12:0},je=(n,e,t,c=500)=>{const f=Math.abs(ie[ae[e]]);let r=Math.abs(ie[ae[t]]);r&&(r=1-r);const b=t-e+1;if(b<=0)return{piano_keys:[],natural_key_height:c,natural_key_width:0,accidental_key_height:0,accidental_key_width:0};const h=Be(e,t),d=n/(h.length+(f+r))|0,k=d*We|0,v=Math.min(c,k*Ue)|0,m=v*Ge|0;let g=0;const x=[];for(let T=0;T<b;T++){const E=T+e;let _,s,w;ge.has(E)?(_=d,s=v,w=g*d+f*k,g++):(_=k,s=m,w=g*d+ie[ae[E]]*k+f*k),x.push({note:E,left_offset:w,width:_,height:s})}return{piano_keys:x,natural_key_height:v,natural_key_width:d,accidental_key_height:m,accidental_key_width:k}};var Fe=O('<div class="piano svelte-d5674k"></div>');function Ce(n,e){q(e,!0);const t=y(e,"max_height",19,()=>{}),c=y(e,"min_note",3,Se),f=y(e,"max_note",3,Ae),r=y(e,"enabled_notes",3,null),b=y(e,"pressed_keys",3,null),h=y(e,"highlighted_keys",3,null),d=y(e,"emphasized_keys",3,null),k=y(e,"clickable",3,!0),v=o(()=>je(e.width,c(),f(),t())),m=o(()=>l(v).piano_keys),g=o(()=>l(v).natural_key_width),x=o(()=>l(v).natural_key_height),T=o(()=>l(v).accidental_key_width),E=o(()=>l(v).accidental_key_height);let _=Te(!1);var s=Fe();Y("mousedown",ne,()=>te(_,!0),!0),Y("mouseup",ne,()=>te(_,!1),!0),Y("mouseleave",ne,()=>te(_,!1)),Le(s,21,()=>l(m),({note:w,left_offset:L})=>w,(w,L)=>{let A=()=>l(L).note,Q=()=>l(L).left_offset;var R=o(()=>!r()||r().has(A())),V=o(()=>{var u;return(u=b())==null?void 0:u.has(A())}),i=o(()=>{var u;return(u=h())==null?void 0:u.has(A())}),a=o(()=>{var u;return(u=d())==null?void 0:u.has(A())});Ne(w,{get note(){return A()},get left_offset(){return Q()},get clickable(){return k()},get enabled(){return l(R)},get pressed(){return l(V)},get highlighted(){return l(i)},get emphasized(){return l(a)},get middle_c_label(){return e.middle_c_label},get allow_sticking(){return e.allow_sticking},get pressing_any(){return l(_)},get onpress(){return e.onpress},get onrelease(){return e.onrelease}})}),F(s),j(()=>{N(s,"aria-disabled",!k()),B(s,"disabled",!k()),H(s,"width",`${e.width??""}px`),H(s,"height",`${l(x)??""}px`),H(s,"--piano_natural_key_width",`${l(g)??""}px`),H(s,"--piano_natural_key_height",`${l(x)??""}px`),H(s,"--piano_accidental_key_width",`${l(T)??""}px`),H(s,"--piano_accidental_key_height",`${l(E)??""}px`)}),M(n,s),J()}var D=(n=>(n[n.Stop=8]="Stop",n[n.Start=9]="Start",n[n.Knob=11]="Knob",n[n.PitchBend=14]="PitchBend",n))(D||{});function pe(n,e){q(e,!0);const t=console.log.bind(console),c=h=>{var x,T,E,_,s,w,L;const d=He(h),{command:k,channel:v,note:m,velocity:g}=d;switch(t("midimessage",k,d),k){case D.Stop:{v===0?(x=e.onnotestop)==null||x.call(e,m,g):v===9?(T=e.onpadstop)==null||T.call(e,m,g):t("unknown MIDI stop command",d);break}case D.Start:{v===0?g===0?(E=e.onnotestop)==null||E.call(e,m,g):(_=e.onnotestart)==null||_.call(e,m,g):v===9?g===0?(s=e.onpadstop)==null||s.call(e,m,g):(w=e.onpadstart)==null||w.call(e,m,g):t("unknown MIDI start command",d);break}case D.Knob:{m===1?(L=e.onmodwheel)==null||L.call(e,g):t("unknown MIDI knob command",d);break}case D.PitchBend:{t("unhandled MIDI pitch bend",d);break}default:t("unrecognized MIDI command",d)}},f=[],r=()=>{for(const h of f)h();f.length=0};Ee(r);const b=h=>{if(f.length&&r(),!!h)for(const d of h.inputs.values())d.addEventListener("midimessage",c),f.push(()=>{d.removeEventListener("midimessage",c)})};Me(()=>b(e.midi_access)),J()}var Xe=O('<button type="button" class="icon_button plain_button svelte-1gk9bl5"><!></button>');function $e(n,e){q(e,!0);const t=y(e,"title",3,"go back");var c=Xe();c.__click=function(...r){var b;(b=e.onclick)==null||b.apply(this,r)};var f=se(c);G(f,()=>e.children,r=>{var b=_e(),h=le(b);fe(h,()=>e.children),M(r,b)},r=>{var b=ce("←");M(r,b)}),F(c),j(()=>N(c,"title",t())),M(n,c),J()}he(["click"]);export{$e as B,pe as M,Ce as P,Ve as b};
