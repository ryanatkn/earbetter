var st=e=>{throw TypeError(e)};var Et=(e,t,a)=>t.has(e)||st("Cannot "+a);var P=(e,t,a)=>(Et(e,t,"read from private field"),a?a.call(e):t.get(e)),Q=(e,t,a)=>t.has(e)?st("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,a);import{c as X,h as ct,a as b,t as $,e as tt,s as $t,d as It}from"../chunks/D6FQBtKd.js";import{V as J,g as n,G as R,T as B,p as K,f as I,d as G,b as C,s as m,$ as et,c as i,a as h,t as Tt,n as nt,u as Lt,X as At}from"../chunks/Drfw-9es.js";import{p as M,i as Y,s as dt,a as mt}from"../chunks/CnDERkxj.js";import{h as Dt,b as gt,e as Mt,c as Ot,s as ut,g as Ct,d as Nt}from"../chunks/wr1Q2OBW.js";import{h as lt,p as vt,m as pt,S as jt,e as Pt,a as Ut,F as Ft}from"../chunks/CxoK_AUc.js";import{z as Kt,P as Gt,S as Ht,I as Vt,V as Bt,J as Jt,K as Rt,L as Yt,D as qt,j as ft,f as xt,t as Wt,c as Qt,h as Xt,N as Zt,k as te,O as ee,Q as ae,i as oe,s as O}from"../chunks/CPUX8dqx.js";import{D as _e}from"../chunks/D4kchBJr.js";import{V as re,I as se,c as ne,r as le}from"../chunks/BpNc9_EQ.js";import{b as at,a as he}from"../chunks/DGs4Uxve.js";const ie=!0,Yn=Object.freeze(Object.defineProperty({__proto__:null,prerender:ie},Symbol.toStringTag,{value:"Module"})),T={icon_size_xs:"18px",icon_size_sm:"32px",icon_size_md:"48px",icon_size_lg:"80px",icon_size_xl:"128px",icon_size_xl2:"192px",icon_size_xl3:"256px"},ce={name:"hue_a",light:"210",summary:"blue"},de={name:"hue_b",light:"120",summary:"green"},me={name:"hue_c",light:"0",summary:"red"},ge={name:"hue_d",light:"260",summary:"purple"},ue={name:"hue_e",light:"50",summary:"yellow"},ve={name:"hue_f",light:"27",summary:"brown"},pe={name:"hue_g",light:"335",summary:"pink"},fe={name:"hue_h",light:"17",summary:"orange"},xe={name:"hue_i",light:"180",summary:"cyan"},ke={name:"color_a_1",light:"hsl(var(--hue_a) 65% 91%)"},be={name:"color_a_2",light:"hsl(var(--hue_a) 62% 84%)",dark:"hsl(var(--hue_a) 62% 87%)"},we={name:"color_a_3",light:"hsl(var(--hue_a) 60% 73%)",dark:"hsl(var(--hue_a) 60% 82%)"},ye={name:"color_a_4",light:"hsl(var(--hue_a) 60% 62%)",dark:"hsl(var(--hue_a) 60% 76%)"},ze={name:"color_a_5",light:"hsl(var(--hue_a) 55% 50%)",dark:"hsl(var(--hue_a) 55% 70%)"},Se={name:"color_a_6",light:"hsl(var(--hue_a) 55% 40%)",dark:"hsl(var(--hue_a) 55% 55%)"},Ee={name:"color_a_7",light:"hsl(var(--hue_a) 55% 30%)",dark:"hsl(var(--hue_a) 55% 40%)"},$e={name:"color_a_8",light:"hsl(var(--hue_a) 55% 20%)",dark:"hsl(var(--hue_a) 55% 25%)"},Ie={name:"color_a_9",light:"hsl(var(--hue_a) 55% 10%)"},Te={name:"color_b_1",light:"hsl(var(--hue_b) 55% 90%)"},Le={name:"color_b_2",light:"hsl(var(--hue_b) 50% 77%)",dark:"hsl(var(--hue_b) 50% 82%)"},Ae={name:"color_b_3",light:"hsl(var(--hue_b) 50% 63%)",dark:"hsl(var(--hue_b) 50% 74%)"},De={name:"color_b_4",light:"hsl(var(--hue_b) 50% 49%)",dark:"hsl(var(--hue_b) 50% 66%)"},Me={name:"color_b_5",light:"hsl(var(--hue_b) 55% 36%)",dark:"hsl(var(--hue_b) 43% 58%)"},Oe={name:"color_b_6",light:"hsl(var(--hue_b) 60% 25%)",dark:"hsl(var(--hue_b) 51% 45%)"},Ce={name:"color_b_7",light:"hsl(var(--hue_b) 65% 18%)",dark:"hsl(var(--hue_b) 59% 33%)"},Ne={name:"color_b_8",light:"hsl(var(--hue_b) 70% 12%)",dark:"hsl(var(--hue_b) 67% 20%)"},je={name:"color_b_9",light:"hsl(var(--hue_b) 75% 7%)"},Pe={name:"color_c_1",light:"hsl(var(--hue_c) 85% 92%)"},Ue={name:"color_c_2",light:"hsl(var(--hue_c) 80% 83%)",dark:"hsl(var(--hue_c) 81% 83%)"},Fe={name:"color_c_3",light:"hsl(var(--hue_c) 75% 73%)",dark:"hsl(var(--hue_c) 78% 74%)"},Ke={name:"color_c_4",light:"hsl(var(--hue_c) 70% 63%)",dark:"hsl(var(--hue_c) 74% 65%)"},Ge={name:"color_c_5",light:"hsl(var(--hue_c) 65% 50%)",dark:"hsl(var(--hue_c) 70% 56%)"},He={name:"color_c_6",light:"hsl(var(--hue_c) 65% 40%)",dark:"hsl(var(--hue_c) 65% 45%)"},Ve={name:"color_c_7",light:"hsl(var(--hue_c) 65% 30%)",dark:"hsl(var(--hue_c) 65% 33%)"},Be={name:"color_c_8",light:"hsl(var(--hue_c) 65% 20%)",dark:"hsl(var(--hue_c) 65% 22%)"},Je={name:"color_c_9",light:"hsl(var(--hue_c) 65% 10%)"},Re={name:"color_d_1",light:"hsl(var(--hue_d) 50% 91%)"},Ye={name:"color_d_2",light:"hsl(var(--hue_d) 50% 82%)",dark:"hsl(var(--hue_d) 50% 86%)"},qe={name:"color_d_3",light:"hsl(var(--hue_d) 50% 72%)",dark:"hsl(var(--hue_d) 50% 81%)"},We={name:"color_d_4",light:"hsl(var(--hue_d) 50% 62%)",dark:"hsl(var(--hue_d) 50% 76%)"},Qe={name:"color_d_5",light:"hsl(var(--hue_d) 50% 50%)",dark:"hsl(var(--hue_d) 50% 70%)"},Xe={name:"color_d_6",light:"hsl(var(--hue_d) 50% 40%)",dark:"hsl(var(--hue_d) 50% 55%)"},Ze={name:"color_d_7",light:"hsl(var(--hue_d) 50% 30%)",dark:"hsl(var(--hue_d) 50% 40%)"},ta={name:"color_d_8",light:"hsl(var(--hue_d) 50% 20%)",dark:"hsl(var(--hue_d) 50% 25%)"},ea={name:"color_d_9",light:"hsl(var(--hue_d) 50% 10%)"},aa={name:"color_e_1",light:"hsl(var(--hue_e) 85% 91%)"},oa={name:"color_e_2",light:"hsl(var(--hue_e) 80% 79%)",dark:"hsl(var(--hue_e) 80% 83%)"},_a={name:"color_e_3",light:"hsl(var(--hue_e) 75% 65%)",dark:"hsl(var(--hue_e) 75% 76%)"},ra={name:"color_e_4",light:"hsl(var(--hue_e) 70% 50%)",dark:"hsl(var(--hue_e) 70% 69%)"},sa={name:"color_e_5",light:"hsl(var(--hue_e) 65% 41%)",dark:"hsl(var(--hue_e) 70% 62%)"},na={name:"color_e_6",light:"hsl(var(--hue_e) 70% 34%)",dark:"hsl(var(--hue_e) 70% 49%)"},la={name:"color_e_7",light:"hsl(var(--hue_e) 75% 26%)",dark:"hsl(var(--hue_e) 75% 36%)"},ha={name:"color_e_8",light:"hsl(var(--hue_e) 80% 18%)",dark:"hsl(var(--hue_e) 80% 23%)"},ia={name:"color_e_9",light:"hsl(var(--hue_e) 85% 10%)"},ca={name:"color_f_1",light:"hsl(var(--hue_f) 32% 87%)"},da={name:"color_f_2",light:"hsl(var(--hue_f) 32% 72%)",dark:"hsl(var(--hue_f) 32% 79%)"},ma={name:"color_f_3",light:"hsl(var(--hue_f) 32% 57%)",dark:"hsl(var(--hue_f) 32% 72%)"},ga={name:"color_f_4",light:"hsl(var(--hue_f) 42% 41%)",dark:"hsl(var(--hue_f) 32% 64%)"},ua={name:"color_f_5",light:"hsl(var(--hue_f) 60% 26%)",dark:"hsl(var(--hue_f) 30% 56%)"},va={name:"color_f_6",light:"hsl(var(--hue_f) 65% 18%)",dark:"hsl(var(--hue_f) 40% 44%)"},pa={name:"color_f_7",light:"hsl(var(--hue_f) 70% 14%)",dark:"hsl(var(--hue_f) 50% 31%)"},fa={name:"color_f_8",light:"hsl(var(--hue_f) 75% 10%)",dark:"hsl(var(--hue_f) 70% 19%)"},xa={name:"color_f_9",light:"hsl(var(--hue_f) 80% 6%)"},ka={name:"color_g_1",light:"hsl(var(--hue_g) 72% 91%)"},ba={name:"color_g_2",light:"hsl(var(--hue_g) 72% 83%)",dark:"hsl(var(--hue_g) 72% 86%)"},wa={name:"color_g_3",light:"hsl(var(--hue_g) 72% 74%)",dark:"hsl(var(--hue_g) 72% 81%)"},ya={name:"color_g_4",light:"hsl(var(--hue_g) 72% 65%)",dark:"hsl(var(--hue_g) 72% 76%)"},za={name:"color_g_5",light:"hsl(var(--hue_g) 72% 56%)",dark:"hsl(var(--hue_g) 72% 70%)"},Sa={name:"color_g_6",light:"hsl(var(--hue_g) 72% 44%)",dark:"hsl(var(--hue_g) 72% 55%)"},Ea={name:"color_g_7",light:"hsl(var(--hue_g) 72% 32%)",dark:"hsl(var(--hue_g) 72% 40%)"},$a={name:"color_g_8",light:"hsl(var(--hue_g) 72% 20%)",dark:"hsl(var(--hue_g) 72% 25%)"},Ia={name:"color_g_9",light:"hsl(var(--hue_g) 72% 10%)"},Ta={name:"color_h_1",light:"hsl(var(--hue_h) 90% 91%)"},La={name:"color_h_2",light:"hsl(var(--hue_h) 90% 82%)",dark:"hsl(var(--hue_h) 90% 86%)"},Aa={name:"color_h_3",light:"hsl(var(--hue_h) 90% 72%)",dark:"hsl(var(--hue_h) 90% 81%)"},Da={name:"color_h_4",light:"hsl(var(--hue_h) 90% 62%)",dark:"hsl(var(--hue_h) 90% 74%)"},Ma={name:"color_h_5",light:"hsl(var(--hue_h) 90% 50%)",dark:"hsl(var(--hue_h) 90% 63%)"},Oa={name:"color_h_6",light:"hsl(var(--hue_h) 90% 40%)",dark:"hsl(var(--hue_h) 90% 55%)"},Ca={name:"color_h_7",light:"hsl(var(--hue_h) 90% 30%)",dark:"hsl(var(--hue_h) 90% 40%)"},Na={name:"color_h_8",light:"hsl(var(--hue_h) 90% 20%)",dark:"hsl(var(--hue_h) 90% 25%)"},ja={name:"color_h_9",light:"hsl(var(--hue_h) 90% 10%)"},Pa={name:"color_i_1",light:"hsl(var(--hue_i) 75% 91%)"},Ua={name:"color_i_2",light:"hsl(var(--hue_i) 75% 77%)",dark:"hsl(var(--hue_i) 75% 86%)"},Fa={name:"color_i_3",light:"hsl(var(--hue_i) 75% 60%)",dark:"hsl(var(--hue_i) 75% 81%)"},Ka={name:"color_i_4",light:"hsl(var(--hue_i) 75% 47%)",dark:"hsl(var(--hue_i) 75% 76%)"},Ga={name:"color_i_5",light:"hsl(var(--hue_i) 75% 40%)",dark:"hsl(var(--hue_i) 75% 70%)"},Ha={name:"color_i_6",light:"hsl(var(--hue_i) 75% 33%)",dark:"hsl(var(--hue_i) 75% 55%)"},Va={name:"color_i_7",light:"hsl(var(--hue_i) 75% 25%)",dark:"hsl(var(--hue_i) 75% 40%)"},Ba={name:"color_i_8",light:"hsl(var(--hue_i) 75% 18%)",dark:"hsl(var(--hue_i) 75% 25%)"},Ja={name:"color_i_9",light:"hsl(var(--hue_i) 75% 10%)"},Ra={name:"tint_hue",light:"var(--hue_f)"},Ya={name:"tint_saturation",light:"11%"},qa={name:"darken_1",light:"#0000000f",summary:"6%"},Wa={name:"darken_2",light:"#0000001f",summary:"12%"},Qa={name:"darken_3",light:"#00000036",summary:"21%"},Xa={name:"darken_4",light:"#00000052",summary:"32%"},Za={name:"darken_5",light:"#00000073",summary:"45%"},to={name:"darken_6",light:"#000000a6",summary:"65%"},eo={name:"darken_7",light:"#000000cc",summary:"80%"},ao={name:"darken_8",light:"#000000e3",summary:"89%"},oo={name:"darken_9",light:"#000000f5",summary:"96%"},_o={name:"lighten_1",light:"#ffffff0f",summary:"6%"},ro={name:"lighten_2",light:"#ffffff1f",summary:"12%"},so={name:"lighten_3",light:"#ffffff36",summary:"21%"},no={name:"lighten_4",light:"#ffffff52",summary:"32%"},lo={name:"lighten_5",light:"#ffffff73",summary:"45%"},ho={name:"lighten_6",light:"#ffffffa6",summary:"65%"},io={name:"lighten_7",light:"#ffffffcc",summary:"80%"},co={name:"lighten_8",light:"#ffffffe3",summary:"89%"},mo={name:"lighten_9",light:"#fffffff5",summary:"96%"},go={name:"bg",light:"hsl(var(--tint_hue) var(--tint_saturation) 96%)",dark:"hsl(var(--tint_hue) var(--tint_saturation) 6%)"},uo={name:"fg",light:"hsl(var(--tint_hue) var(--tint_saturation) 6%)",dark:"hsl(var(--tint_hue) var(--tint_saturation) 96%)"},vo={name:"bg_0",light:"#000",dark:"#fff"},po={name:"bg_1",light:"var(--lighten_1)",dark:"var(--darken_1)"},fo={name:"bg_2",light:"var(--lighten_2)",dark:"var(--darken_2)"},xo={name:"bg_3",light:"var(--lighten_3)",dark:"var(--darken_3)"},ko={name:"bg_4",light:"var(--lighten_4)",dark:"var(--darken_4)"},bo={name:"bg_5",light:"var(--lighten_5)",dark:"var(--darken_5)"},wo={name:"bg_6",light:"var(--lighten_6)",dark:"var(--darken_6)"},yo={name:"bg_7",light:"var(--lighten_7)",dark:"var(--darken_7)"},zo={name:"bg_8",light:"var(--lighten_8)",dark:"var(--darken_8)"},So={name:"bg_9",light:"var(--lighten_9)",dark:"var(--darken_9)"},Eo={name:"bg_10",light:"#fff",dark:"#000"},$o={name:"fg_0",light:"#fff",dark:"#000"},Io={name:"fg_1",light:"var(--darken_1)",dark:"var(--lighten_1)"},To={name:"fg_2",light:"var(--darken_2)",dark:"var(--lighten_2)"},Lo={name:"fg_3",light:"var(--darken_3)",dark:"var(--lighten_3)"},Ao={name:"fg_4",light:"var(--darken_4)",dark:"var(--lighten_4)"},Do={name:"fg_5",light:"var(--darken_5)",dark:"var(--lighten_5)"},Mo={name:"fg_6",light:"var(--darken_6)",dark:"var(--lighten_6)"},Oo={name:"fg_7",light:"var(--darken_7)",dark:"var(--lighten_7)"},Co={name:"fg_8",light:"var(--darken_8)",dark:"var(--lighten_8)"},No={name:"fg_9",light:"var(--darken_9)",dark:"var(--lighten_9)"},jo={name:"fg_10",light:"#000",dark:"#fff"},Po={name:"fill",light:"hsl(var(--tint_hue) 5% 50%)"},Uo={name:"fill_a",light:"var(--color_a_4)",dark:"var(--color_a_6)"},Fo={name:"fill_b",light:"var(--color_b_4)",dark:"var(--color_b_6)"},Ko={name:"fill_c",light:"var(--color_c_4)",dark:"var(--color_c_6)"},Go={name:"fill_d",light:"var(--color_d_4)",dark:"var(--color_d_6)"},Ho={name:"fill_e",light:"var(--color_e_4)",dark:"var(--color_e_6)"},Vo={name:"fill_f",light:"var(--color_f_4)",dark:"var(--color_f_6)"},Bo={name:"fill_g",light:"var(--color_g_4)",dark:"var(--color_g_6)"},Jo={name:"fill_h",light:"var(--color_h_4)",dark:"var(--color_h_6)"},Ro={name:"fill_i",light:"var(--color_i_4)",dark:"var(--color_i_6)"},Yo={name:"text_color",light:"var(--text_color_2)"},qo={name:"text_color_0",light:"var(--fg_10)"},Wo={name:"text_color_1",light:"hsl(var(--tint_hue) var(--tint_saturation) 8%)",dark:"hsl(var(--tint_hue) var(--tint_saturation) 90%)"},Qo={name:"text_color_2",light:"hsl(var(--tint_hue) var(--tint_saturation) 16%)",dark:"hsl(var(--tint_hue) var(--tint_saturation) 80%)"},Xo={name:"text_color_3",light:"hsl(var(--tint_hue) var(--tint_saturation) 32%)",dark:"hsl(var(--tint_hue) var(--tint_saturation) 69%)"},Zo={name:"text_color_4",light:"hsl(var(--tint_hue) var(--tint_saturation) 41%)",dark:"hsl(var(--tint_hue) var(--tint_saturation) 58%)"},t_={name:"text_color_5",light:"hsl(var(--tint_hue) var(--tint_saturation) 50%)"},e_={name:"text_color_6",light:"hsl(var(--tint_hue) var(--tint_saturation) 59%)",dark:"hsl(var(--tint_hue) var(--tint_saturation) 40%)"},a_={name:"text_color_7",light:"hsl(var(--tint_hue) var(--tint_saturation) 68%)",dark:"hsl(var(--tint_hue) var(--tint_saturation) 30%)"},o_={name:"text_color_8",light:"hsl(var(--tint_hue) var(--tint_saturation) 82%)",dark:"hsl(var(--tint_hue) var(--tint_saturation) 22%)"},__={name:"text_color_9",light:"hsl(var(--tint_hue) var(--tint_saturation) 96%)",dark:"hsl(var(--tint_hue) var(--tint_saturation) 12%)"},r_={name:"text_color_10",light:"var(--fg_0)"},s_={name:"text_color_disabled",light:"var(--text_color_5)"},n_={name:"text_active",light:"hsl(var(--hue_a) 55% 40%);",dark:"hsl(var(--hue_a) 65% 65%);"},l_={name:"line_height_xs",light:"1"},h_={name:"line_height_sm",light:"1.2"},i_={name:"line_height_md",light:"1.4"},c_={name:"line_height_lg",light:"1.6"},d_={name:"line_height_xl",light:"2"},m_={name:"font_sans",light:"system-ui, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",summary:"@source https://kilianvalkhof.com/2022/css-html/your-css-reset-needs-text-size-adjust-probably/"},g_={name:"font_serif",light:"'DM Serif Display', Georgia, serif",summary:"@source https://svelte.dev/"},u_={name:"font_mono",light:"ui-monospace, 'Fira Mono', monospace"},v_={name:"size_xs",light:"1rem"},p_={name:"size_sm",light:"1.3rem"},f_={name:"size_md",light:"1.6rem"},x_={name:"size_lg",light:"2.04rem"},k_={name:"size_xl",light:"2.59rem"},b_={name:"size_xl2",light:"3.29rem"},w_={name:"size_xl3",light:"4.19rem"},y_={name:"size_xl4",light:"5.33rem"},z_={name:"size_xl5",light:"6.78rem"},S_={name:"size_xl6",light:"8.62rem"},E_={name:"size_xl7",light:"10.97rem"},$_={name:"size_xl8",light:"13.95rem"},I_={name:"size_xl9",light:"17.74rem"},T_={name:"link_color",light:"hsl(var(--hue_a) 61% 35%)",dark:"hsl(var(--hue_a) 61% 58%)"},L_={name:"text_decoration",light:"none"},A_={name:"text_decoration_hover",light:"underline"},D_={name:"text_decoration_selected",light:"underline"},M_={name:"link_color_selected",light:"var(--text_color)"},O_={name:"space_xs5",light:"0.1rem"},C_={name:"space_xs4",light:"0.2rem"},N_={name:"space_xs3",light:"0.3rem"},j_={name:"space_xs2",light:"0.4rem"},P_={name:"space_xs",light:"0.6rem"},U_={name:"space_sm",light:"0.8rem"},F_={name:"space_md",light:"1rem"},K_={name:"space_lg",light:"1.3rem"},G_={name:"space_xl",light:"1.6rem"},H_={name:"space_xl2",light:"2.1rem"},V_={name:"space_xl3",light:"2.6rem"},B_={name:"space_xl4",light:"3.3rem"},J_={name:"space_xl5",light:"4.2rem"},R_={name:"space_xl6",light:"5.4rem"},Y_={name:"space_xl7",light:"6.9rem"},q_={name:"space_xl8",light:"8.7rem"},W_={name:"space_xl9",light:"11.1rem"},Q_={name:"space_xl10",light:"14.1rem"},X_={name:"space_xl11",light:"17.9rem"},Z_={name:"space_xl12",light:"22.8rem"},tr={name:"space_xl13",light:"29rem"},er={name:"space_xl14",light:"36.9rem"},ar={name:"space_xl15",light:"47rem"},or={name:"width_xl",light:"1600px"},_r={name:"width_lg",light:"1200px"},rr={name:"width_md",light:"800px"},sr={name:"width_sm",light:"320px"},nr={name:"width_xs",light:"200px"},lr={name:"border_color",light:"var(--border_color_3)"},hr={name:"border_style",light:"solid"},ir={name:"border_color_1",light:"hsl(var(--tint_hue) 60% 20% / 15%)",dark:"hsl(var(--tint_hue) 60% 80% / 25%)"},cr={name:"border_color_2",light:"hsl(var(--tint_hue) 60% 20% / 25%)",dark:"hsl(var(--tint_hue) 60% 80% / 40%)"},dr={name:"border_color_3",light:"hsl(var(--tint_hue) 60% 20% / 35%)",dark:"hsl(var(--tint_hue) 60% 80% / 55%)"},mr={name:"border_color_4",light:"hsl(var(--tint_hue) 60% 20% / 50%)",dark:"hsl(var(--tint_hue) 60% 80% / 70%)"},gr={name:"border_color_5",light:"hsl(var(--tint_hue) 60% 20% / 70%)",dark:"hsl(var(--tint_hue) 60% 80% / 85%)"},ur={name:"border_color_a",light:"var(--color_a_5)"},vr={name:"border_color_b",light:"var(--color_b_5)"},pr={name:"border_color_c",light:"var(--color_c_5)"},fr={name:"border_color_d",light:"var(--color_d_5)"},xr={name:"border_color_e",light:"var(--color_e_5)"},kr={name:"border_color_f",light:"var(--color_f_5)"},br={name:"border_color_g",light:"var(--color_g_5)"},wr={name:"border_color_h",light:"var(--color_h_5)"},yr={name:"border_color_i",light:"var(--color_i_5)"},zr={name:"border_width",light:"var(--border_width_1)"},Sr={name:"border_width_1",light:"1px"},Er={name:"border_width_2",light:"2px"},$r={name:"border_width_3",light:"3px"},Ir={name:"border_width_4",light:"4px"},Tr={name:"border_width_5",light:"6px"},Lr={name:"border_width_6",light:"8px"},Ar={name:"outline_width",light:"var(--outline_width_1)"},Dr={name:"outline_width_1",light:"0"},Mr={name:"outline_width_2",light:"var(--border_width_2)"},Or={name:"outline_width_3",light:"var(--border_width_1)"},Cr={name:"outline_style",light:"solid"},Nr={name:"outline_color",light:"var(--border_color_a)"},jr={name:"radius_xl",light:"5.5rem"},Pr={name:"radius_lg",light:"3.4rem"},Ur={name:"radius_md",light:"2.1rem"},Fr={name:"radius_sm",light:"1.3rem"},Kr={name:"radius_xs",light:"0.8rem"},Gr={name:"radius_xs2",light:"0.5rem"},Hr={name:"radius_xs3",light:"0.3rem"},Vr={name:"button_shadow",light:"var(--shadow_inset_bottom_xs) color-mix(in hsl, var(--shadow_color) var(--shadow_alpha_1), transparent), var(--shadow_inset_top_xs) color-mix(in hsl, var(--shadow_color_highlight) var(--shadow_alpha_1), transparent)",dark:"var(--shadow_inset_top_xs) color-mix(in hsl, var(--shadow_color) var(--shadow_alpha_1), transparent), var(--shadow_inset_bottom_xs) color-mix(in hsl, var(--shadow_color_highlight) var(--shadow_alpha_1), transparent)"},ot={name:"button_shadow_hover",light:"var(--shadow_inset_bottom_sm) color-mix(in hsl, var(--shadow_color) var(--shadow_alpha_2), transparent), var(--shadow_inset_top_sm) color-mix(in hsl, var(--shadow_color_highlight) var(--shadow_alpha_2), transparent)",dark:"var(--shadow_inset_top_sm) color-mix(in hsl, var(--shadow_color) var(--shadow_alpha_2), transparent), var(--shadow_inset_bottom_sm) color-mix(in hsl, var(--shadow_color_highlight) var(--shadow_alpha_2), transparent)"},Br={name:"button_shadow_active",light:ot.dark,dark:ot.light},Jr={name:"input_fill",light:"var(--bg_10)"},Rr={name:"input_padding_y",light:"0"},Yr={name:"input_padding_x",light:"var(--space_lg)"},qr={name:"input_width_min",light:"100px"},Wr={name:"input_height",light:"var(--space_xl5)"},Qr={name:"input_height_sm",light:"var(--space_xl4)"},Xr={name:"input_height_inner",light:"calc(var(--input_height) - 2 * var(--border_width) - 2 * var(--input_padding_y))"},Zr={name:"shadow_xs",light:"0 0 3px 0px"},ts={name:"shadow_top_xs",light:"0 -1px 3px 0px"},es={name:"shadow_bottom_xs",light:"0 1px 3px 0px"},as={name:"shadow_inset_xs",light:"inset 0 0 3px 0px"},os={name:"shadow_inset_top_xs",light:"inset 0 1px 3px 0px"},_s={name:"shadow_inset_bottom_xs",light:"inset 0 -1px 3px 0px"},rs={name:"shadow_sm",light:"0 0 4px 0px"},ss={name:"shadow_top_sm",light:"0 -1.5px 4px 0px"},ns={name:"shadow_bottom_sm",light:"0 1.5px 4px 0px"},ls={name:"shadow_inset_sm",light:"inset 0 0 4px 0px"},hs={name:"shadow_inset_top_sm",light:"inset 0 1.5px 4px 0px"},is={name:"shadow_inset_bottom_sm",light:"inset 0 -1.5px 4px 0px"},cs={name:"shadow_md",light:"0 0 6px 0px"},ds={name:"shadow_top_md",light:"0 -2.5px 6px 0px"},ms={name:"shadow_bottom_md",light:"0 2.5px 6px 0px"},gs={name:"shadow_inset_md",light:"inset 0 0 6px 0px"},us={name:"shadow_inset_top_md",light:"inset 0 2.5px 6px 0px"},vs={name:"shadow_inset_bottom_md",light:"inset 0 -2.5px 6px 0px"},ps={name:"shadow_lg",light:"0 0 10px 0px"},fs={name:"shadow_top_lg",light:"0 -3.5px 10px 0px"},xs={name:"shadow_bottom_lg",light:"0 3.5px 10px 0px"},ks={name:"shadow_inset_lg",light:"inset 0 0 10px 0px"},bs={name:"shadow_inset_top_lg",light:"inset 0 3.5px 10px 0px"},ws={name:"shadow_inset_bottom_lg",light:"inset 0 -3.5px 10px 0px"},ys={name:"shadow_xl",light:"0 0 20px 1px"},zs={name:"shadow_top_xl",light:"0 -5px 20px 1px"},Ss={name:"shadow_bottom_xl",light:"0 5px 20px 1px"},Es={name:"shadow_inset_xl",light:"inset 0 0 20px 1px"},$s={name:"shadow_inset_top_xl",light:"inset 0 5px 20px 1px"},Is={name:"shadow_inset_bottom_xl",light:"inset 0 -5px 20px 1px"},Ts={name:"shadow_color",light:"hsl(var(--tint_hue) var(--tint_saturation) 0%)",dark:"hsl(var(--tint_hue) var(--tint_saturation) 82%)"},Ls={name:"shadow_color_highlight",light:"hsl(var(--tint_hue) var(--tint_saturation) 94%)",dark:"hsl(var(--tint_hue) var(--tint_saturation) 0%)"},As={name:"shadow_color_glow",light:"hsl(var(--tint_hue) var(--tint_saturation) 94%)",dark:"hsl(var(--tint_hue) var(--tint_saturation) 82%)"},Ds={name:"shadow_color_shroud",light:"hsl(var(--tint_hue) var(--tint_saturation) 0%)"},Ms={name:"shadow_color_a",light:"var(--color_a_6)",dark:"var(--color_a_4)"},Os={name:"shadow_color_b",light:"var(--color_b_6)",dark:"var(--color_b_4)"},Cs={name:"shadow_color_c",light:"var(--color_c_6)",dark:"var(--color_c_4)"},Ns={name:"shadow_color_d",light:"var(--color_d_6)",dark:"var(--color_d_4)"},js={name:"shadow_color_e",light:"var(--color_e_6)",dark:"var(--color_e_4)"},Ps={name:"shadow_color_f",light:"var(--color_f_6)",dark:"var(--color_f_4)"},Us={name:"shadow_color_g",light:"var(--color_g_6)",dark:"var(--color_g_4)"},Fs={name:"shadow_color_h",light:"var(--color_h_6)",dark:"var(--color_h_4)"},Ks={name:"shadow_color_i",light:"var(--color_i_6)",dark:"var(--color_i_4)"},Gs={name:"shadow_alpha_1",light:"20%"},Hs={name:"shadow_alpha_2",light:"30%"},Vs={name:"shadow_alpha_3",light:"40%"},Bs={name:"shadow_alpha_4",light:"60%"},Js={name:"shadow_alpha_5",light:"80%"},Rs={name:"icon_size_xs",light:T.icon_size_xs},Ys={name:"icon_size_sm",light:T.icon_size_sm},qs={name:"icon_size_md",light:T.icon_size_md},Ws={name:"icon_size_lg",light:T.icon_size_lg},Qs={name:"icon_size_xl",light:T.icon_size_xl},Xs={name:"icon_size_xl2",light:T.icon_size_xl2},Zs={name:"icon_size_xl3",light:T.icon_size_xl3},tn={name:"duration_1",light:"0.08s"},en={name:"duration_2",light:"0.2s"},an={name:"duration_3",light:"0.5s"},on={name:"duration_4",light:"1s"},_n={name:"duration_5",light:"1.5s"},rn={name:"duration_6",light:"3s"},sn={name:"fade_1",light:"86%"},nn={name:"fade_2",light:"62%"},ln={name:"fade_3",light:"38%"},hn={name:"fade_4",light:"24%"},cn={name:"fade_5",light:"15%"},dn={name:"fade_6",light:"9%"},mn={name:"disabled_opacity",light:"var(--fade_2)"},gn=[ce,de,me,ge,ue,ve,pe,fe,xe,ke,be,we,ye,ze,Se,Ee,$e,Ie,Te,Le,Ae,De,Me,Oe,Ce,Ne,je,Pe,Ue,Fe,Ke,Ge,He,Ve,Be,Je,Re,Ye,qe,We,Qe,Xe,Ze,ta,ea,aa,oa,_a,ra,sa,na,la,ha,ia,ca,da,ma,ga,ua,va,pa,fa,xa,ka,ba,wa,ya,za,Sa,Ea,$a,Ia,Ta,La,Aa,Da,Ma,Oa,Ca,Na,ja,Pa,Ua,Fa,Ka,Ga,Ha,Va,Ba,Ja,Ra,Ya,qa,Wa,Qa,Xa,Za,to,eo,ao,oo,_o,ro,so,no,lo,ho,io,co,mo,go,uo,vo,po,fo,xo,ko,bo,wo,yo,zo,So,Eo,$o,Io,To,Lo,Ao,Do,Mo,Oo,Co,No,jo,Po,Uo,Fo,Ko,Go,Ho,Vo,Bo,Jo,Ro,Yo,qo,Wo,Qo,Xo,Zo,t_,e_,a_,o_,__,r_,s_,n_,l_,h_,i_,c_,d_,m_,g_,u_,v_,p_,f_,x_,k_,b_,w_,y_,z_,S_,E_,$_,I_,T_,L_,A_,D_,M_,O_,C_,N_,j_,P_,U_,F_,K_,G_,H_,V_,B_,J_,R_,Y_,q_,W_,Q_,X_,Z_,tr,er,ar,or,_r,rr,sr,nr,lr,hr,ir,cr,dr,mr,gr,ur,vr,pr,fr,xr,kr,br,wr,yr,zr,Sr,Er,$r,Ir,Tr,Lr,Ar,Dr,Mr,Or,Cr,Nr,jr,Pr,Ur,Fr,Kr,Gr,Hr,Vr,ot,Br,Jr,Rr,Yr,qr,Wr,Qr,Xr,Zr,rs,cs,ps,ys,ts,ss,ds,fs,zs,es,ns,ms,xs,Ss,as,ls,gs,ks,Es,os,hs,us,bs,$s,_s,is,vs,ws,Is,Ts,Ls,As,Ds,Ms,Os,Cs,Ns,js,Ps,Us,Fs,Ks,Gs,Hs,Vs,Bs,Js,Rs,Ys,qs,Ws,Qs,Xs,Zs,tn,en,an,on,_n,rn,sn,nn,ln,hn,cn,dn,mn],kt={name:"base",variables:[]},_t=[kt,{name:"low contrast",variables:[{name:"tint_saturation",light:"8%"},{name:"bg",light:"hsl(var(--tint_hue) var(--tint_saturation) 86%)",dark:"hsl(var(--tint_hue) var(--tint_saturation) 18%)"}]},{name:"high contrast",variables:[{name:"bg",light:"#fff",dark:"#000"},{name:"text_color_2",light:"hsl(var(--tint_hue) var(--tint_saturation) 8%)",dark:"hsl(var(--tint_hue) var(--tint_saturation) 90%)"},{name:"text_color_3",light:"hsl(var(--tint_hue) var(--tint_saturation) 16%)",dark:"hsl(var(--tint_hue) var(--tint_saturation) 83%)"},{name:"text_color_5",light:"hsl(var(--tint_hue) var(--tint_saturation) 24%)",dark:"hsl(var(--tint_hue) var(--tint_saturation) 75%)"}]}],bt=["light","auto","dark"],un=(e,t={})=>{const{comments:a=!1,id:r=null,empty_default_theme:v=!0,specificity:d=2}=t,s=e.name===_t[0].name?v?null:gn:e.variables;if(!(s!=null&&s.length))return"";const l=s.map(c=>ht(c)).filter(Boolean),p=s.map(c=>ht(c,!0,a)).filter(Boolean),_=(r?"#"+r:":root").repeat(d);return`${l.length?`${_} {
	${l.join(`
	`)}
}`:""}
${p.length?`${_}.dark {
	${p.join(`
	`)}
}`:""}
`.trim()},ht=(e,t=!1,a=!0)=>{const r=t?e.dark:e.light;return r?"--"+e.name+": "+r+";"+(a&&e.summary?" /* "+e.summary+" */":""):""};var U,F;class wt{constructor(t=_t[0],a="auto"){Q(this,U,J());Q(this,F,J());if(!bt.includes(a))throw Error("unknown color scheme: "+a);this.theme=t,this.color_scheme=a}get theme(){return n(P(this,U))}set theme(t){R(P(this,U),t,!0)}get color_scheme(){return n(P(this,F))}set color_scheme(t){R(P(this,F),t,!0)}toJSON(){return{theme:this.theme,color_scheme:this.color_scheme}}}U=new WeakMap,F=new WeakMap;const vn=Dt(),yt=e=>{e==="dark"||e!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches?document.documentElement.classList.add("dark"):document.documentElement.classList.remove("dark"),e==="light"?document.documentElement.classList.add("light"):document.documentElement.classList.remove("light")},rt="color-scheme",pn=(e,t=rt)=>{try{e===null?localStorage.removeItem(t):localStorage.setItem(t,e)}catch{}},fn=(e="auto",t=rt)=>{let a;try{a=localStorage.getItem(t)}catch{return e}return bt.includes(a)?a:e},zt="theme",xn=(e,t=zt)=>{try{e===null?localStorage.removeItem(t):localStorage.setItem(t,JSON.stringify(e))}catch{}},kn=(e=_t[0],t=zt)=>{try{const a=localStorage.getItem(t),r=a===null?a:JSON.parse(a);if(r)return r}catch{}return e},bn=(e="light",t=rt)=>`
	<meta name="color-scheme" content="${e==="dark"?"dark light":"light dark"}" />
	${e==="dark"?"<style nonce='%sveltekit.nonce%'>:root:root { color-scheme: dark light; }</style>":""}
	<script nonce="%sveltekit.nonce%">
		try {
			let c = localStorage.getItem('${t}');
			if (c === 'auto' || (c !== 'dark' && c !== 'light')) {
				c = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
			} else if (c === 'light') {
			 document.documentElement.classList.add('light');
			}
			if (c === 'dark') document.documentElement.classList.add('dark');
		} catch (_) {${e==="dark"?" document.documentElement.classList.add('dark'); ":""}}
	<\/script>
`,wn=e=>`<style nonce="%sveltekit.nonce%">
	${e}
</style>`,Z=(e,t=0)=>{let a=t;B(()=>{e(++a)})};var yn=$("<!> <!>",1);function zn(e,t){K(t,!0);const a=M(t,"sync_color_scheme",3,yt),r=M(t,"load_color_scheme",3,fn),v=M(t,"save_color_scheme",3,pn),d=M(t,"load_theme",3,kn),s=M(t,"save_theme",3,xn),l=M(t,"themer",19,()=>new wt(d()(t.theme_fallback),r()(t.color_scheme_fallback)));vn.set(l());const p=C(()=>l().theme.name),_=C(()=>n(p)===kt.name?null:un(l().theme)),c=C(()=>n(_)?wn(n(_)):null),f=C(()=>bn(t.color_scheme_fallback));Z(g=>{const u=l().color_scheme;g!==1&&a()(u)}),Z(g=>{const u=l().color_scheme;g!==1&&v()(u)}),Z(g=>{const u=l().theme;g!==1&&s()(u)});var x=X();ct(g=>{var u=yn(),E=I(u);{var L=k=>{var w=X(),y=I(w);lt(y,()=>n(c),!1,!1),b(k,w)};Y(E,k=>{n(c)&&k(L)})}var A=m(E,2);{var o=k=>{var w=X(),y=I(w);lt(y,()=>n(f),!1,!1),b(k,w)};Y(A,k=>{n(f)&&k(o)})}b(g,u)});var S=I(x);gt(S,()=>t.children,l,()=>n(_),()=>n(c),()=>n(f)),b(e,x),G()}const it=Kt.object({volume:Bt.default(qt),instrument:Vt.default(Yt),scale:Ht.default(Rt),key:Gt.default(Jt)});function Sn(e,t){K(t,!0);const a=ft.get();let r=J(!1);const v=async()=>{n(r)||(R(r,!0),console.log("initing audio context"),await a().resume())};tt("click",et,function(...d){var s;(s=n(r)?void 0:v)==null||s.apply(this,d)},!0),tt("keydown",et,function(...d){var s;(s=n(r)?void 0:v)==null||s.apply(this,d)},!0),G()}const En=[{slug:"/trainer"},{slug:"/piano"},{slug:"/"}];var $n=$('<li class="svelte-1f3wf2x"><a> </a></li>'),In=$('<h2 class="section_title">site map</h2> <nav><ul class="unstyled svelte-1f3wf2x"></ul></nav>',1);function Tn(e,t){K(t,!0);const[a,r]=dt(),v=()=>mt(vt,"$page",a),d=C(()=>Ct(v().url.pathname,at));var s=In(),l=m(I(s),2),p=i(l);Mt(p,21,()=>En,_=>_.slug,(_,c)=>{var f=$n(),x=i(f);let S;var g=i(x,!0);h(x),h(f),Tt(u=>{S=Ot(x,1,"panel svelte-1f3wf2x",null,S,u),ut(x,"href",`${at??""}${n(c).slug??""}`),$t(g,n(c).slug)},[()=>({selected:n(c).slug===n(d)})]),b(_,f)}),h(p),h(l),b(e,s),G(),r()}var Ln=(e,t)=>R(t,!n(t)),An=()=>{localStorage.clear(),location.reload()},Dn=$('<div><button type="button" class="w_100 color_c color_c_5"><div class="size_xl3">✕</div> <div class="ml_lg text_align_left">permanently delete<br>all locally saved data</div></button></div>'),Mn=$(`<div class="pane shadow_d_xl width_sm"><section><div class="section_title box"><!> <h1 class="mb_md">earbetter</h1> <div><!></div></div> <div class="section_body"><p>Earbetter is an <a href="https://wikipedia.org/wiki/Ear_training">ear trainer</a>. The
				website also has some other music tools like <a>a virtual piano</a>. More planned, stay tuned.</p> <p>It's made with Svelte and TypeScript. <a href="https://github.com/ryanatkn/earbetter">The code</a> is open source and permissively licensed.</p> <p>Press <code>Escape</code> to toggle this menu.</p></div></section> <section><h2 class="section_title">settings</h2> <form class="section_body"><div class="mb_lg"><!></div> <!> <aside>Earbetter supports MIDI devices like piano keyboards, connect and click:</aside> <!></form></section> <section><!></section> <section><h2 class="section_title">data</h2> <div class="section_body"><p>Data is saved locally on your computer using <a href="https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage"><code>localStorage</code></a>.</p> <button type="button" class="w_100">clear saved data</button> <!></div></section> <section><h2 class="section_title">privacy</h2> <p class="section_body">This website collects no data - the only server it talks to is <a href="https://pages.github.com/">GitHub Pages</a> to serve static files, and I don't use a DNS proxy. See <a href="https://github.com/ryanatkn/earbetter">the source code</a> for more.</p></section> <div class="section_title mb_0"><!></div></div>`);function On(e,t){K(t,!0);const a=xt.get(),r=pt.get();he(()=>r.opened&&r.close());let v=J(!1);var d=Mn(),s=i(d),l=i(s),p=i(l);jt(p,{data:Pt,size:"var(--icon_size_xl2)"});var _=m(p,4);Nt(_,"",{},{"--size":"var(--size_xl)"});var c=i(_);Ut(c,{hide_main_menu_button:!0}),h(_),h(l);var f=m(l,2),x=i(f),S=m(i(x),3);ut(S,"href",`${at??""}/piano`),nt(),h(x),nt(4),h(f),h(s);var g=m(s,2),u=m(i(g),2),E=i(u),L=i(E);re(L,{get volume(){return a.volume},set volume(z){a.volume=z}}),h(E);var A=m(E,2);se(A,{get instrument(){return a.instrument},set instrument(z){a.instrument=z}});var o=m(A,4);ne(o,{midi_state:a}),h(u),h(g);var k=m(g,2),w=i(k);Tn(w,{}),h(k);var y=m(k,2),H=m(i(y),2),V=m(i(H),2);V.__click=[Ln,v];var N=m(V,2);{var q=z=>{var D=Dn(),St=i(D);St.__click=[An],h(D),Wt(3,D,()=>Qt),b(z,D)};Y(N,z=>{n(v)&&z(q)})}h(H),h(y);var W=m(y,4),j=i(W);Ft(j,{hide_main_menu_button:!0}),h(W),h(d),b(e,d),G()}It(["click"]);var Cn=$('<div class="box width_md mx_auto"><div class="pane"><!></div></div>'),Nn=$("<!> <!>",1),jn=$("<!> <!>",1);function qn(e,t){K(t,!0);const[a,r]=dt(),v=()=>mt(vt,"$page",a),d=new wt(void 0,"dark");yt(d.color_scheme);const s="site",l=Xt(s,()=>it.parse({}),it.parse);console.log("initial_site_data",l);const p=ft.set(),_=xt.set(new Zt(p,l));window.app=_;const c=pt.set(),f=C(()=>{const o=ee.safeParse(ae(v().url.hash));return o.success?o.data:null});B(()=>{const o=n(f);Lt(()=>_.set_active_level_data((o==null?void 0:o.level)??null))});const x=()=>({volume:_.volume,instrument:_.instrument,scale:_.scale,key:_.key});let S=!1;B(()=>{const o=x();S?te(s,o):S=!0});let g=!1;B(()=>{const o=_.toJSON();g?_.save(o):g=!0});const u=o=>{if(!(oe(o.target)||o.ctrlKey||o.shiftKey||o.altKey||o.metaKey))switch(o.key){case"c":{O(o),le(_);return}case"1":{O(o),_.instrument="sawtooth";return}case"2":{O(o),_.instrument="sine";return}case"3":{O(o),_.instrument="square";return}case"4":{O(o),_.instrument="triangle";return}case"Escape":{if(!c.opened&&document.getElementsByClassName("dialog").length)return;O(o),c.toggle();return}}};var E=jn();ct(o=>{At.title="Earbetter"}),tt("keydown",et,u);var L=I(E);Sn(L,{});var A=m(L,2);zn(A,{themer:d,get color_scheme_fallback(){return d.color_scheme},children:(o,k)=>{var w=Nn(),y=I(w);gt(y,()=>t.children);var H=m(y,2);{var V=N=>{_e(N,{onclose:()=>c.close(),children:(q,W)=>{var j=Cn(),z=i(j),D=i(z);On(D,{}),h(z),h(j),b(q,j)},$$slots:{default:!0}})};Y(H,N=>{c.opened&&N(V)})}b(o,w)},$$slots:{default:!0}}),b(e,E),G(),r()}export{qn as component,Yn as universal};
