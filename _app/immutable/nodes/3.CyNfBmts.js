import{a as k,t as E,s as C,b as ae,d as ve,h as de}from"../chunks/disclose-version.DScDdLmE.js";import{p as O,t as B,a as X,c as o,s as a,r as s,g as d,d as se,n as me,f as ne,_ as G,Y as ce,a0 as ue,j as K}from"../chunks/index-client.BfCuAN0g.js";import{p as N,i as q,a as j}from"../chunks/props.BNuNwr8n.js";import{s as v,r as D,t as pe,e as Q,b as ge}from"../chunks/string.C2WA7m-2.js";import{M as fe,B as be,b as xe,P as he}from"../chunks/Back_Button.BIsE2_YD.js";import{a as z,b as F,m as U,t as ye,c as ke,l as we,d as Ie,p as Me,e as Z,g as Ae,z as $e,f as ee,h as Be,j as Ce,k as te,n as Ee,w as Pe,o as Se}from"../chunks/index.nj7nPNN4.js";import{g as Te,b as je}from"../chunks/entry.Da20E6Lq.js";import{b as H,i as De,a as ze,s as Fe,I as He,V as Ne,c as Re}from"../chunks/Init_Midi_Button.dh4NN2y0.js";import{H as Ve}from"../chunks/Header.D3S1U148.js";import{F as We}from"../chunks/Footer.MswdrBMo.js";import{A as Ye}from"../chunks/Alert.CSlOhEGy.js";var Ge=E("<div><!></div>"),Ke=E('<div class="midi-range-control"><div class="box row"><label class="text_align_center"><div class="title">lowest note</div> <div> </div> <input type="range"> <input type="number"></label> <label class="text_align_center"><div class="title">highest note</div> <div> </div> <input type="range"> <input type="number"></label></div> <!></div>');function Oe(w,m){O(m,!0);let e=N(m,"min_note",15),f=N(m,"max_note",15);const b=se(()=>e()>f()?"note min cannot be larger than the max":!1);var c=Ke(),r=o(c),u=o(r),h=a(o(u),2),M=o(h);s(h);var l=a(h,2);D(l),v(l,"step",1),v(l,"min",z),v(l,"max",F);var n=a(l,2);D(n),v(n,"step",1),v(n,"min",z),v(n,"max",F),s(u);var i=a(u,2),_=a(o(i),2),x=o(_);s(_);var p=a(_,2);D(p),v(p,"step",1),v(p,"min",z),v(p,"max",F);var g=a(p,2);D(g),v(g,"step",1),v(g,"min",z),v(g,"max",F),s(i),s(r);var y=a(r,2);q(y,()=>d(b),S=>{var I=Ge(),A=o(I);Ye(A,{status:"error",children:(R,T)=>{me();var $=ae();B(()=>C($,d(b))),k(R,$)},$$slots:{default:!0}}),s(I),ye(3,I,()=>ke),k(S,I)}),s(c),B(()=>{pe(c,"error",!!d(b)),C(M,U[e()]),C(x,U[f()])}),H(l,e),H(n,e),H(p,f),H(g,f),k(w,c),X()}var Xe=(w,m)=>m(we(w.currentTarget.value)),qe=E("<option> </option>"),Je=E("<option> <!></option>"),Le=E('<label class="text_align_center svelte-199vc6u"><div class="title">scale</div> <select></select></label> <label class="text_align_center svelte-199vc6u"><div class="title">key</div> <select></select></label>',1);function Qe(w,m){O(m,!0);let e=N(m,"scale",15),f=N(m,"key",15);var b=Le(),c=ne(b),r=a(o(c),2);De(r,()=>e().name);var u;r.__input=[Xe,e],Q(r,20,()=>Ie,l=>l,(l,n)=>{var i=qe(),_={},x=o(i);s(i),B(()=>{_!==(_=n.name)&&(i.value=(i.__value=n.name)==null?"":n.name),C(x,n.name)}),k(l,i)}),s(r),s(c);var h=a(c,2),M=a(o(h),2);Q(M,20,()=>Me,l=>l,(l,n)=>{var i=Je(),_={},x=o(i),p=a(x);q(p,()=>n in Z,g=>{var y=ae();B(()=>C(y,`/${Z[n]??""}`)),k(g,y)}),s(i),B(()=>{_!==(_=n)&&(i.value=(i.__value=n)==null?"":n),C(x,n)}),k(l,i)}),s(M),s(h),B(()=>{u!==(u=e().name)&&(r.value=(r.__value=e().name)==null?"":e().name,Fe(r,e().name))}),ze(M,f),k(w,b),X()}ve(["input"]);var Ue=E('<!> <main class="svelte-3fkhg9"><!> <!> <div class="piano_wrapper svelte-3fkhg9"><!></div> <form class="width_sm panel p_md"><fieldset><!> <div class="row mb_lg"><!></div> <!></fieldset> <fieldset><!></fieldset> <fieldset class="row"><!></fieldset></form> <!></main>',1);function vt(w,m){O(m,!0);const e=Ae(),f=$e.object({min_note:ee.default(36),max_note:ee.default(96)}),b="piano",c=Be(b,()=>f.parse({}),f.parse);let r=G(j(c.min_note)),u=G(j(c.max_note));const h=()=>({min_note:d(r),max_note:d(u)});ce(()=>Se(b,h()));const l=Ce(),{playing_notes:n}=e;let i=G(void 0);const _=20,x=(t,P=null)=>{(!e.enabled_notes||e.enabled_notes.has(t))&&Ee(e,l(),t,Pe(e.volume,P),e.instrument)};var p=Ue();de(t=>{ue.title="Earbetter: piano"});var g=ne(p);fe(g,{get midi_access(){return e.midi_access},onnotestart:(t,P)=>x(t,P),onnotestop:t=>te(t)});var y=a(g,2),S=o(y);be(S,{onclick:()=>Te(je+"/")});var I=a(S,2);Ve(I);var A=a(I,2);ge(A,"padding",`${_}px`);var R=o(A);q(R,()=>d(i),t=>{var P=se(()=>d(i)-_*2);he(t,{get width(){return d(P)},get min_note(){return d(r)},get max_note(){return d(u)},pressed_keys:n,get enabled_notes(){return e.enabled_notes},onpress:Y=>x(Y),onrelease:Y=>te(Y),middle_c_label:!0,allow_sticking:!0})}),s(A);var T=a(A,2),$=o(T),J=o($);He(J,{get instrument(){return e.instrument},set instrument(t){e.instrument=t}});var V=a(J,2),ie=o(V);Qe(ie,{get scale(){return e.scale},set scale(t){e.scale=t},get key(){return e.key},set key(t){e.key=t}}),s(V);var oe=a(V,2);Ne(oe,{get volume(){return e.volume},set volume(t){e.volume=t}}),s($);var W=a($,2),re=o(W);Re(re,{midi_state:e}),s(W);var L=a(W,2),le=o(L);Oe(le,{get min_note(){return d(r)},set min_note(t){K(r,j(t))},get max_note(){return d(u)},set max_note(t){K(u,j(t))}}),s(L),s(T);var _e=a(T,2);We(_e,{}),s(y),xe(y,"clientWidth",t=>K(i,t)),k(w,p),X()}export{vt as component};
