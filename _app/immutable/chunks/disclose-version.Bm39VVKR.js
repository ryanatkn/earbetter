import{i as $,q,a2 as G,A as U,a6 as b,B as Y,aq as x,C as h,ar as V,ak as D,G as E,F as L,L as d,ah as m,x as I,as as F,at as z,D as P,au as k,av as S,ai as j,aw as J,ax as K,ae as Q,a8 as X,ay as Z,J as ee,p as te,a as re,az as ae}from"./index-client.CU3AkS2I.js";const W=new Set,C=new Set;function ne(e,t,r,i){function n(a){if(i.capture||T.call(t,a),!a.cancelBubble)return r.call(this,a)}return e.startsWith("pointer")||e.startsWith("touch")||e==="wheel"?q(()=>{t.addEventListener(e,n,i)}):t.addEventListener(e,n,i),n}function _e(e,t,r,i,n){var a={capture:i,passive:n},o=ne(e,t,r,a);(t===document.body||t===window||t===document)&&$(()=>{t.removeEventListener(e,o,a)})}function he(e){for(var t=0;t<e.length;t++)W.add(e[t]);for(var r of C)r(e)}function T(e){var M;var t=this,r=t.ownerDocument,i=e.type,n=((M=e.composedPath)==null?void 0:M.call(e))||[],a=n[0]||e.target,o=0,v=e.__root;if(v){var l=n.indexOf(v);if(l!==-1&&(t===document||t===window)){e.__root=t;return}var f=n.indexOf(t);if(f===-1)return;l<=f&&(o=l)}if(a=n[o]||e.target,a!==t){G(e,"currentTarget",{configurable:!0,get(){return a||r}});try{for(var y,c=[];a!==null;){var u=a.assignedSlot||a.parentNode||a.host||null;try{var s=a["__"+i];if(s!==void 0&&!a.disabled)if(U(s)){var[g,...N]=s;g.apply(a,[e,...N])}else s.call(a,e)}catch(A){y?c.push(A):y=A}if(e.cancelBubble||u===t||u===null)break;a=u}if(y){for(let A of c)queueMicrotask(()=>{throw A});throw y}}finally{e.__root=t,delete e.currentTarget}}}let _;function oe(){_=void 0}function pe(e){let t=null,r=h;var i;if(h){for(t=d,_===void 0&&(_=m(document.head));_!==null&&(_.nodeType!==8||_.data!==V);)_=D(_);_===null?E(!1):_=L(D(_))}h||(i=document.head.appendChild(b()));try{Y(()=>e(i),x)}finally{r&&(E(!0),_=d,L(t))}}function B(e){var t=document.createElement("template");return t.innerHTML=e,t.content}function p(e,t){var r=I;r.nodes_start===null&&(r.nodes_start=e,r.nodes_end=t)}function ve(e,t){var r=(t&F)!==0,i=(t&z)!==0,n,a=!e.startsWith("<!>");return()=>{if(h)return p(d,null),d;n===void 0&&(n=B(a?e:"<!>"+e),r||(n=m(n)));var o=i?document.importNode(n,!0):n.cloneNode(!0);if(r){var v=m(o),l=o.lastChild;p(v,l)}else p(o,o);return o}}function me(e,t,r="svg"){var i=!e.startsWith("<!>"),n=(t&F)!==0,a=`<${r}>${i?e:"<!>"+e}</${r}>`,o;return()=>{if(h)return p(d,null),d;if(!o){var v=B(a),l=m(v);if(n)for(o=document.createDocumentFragment();m(l);)o.appendChild(m(l));else o=m(l)}var f=o.cloneNode(!0);if(n){var y=m(f),c=f.lastChild;p(y,c)}else p(f,f);return f}}function ye(e=""){if(!h){var t=b(e+"");return p(t,t),t}var r=d;return r.nodeType!==3&&(r.before(r=b()),L(r)),p(r,r),r}function ge(){if(h)return p(d,null),d;var e=document.createDocumentFragment(),t=document.createComment(""),r=b();return e.append(t,r),p(t,r),e}function we(e,t){if(h){I.nodes_end=d,P();return}e!==null&&e.before(t)}function Ee(e){return e.endsWith("capture")&&e!=="gotpointercapture"&&e!=="lostpointercapture"}const ie=["beforeinput","click","change","dblclick","contextmenu","focusin","focusout","input","keydown","keyup","mousedown","mousemove","mouseout","mouseover","mouseup","pointerdown","pointermove","pointerout","pointerover","pointerup","touchend","touchmove","touchstart"];function Te(e){return ie.includes(e)}const se={formnovalidate:"formNoValidate",ismap:"isMap",nomodule:"noModule",playsinline:"playsInline",readonly:"readOnly"};function be(e){return e=e.toLowerCase(),se[e]??e}const ue=["touchstart","touchmove"];function de(e){return ue.includes(e)}let O=!0;function Le(e,t){t!==(e.__t??(e.__t=e.nodeValue))&&(e.__t=t,e.nodeValue=t==null?"":t+"")}function le(e,t){return H(e,t)}function Ne(e,t){k(),t.intro=t.intro??!1;const r=t.target,i=h,n=d;try{for(var a=m(r);a&&(a.nodeType!==8||a.data!==V);)a=D(a);if(!a)throw S;E(!0),L(a),P();const o=H(e,{...t,anchor:a});if(d===null||d.nodeType!==8||d.data!==j)throw J(),S;return E(!1),o}catch(o){if(o===S)return t.recover===!1&&K(),k(),Q(r),E(!1),le(e,t);throw o}finally{E(i),L(n),oe()}}const w=new Map;function H(e,{target:t,anchor:r,props:i={},events:n,context:a,intro:o=!0}){k();var v=new Set,l=c=>{for(var u=0;u<c.length;u++){var s=c[u];if(!v.has(s)){v.add(s);var g=de(s);t.addEventListener(s,T,{passive:g});var N=w.get(s);N===void 0?(document.addEventListener(s,T,{passive:g}),w.set(s,1)):w.set(s,N+1)}}};l(X(W)),C.add(l);var f=void 0,y=Z(()=>{var c=r??t.appendChild(b());return ee(()=>{if(a){te({});var u=ae;u.c=a}n&&(i.$$events=n),h&&p(c,null),O=o,f=e(c,i)||{},O=!0,h&&(I.nodes_end=d),a&&re()}),()=>{var g;for(var u of v){t.removeEventListener(u,T);var s=w.get(u);--s===0?(document.removeEventListener(u,T),w.delete(u)):w.set(u,s)}C.delete(l),R.delete(f),c!==r&&((g=c.parentNode)==null||g.removeChild(c))}});return R.set(f,y),f}let R=new WeakMap;function Ae(e){const t=R.get(e);t&&t()}const fe="5";typeof window<"u"&&(window.__svelte||(window.__svelte={v:new Set})).v.add(fe);export{we as a,ye as b,ge as c,he as d,_e as e,Ne as f,ne as g,pe as h,Ee as i,Te as j,p as k,B as l,le as m,be as n,me as o,O as p,Le as s,ve as t,Ae as u};
