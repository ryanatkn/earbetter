import{a2 as _r,h as fr,m as V,i as S,a3 as gr,j as Ar,g as Q,a4 as Er,k as pr,l as Z,o as H,y as L,a5 as br,v as tr,w as Y,x as Sr,a6 as k,a7 as sr,a8 as y,C as Tr,a9 as m,aa as F,ab as Nr,ac as Cr,ad as Ir,ae as ur,af as G,ag as wr,ah as Lr,ai as Rr,q as Mr,aj as x,ak as nr,al as Or,E as Hr,B as Dr,am as $r,an as Pr,ao as qr,ap as Vr,aq as kr,ar as Br,as as Ur}from"./Drfw-9es.js";import{i as Yr,g as Fr,d as Gr,j as Wr,n as jr,k as zr,o as Kr}from"./D6FQBtKd.js";function ta(r,a){return a}function Xr(r,a,e,i){for(var f=[],t=a.length,n=0;n<t;n++)Nr(a[n].e,f,!0);var d=t>0&&f.length===0&&e!==null;if(d){var A=e.parentNode;Cr(A),A.append(e),i.clear(),w(r,a[0].prev,a[t-1].next)}Ir(f,()=>{for(var v=0;v<t;v++){var h=a[v];d||(i.delete(h.k),w(r,h.prev,h.next)),ur(h.e,!d)}})}function sa(r,a,e,i,f,t=null){var n=r,d={flags:a,items:new Map,first:null},A=(a&nr)!==0;if(A){var v=r;n=S?V(gr(v)):v.appendChild(_r())}S&&Ar();var h=null,E=!1,u=Er(()=>{var _=e();return Rr(_)?_:_==null?[]:sr(_)});fr(()=>{var _=Q(u),l=_.length;if(E&&l===0)return;E=l===0;let T=!1;if(S){var b=n.data===pr;b!==(l===0)&&(n=Z(),V(n),H(!1),T=!0)}if(S){for(var g=null,N,c=0;c<l;c++){if(L.nodeType===8&&L.data===br){n=L,T=!0,H(!1);break}var s=_[c],o=i(s,c);N=lr(L,d,g,null,s,o,c,f,a,e),d.items.set(o,N),g=N}l>0&&V(Z())}S||Jr(_,d,n,f,a,i,e),t!==null&&(l===0?h?tr(h):h=Y(()=>t(n)):h!==null&&Sr(h,()=>{h=null})),T&&H(!0),Q(u)}),S&&(n=L)}function Jr(r,a,e,i,f,t,n){var j,z,K,X;var d=(f&Or)!==0,A=(f&(G|F))!==0,v=r.length,h=a.items,E=a.first,u=E,_,l=null,T,b=[],g=[],N,c,s,o;if(d)for(o=0;o<v;o+=1)N=r[o],c=t(N,o),s=h.get(c),s!==void 0&&((j=s.a)==null||j.measure(),(T??(T=new Set)).add(s));for(o=0;o<v;o+=1){if(N=r[o],c=t(N,o),s=h.get(c),s===void 0){var I=u?u.e.nodes_start:e;l=lr(I,a,l,l===null?a.first:l.next,N,c,o,i,f,n),h.set(c,l),b=[],g=[],u=l.next;continue}if(A&&Qr(s,N,o,f),(s.e.f&k)!==0&&(tr(s.e),d&&((z=s.a)==null||z.unfix(),(T??(T=new Set)).delete(s))),s!==u){if(_!==void 0&&_.has(s)){if(b.length<g.length){var p=g[0],C;l=p.prev;var D=b[0],P=b[b.length-1];for(C=0;C<b.length;C+=1)rr(b[C],p,e);for(C=0;C<g.length;C+=1)_.delete(g[C]);w(a,D.prev,P.next),w(a,l,D),w(a,P,p),u=p,l=P,o-=1,b=[],g=[]}else _.delete(s),rr(s,u,e),w(a,s.prev,s.next),w(a,s,l===null?a.first:l.next),w(a,l,s),l=s;continue}for(b=[],g=[];u!==null&&u.k!==c;)(u.e.f&k)===0&&(_??(_=new Set)).add(u),g.push(u),u=u.next;if(u===null)continue;s=u}b.push(s),l=s,u=s.next}if(u!==null||_!==void 0){for(var R=_===void 0?[]:sr(_);u!==null;)(u.e.f&k)===0&&R.push(u),u=u.next;var q=R.length;if(q>0){var hr=(f&nr)!==0&&v===0?e:null;if(d){for(o=0;o<q;o+=1)(K=R[o].a)==null||K.measure();for(o=0;o<q;o+=1)(X=R[o].a)==null||X.fix()}Xr(a,R,hr,h)}}d&&Mr(()=>{var J;if(T!==void 0)for(s of T)(J=s.a)==null||J.apply()}),y.first=a.first&&a.first.e,y.last=l&&l.e}function Qr(r,a,e,i){(i&G)!==0&&x(r.v,a),(i&F)!==0?x(r.i,e):r.i=e}function lr(r,a,e,i,f,t,n,d,A,v){var h=(A&G)!==0,E=(A&wr)===0,u=h?E?Tr(f):m(f):f,_=(A&F)===0?n:m(n),l={i:_,v:u,k:t,a:null,e:null,prev:e,next:i};try{return l.e=Y(()=>d(r,u,_,v),S),l.e.prev=e&&e.e,l.e.next=i&&i.e,e===null?a.first=l:(e.next=l,e.e.next=l.e),i!==null&&(i.prev=l,i.e.prev=l.e),l}finally{}}function rr(r,a,e){for(var i=r.next?r.next.e.nodes_start:e,f=a?a.e.nodes_start:e,t=r.e.nodes_start;t!==i;){var n=Lr(t);f.before(t),t=n}}function w(r,a,e){a===null?r.first=e:(a.next=e,a.e.next=e&&e.e),e!==null&&(e.prev=a,e.e.prev=a&&a.e)}function ua(r,a,...e){var i=r,f=Dr,t;fr(()=>{f!==(f=a())&&(t&&(ur(t),t=null),t=Y(()=>f(i,...e)))},Hr),S&&(i=L)}function or(r){var a,e,i="";if(typeof r=="string"||typeof r=="number")i+=r;else if(typeof r=="object")if(Array.isArray(r)){var f=r.length;for(a=0;a<f;a++)r[a]&&(e=or(r[a]))&&(i&&(i+=" "),i+=e)}else for(e in r)r[e]&&(i&&(i+=" "),i+=e);return i}function Zr(){for(var r,a,e=0,i="",f=arguments.length;e<f;e++)(r=arguments[e])&&(a=or(r))&&(i&&(i+=" "),i+=a);return i}function yr(r){return typeof r=="object"?Zr(r):r??""}const ar=[...` 	
\r\f \v\uFEFF`];function mr(r,a,e){var i=r==null?"":""+r;if(a&&(i=i?i+" "+a:a),e){for(var f in e)if(e[f])i=i?i+" "+f:f;else if(i.length)for(var t=f.length,n=0;(n=i.indexOf(f,n))>=0;){var d=n+t;(n===0||ar.includes(i[n-1]))&&(d===i.length||ar.includes(i[d]))?i=(n===0?"":i.substring(0,n))+i.substring(d+1):n=d}}return i===""?null:i}function er(r,a=!1){var e=a?" !important;":";",i="";for(var f in r){var t=r[f];t!=null&&t!==""&&(i+=" "+f+": "+t+e)}return i}function B(r){return r[0]!=="-"||r[1]!=="-"?r.toLowerCase():r}function xr(r,a){if(a){var e="",i,f;if(Array.isArray(a)?(i=a[0],f=a[1]):i=a,r){r=String(r).replaceAll(/\s*\/\*.*?\*\/\s*/g,"").trim();var t=!1,n=0,d=!1,A=[];i&&A.push(...Object.keys(i).map(B)),f&&A.push(...Object.keys(f).map(B));var v=0,h=-1;const T=r.length;for(var E=0;E<T;E++){var u=r[E];if(d?u==="/"&&r[E-1]==="*"&&(d=!1):t?t===u&&(t=!1):u==="/"&&r[E+1]==="*"?d=!0:u==='"'||u==="'"?t=u:u==="("?n++:u===")"&&n--,!d&&t===!1&&n===0){if(u===":"&&h===-1)h=E;else if(u===";"||E===T-1){if(h!==-1){var _=B(r.substring(v,h).trim());if(!A.includes(_)){u!==";"&&E++;var l=r.substring(v,E).trim();e+=" "+l+";"}}v=E+1,h=-1}}}}return i&&(e+=er(i)),f&&(e+=er(f,!0)),e=e.trim(),e===""?null:e}return r==null?null:String(r)}function ra(r,a,e,i,f,t){var n=r.__className;if(S||n!==e||n===void 0){var d=mr(e,i,t);(!S||d!==r.getAttribute("class"))&&(d==null?r.removeAttribute("class"):a?r.className=d:r.setAttribute("class",d)),r.__className=e}else if(t&&f!==t)for(var A in t){var v=!!t[A];(f==null||v!==!!f[A])&&r.classList.toggle(A,v)}return t}function U(r,a={},e,i){for(var f in e){var t=e[f];a[f]!==t&&(e[f]==null?r.style.removeProperty(f):r.style.setProperty(f,t,i))}}function aa(r,a,e,i){var f=r.__style;if(S||f!==a){var t=xr(a,i);(!S||t!==r.getAttribute("style"))&&(t==null?r.removeAttribute("style"):r.style.cssText=t),r.__style=a}else i&&(Array.isArray(i)?(U(r,e==null?void 0:e[0],i[0]),U(r,e==null?void 0:e[1],i[1],"important")):U(r,e,i));return i}const M=Symbol("class"),O=Symbol("style"),cr=Symbol("is custom element"),vr=Symbol("is html");function na(r){if(S){var a=!1,e=()=>{if(!a){if(a=!0,r.hasAttribute("value")){var i=r.value;$(r,"value",null),r.value=i}if(r.hasAttribute("checked")){var f=r.checked;$(r,"checked",null),r.checked=f}}};r.__on_r=e,kr(e),zr()}}function la(r,a){var e=W(r);e.value===(e.value=a??void 0)||r.value===a&&(a!==0||r.nodeName!=="PROGRESS")||(r.value=a??"")}function ea(r,a){a?r.hasAttribute("selected")||r.setAttribute("selected",""):r.removeAttribute("selected")}function $(r,a,e,i){var f=W(r);S&&(f[a]=r.getAttribute(a),a==="src"||a==="srcset"||a==="href"&&r.nodeName==="LINK")||f[a]!==(f[a]=e)&&(a==="loading"&&(r[$r]=e),e==null?r.removeAttribute(a):typeof e!="string"&&dr(r).includes(a)?r[a]=e:r.setAttribute(a,e))}function oa(r,a,e,i,f=!1){var t=W(r),n=t[cr],d=!t[vr];let A=S&&n;A&&H(!1);var v=a||{},h=r.tagName==="OPTION";for(var E in a)E in e||(e[E]=null);e.class?e.class=yr(e.class):(i||e[M])&&(e.class=null),e[O]&&(e.style??(e.style=null));var u=dr(r);for(const c in e){let s=e[c];if(h&&c==="value"&&s==null){r.value=r.__value="",v[c]=s;continue}if(c==="class"){var _=r.namespaceURI==="http://www.w3.org/1999/xhtml";ra(r,_,s,i,a==null?void 0:a[M],e[M]),v[c]=s,v[M]=e[M];continue}if(c==="style"){aa(r,s,a==null?void 0:a[O],e[O]),v[c]=s,v[O]=e[O];continue}var l=v[c];if(s!==l){v[c]=s;var T=c[0]+c[1];if(T!=="$$")if(T==="on"){const o={},I="$$"+c;let p=c.slice(2);var b=Kr(p);if(Yr(p)&&(p=p.slice(0,-7),o.capture=!0),!b&&l){if(s!=null)continue;r.removeEventListener(p,v[I],o),v[I]=null}if(s!=null)if(b)r[`__${p}`]=s,Gr([p]);else{let C=function(D){v[c].call(this,D)};v[I]=Fr(p,r,C,o)}else b&&(r[`__${p}`]=void 0)}else if(c==="style")$(r,c,s);else if(c==="autofocus")Wr(r,!!s);else if(!n&&(c==="__value"||c==="value"&&s!=null))r.value=r.__value=s;else if(c==="selected"&&h)ea(r,s);else{var g=c;d||(g=jr(g));var N=g==="defaultValue"||g==="defaultChecked";if(s==null&&!n&&!N)if(t[c]=null,g==="value"||g==="checked"){let o=r;const I=a===void 0;if(g==="value"){let p=o.defaultValue;o.removeAttribute(g),o.defaultValue=p,o.value=o.__value=I?p:null}else{let p=o.defaultChecked;o.removeAttribute(g),o.defaultChecked=p,o.checked=I?p:!1}}else r.removeAttribute(c);else N||u.includes(g)&&(n||typeof s!="string")?r[g]=s:typeof s!="function"&&$(r,g,s)}}}return A&&H(!0),v}function W(r){return r.__attributes??(r.__attributes={[cr]:r.nodeName.includes("-"),[vr]:r.namespaceURI===Pr})}var ir=new Map;function dr(r){var a=ir.get(r.nodeName);if(a)return a;ir.set(r.nodeName,a=[]);for(var e,i=r,f=Element.prototype;f!==i;){e=Vr(i);for(var t in e)e[t].set&&a.push(t);i=qr(i)}return a}function ca(r){const a=Symbol(),e=()=>{const i=Ur(a);return i===void 0?r==null?void 0:r():i};return{get:i=>{const f=e();if(f===void 0)throw Error(i??"context value is not set");return f},maybe_get:e,set:(i=r==null?void 0:r())=>Br(a,i)}}const va=(r,a)=>!a||!r.startsWith(a)?r:r.substring(a.length),da=(r,a)=>r.endsWith(a)?r:r+a,ha=(r,a="s")=>r===1?"":a;export{O as S,oa as a,ua as b,ra as c,aa as d,sa as e,da as f,va as g,ca as h,ta as i,la as j,yr as k,ha as p,na as r,$ as s};
