import{d as w,f,c as l,r as v,a as s,t as _,e as N,b as O,s as y}from"./disclose-version.C5EwI3-V.js";import{p as P,t as m,g as a,a as Q,d as n}from"./index-client.Cqv4GYu1.js";import{p as R,i as b}from"./props.DNuZbuIM.js";import{a as A,b as q,c as z}from"./style.BTM4hw-r.js";const B={inform:{color:"var(--text_color_3)",icon:"✻"},help:{color:"var(--color_b_5)",icon:"➺"},error:{color:"var(--color_c_5)",icon:"!?"}};var S=_('<div class="icon svelte-tarwjh"><!></div>'),T=_('<!> <div class="content svelte-tarwjh"><!></div>',1),U=_("<button><!></button>"),V=_("<div><!></div>");function p(C,o){P(o,!0);const g=r=>{var t=T(),e=f(t);b(e,()=>o.icon!==null,K=>{var d=S(),L=l(d);b(L,()=>!o.icon||typeof o.icon=="string",u=>{var i=N();m(()=>O(i,a(j))),s(u,i)},u=>{var i=w(),M=f(i);z(M,()=>o.icon,()=>a(j)),s(u,i)}),v(d),s(K,d)});var c=y(y(e,!0)),J=l(c);z(J,()=>o.children),v(c),s(r,t)},D=R(o,"status",3,"inform"),E=n(()=>B[D()]),F=n(()=>a(E)),h=n(()=>{let{color:r,icon:t}=a(F);return[r,t]}),G=n(()=>a(h)[0]),H=n(()=>a(h)[1]),x=n(()=>o.color??a(G)),j=n(()=>typeof o.icon=="string"?o.icon:a(H)??B.inform.icon);var k=w(),I=f(k);b(I,()=>o.onclick,r=>{var t=U();let e;var c=l(t);g(c),v(t),m(()=>{e=A(t,e,{class:"message",type:"button",onclick:o.onclick,disabled:o.disabled,...o.attrs},!0,"svelte-tarwjh"),q(t,"--text_color",a(x))}),s(r,t)},r=>{var t=V();let e;var c=l(t);g(c),v(t),m(()=>{e=A(t,e,{role:"alert",class:"message panel",...o.attrs},!0,"svelte-tarwjh"),q(t,"--text_color",a(x))}),s(r,t)}),s(C,k),Q()}export{p as A};
