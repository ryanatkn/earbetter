import{h as C,i as N,j as F,E as H,H as $,k as z,l as G,m as Z,o as L,v as h,w as D,x as U,U as j,y as J,z as K,A as Q,B,C as q,D as V,F as W,g as S,G as y,I as X,J as k,P as x,K as ee,L as re,M as ae,u as M,N as ne,S as se,O as ue,Q as te,R as ie}from"./Drfw-9es.js";function ce(e,a,[n,r]=[0,0]){N&&n===0&&F();var u=e,t=null,i=null,b=j,g=n>0?H:0,f=!1;const E=(c,l=!0)=>{f=!0,o(l,c)},o=(c,l)=>{if(b===(b=c))return;let d=!1;if(N&&r!==-1){if(n===0){const _=u.data;_===$?r=0:_===z?r=1/0:(r=parseInt(_.substring(1)),r!==r&&(r=b?1/0:-1))}const T=r>n;!!b===T&&(u=G(),Z(u),L(!1),d=!0,r=-1)}b?(t?h(t):l&&(t=D(()=>l(u))),i&&U(i,()=>{i=null})):(i?h(i):l&&(i=D(()=>l(u,[n+1,r]))),t&&U(t,()=>{t=null})),d&&L(!0)};C(()=>{f=!1,a(E),f||o(null,null)},g),N&&(u=J)}let A=!1,O=Symbol();function _e(e,a,n){const r=n[a]??(n[a]={store:null,source:q(void 0),unsubscribe:B});if(r.store!==e&&!(O in n))if(r.unsubscribe(),r.store=e??null,e==null)r.source.v=void 0,r.unsubscribe=B;else{var u=!0;r.unsubscribe=V(e,t=>{u?r.source.v=t:y(r.source,t)}),u=!1}return e&&O in n?W(e):S(r.source)}function ve(){const e={};function a(){K(()=>{for(var n in e)e[n].unsubscribe();Q(e,O,{enumerable:!1,value:!0})})}return[e,a]}function fe(e){var a=A;try{return A=!1,[e(),A]}finally{A=a}}function Y(e){var a;return((a=e.ctx)==null?void 0:a.d)??!1}function oe(e,a,n,r){var p;var u=(n&te)!==0,t=!0,i=(n&ne)!==0,b=(n&ie)!==0,g=!1,f;i?[f,g]=fe(()=>e[a]):f=e[a];var E=se in e||ue in e,o=i&&(((p=X(e,a))==null?void 0:p.set)??(E&&a in e&&(s=>e[a]=s)))||void 0,c=r,l=!0,d=!1,T=()=>(d=!0,l&&(l=!1,b?c=M(r):c=r),c);f===void 0&&r!==void 0&&(o&&t&&k(),f=T(),o&&o(f));var _;if(_=()=>{var s=e[a];return s===void 0?T():(l=!0,d=!1,s)},(n&x)===0)return _;if(o){var w=e.$$legacy;return function(s,I){return arguments.length>0?((!I||w||g)&&o(I?_():s),s):_()}}var P=!1,R=q(f),v=re(()=>{var s=_(),I=S(R);return P?(P=!1,I):R.v=s});return i&&S(v),u||(v.equals=ee),function(s,I){if(arguments.length>0){const m=I?S(v):i?ae(s):s;if(!v.equals(m)){if(P=!0,y(R,m),d&&c!==void 0&&(c=m),Y(v))return s;M(()=>S(v))}return s}return Y(v)?v.v:S(v)}}export{_e as a,ce as i,oe as p,ve as s};
