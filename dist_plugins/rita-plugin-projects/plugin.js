(function(r){"use strict";var D={exports:{}},w={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var O=r,W=Symbol.for("react.element"),H=Symbol.for("react.fragment"),B=Object.prototype.hasOwnProperty,K=O.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,V={key:!0,ref:!0,__self:!0,__source:!0};function R(n,s,i){var a,d={},o=null,p=null;i!==void 0&&(o=""+i),s.key!==void 0&&(o=""+s.key),s.ref!==void 0&&(p=s.ref);for(a in s)B.call(s,a)&&!V.hasOwnProperty(a)&&(d[a]=s[a]);if(n&&n.defaultProps)for(a in s=n.defaultProps,s)d[a]===void 0&&(d[a]=s[a]);return{$$typeof:W,type:n,key:o,ref:p,props:d,_owner:K.current}}w.Fragment=H,w.jsx=R,w.jsxs=R,D.exports=w;var e=D.exports;/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=(...n)=>n.filter((s,i,a)=>!!s&&s.trim()!==""&&a.indexOf(s)===i).join(" ").trim();/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const F=n=>n.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const X=n=>n.replace(/^([A-Z])|[\s-_]+(\w)/g,(s,i,a)=>a?a.toUpperCase():i.toLowerCase());/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=n=>{const s=X(n);return s.charAt(0).toUpperCase()+s.slice(1)};/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var T={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Z=n=>{for(const s in n)if(s.startsWith("aria-")||s==="role"||s==="title")return!0;return!1},J=r.createContext({}),Y=()=>r.useContext(J),G=r.forwardRef(({color:n,size:s,strokeWidth:i,absoluteStrokeWidth:a,className:d="",children:o,iconNode:p,...l},u)=>{const{size:x=24,strokeWidth:m=2,absoluteStrokeWidth:y=!1,color:j="currentColor",className:k=""}=Y()??{},g=a??y?Number(i??m)*24/Number(s??x):i??m;return r.createElement("svg",{ref:u,...T,width:s??x??T.width,height:s??x??T.height,stroke:n??j,strokeWidth:g,className:M("lucide",k,d),...!o&&!Z(l)&&{"aria-hidden":"true"},...l},[...p.map(([c,h])=>r.createElement(c,h)),...Array.isArray(o)?o:[o]])});/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=(n,s)=>{const i=r.forwardRef(({className:a,...d},o)=>r.createElement(G,{ref:o,iconNode:s,className:M(`lucide-${F(I(n))}`,`lucide-${n}`,a),...d}));return i.displayName=I(n),i};/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q=f("arrow-left",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U=f("clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 6v6l4 2",key:"mmk7yg"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const q=f("plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=f("square-check-big",[["path",{d:"M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344",key:"2acyp4"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=f("square-pen",[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",key:"ohrbg2"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ee=f("trash-2",[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const te=f("user",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const se=f("x",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]),z=r.createContext(null),ne=()=>r.useContext(z),oe=({children:n})=>{const[s,i]=r.useState([]),a=(o,p="info",l=3e3)=>{const u=Date.now();i(x=>[...x,{id:u,message:o,type:p}]),l>0&&setTimeout(()=>{i(x=>x.filter(m=>m.id!==u))},l)},d=o=>{i(p=>p.filter(l=>l.id!==o))};return e.jsxs(z.Provider,{value:{showToast:a},children:[n,e.jsx("div",{style:{position:"fixed",bottom:"20px",right:"20px",zIndex:9999,display:"flex",flexDirection:"column",gap:"10px"},children:s.map(o=>e.jsxs("div",{style:{background:o.type==="error"?"var(--danger)":o.type==="success"?"var(--success)":"var(--primary)",color:"#fff",padding:"12px 20px",borderRadius:"8px",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",display:"flex",justifyContent:"space-between",alignItems:"center",minWidth:"250px",animation:"slideIn 0.3s ease-out"},children:[e.jsx("span",{children:o.message}),e.jsx("button",{onClick:()=>d(o.id),style:{background:"transparent",border:"none",color:"#fff",cursor:"pointer",fontSize:"1.2rem",marginLeft:"10px"},children:"×"})]},o.id))}),e.jsx("style",{children:`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `})]})};function ae({currentUser:n,selectedProjectId:s,setPage:i,setSelectedProjectId:a}){const[d,o]=r.useState([]),[p,l]=r.useState([]),[u,x]=r.useState([]),[m,y]=r.useState(!1),[j,k]=r.useState(null),{showToast:g}=ne(),[c,h]=r.useState({projectId:s||"",title:"",description:"",status:"To Do",priority:"Medium",assignedTo:(n==null?void 0:n.id)||"",dueDate:""}),C=async()=>{if(!window.api)return;const t=await window.api.getTasks(),v=await window.api.getProjects(),N=await window.api.getUsers();o(t||[]),x(v||[]),l(N||[])};r.useEffect(()=>{C()},[s]);const E=(t=null)=>{t?(k(t),h({projectId:t.projectId,title:t.title,description:t.description,status:t.status,priority:t.priority,assignedTo:t.assignedTo,dueDate:t.dueDate})):(k(null),h({projectId:s||(u.length>0?u[0].id:""),title:"",description:"",status:"To Do",priority:"Medium",assignedTo:(n==null?void 0:n.id)||"",dueDate:new Date().toISOString().split("T")[0]})),y(!0)},ce=async t=>{if(t.preventDefault(),!c.projectId){g("A task must belong to a project.","error");return}j?(await window.api.updateTask({...c,id:j.id}),g("Task updated successfully","success")):(await window.api.addTask(c),g("New task created!","success")),y(!1),C()},de=async t=>{confirm("Are you sure you want to delete this task?")&&(await window.api.deleteTask(t),g("Task deleted","success"),C())},pe=async t=>{const v=t.status==="Completed"?"To Do":"Completed";await window.api.updateTask({...t,status:v}),C()},P=d.filter(t=>s?t.projectId===s:(n==null?void 0:n.role)==="admin"?!0:t.assignedTo===(n==null?void 0:n.id)),A=s?u.find(t=>t.id===s):null;return e.jsxs("div",{className:"card",children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"},children:[e.jsxs("h2",{style:{margin:0,display:"flex",alignItems:"center",gap:"8px"},children:[s&&e.jsxs("button",{className:"btn-sm",onClick:()=>{a(null),i("projects")},style:{marginRight:"10px"},children:[e.jsx(Q,{size:16})," Back"]}),e.jsx(L,{size:24,className:"text-primary"}),A?`Tasks for ${A.name}`:"My Task List"]}),e.jsxs("button",{className:"btn-primary",onClick:()=>E(),style:{display:"flex",alignItems:"center",gap:"6px"},children:[e.jsx(q,{size:18})," New Task"]})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"10px"},children:[P.map(t=>{const v=u.find(S=>S.id===t.projectId),N=p.find(S=>S.id===t.assignedTo),b=t.status==="Completed";return e.jsxs("div",{style:{display:"flex",alignItems:"center",background:"var(--bg-secondary)",padding:"15px",borderRadius:"8px",borderLeft:b?"4px solid var(--success)":t.priority==="High"?"4px solid var(--danger)":"4px solid var(--primary)",opacity:b?.6:1},children:[e.jsx("div",{style:{marginRight:"15px",cursor:"pointer"},onClick:()=>pe(t),children:b?e.jsx(L,{size:24,style:{color:"var(--success)"}}):e.jsx("div",{style:{width:"24px",height:"24px",border:"2px solid var(--text-secondary)",borderRadius:"4px"}})}),e.jsxs("div",{style:{flex:1},children:[e.jsx("div",{style:{fontWeight:"bold",fontSize:"1.1rem",textDecoration:b?"line-through":"none"},children:t.title}),!s&&v&&e.jsx("div",{style:{fontSize:"0.85rem",color:"var(--primary)",fontWeight:"bold"},children:v.name}),t.description&&e.jsx("div",{style:{fontSize:"0.9rem",color:"var(--text-secondary)",marginTop:"4px"},children:t.description})]}),e.jsxs("div",{style:{display:"flex",gap:"20px",alignItems:"center",marginRight:"15px",color:"var(--text-secondary)",fontSize:"0.85rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"4px"},children:[e.jsx(te,{size:14})," ",N?N.username:"Unassigned"]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"4px",color:t.dueDate&&t.dueDate<new Date().toISOString().split("T")[0]&&!b?"var(--danger)":"inherit"},children:[e.jsx(U,{size:14})," ",t.dueDate||"No due date"]}),e.jsx("div",{children:e.jsx("span",{className:"badge",style:{background:"var(--bg-card)"},children:t.priority})})]}),e.jsxs("div",{style:{display:"flex",gap:"5px"},children:[e.jsx("button",{className:"btn-sm",onClick:()=>E(t),children:e.jsx($,{size:16})}),e.jsx("button",{className:"btn-sm btn-danger",onClick:()=>de(t.id),children:e.jsx(ee,{size:16})})]})]},t.id)}),P.length===0&&e.jsx("div",{style:{textAlign:"center",padding:"40px",color:"var(--text-secondary)"},children:"No tasks found. Take a coffee break! ☕"})]}),m&&e.jsx("div",{className:"modal-overlay",children:e.jsxs("div",{className:"modal",children:[e.jsx("h2",{children:j?"Edit Task":"New Task"}),e.jsxs("form",{onSubmit:ce,children:[!s&&e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Project"}),e.jsxs("select",{required:!0,value:c.projectId,onChange:t=>h({...c,projectId:t.target.value}),children:[e.jsx("option",{value:"",children:"Select Project..."}),u.map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Task Title"}),e.jsx("input",{required:!0,type:"text",value:c.title,onChange:t=>h({...c,title:t.target.value})})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Description"}),e.jsx("textarea",{rows:2,value:c.description,onChange:t=>h({...c,description:t.target.value})})]}),e.jsxs("div",{style:{display:"flex",gap:"15px"},children:[e.jsxs("div",{className:"form-group",style:{flex:1},children:[e.jsx("label",{children:"Assignee"}),e.jsxs("select",{value:c.assignedTo,onChange:t=>h({...c,assignedTo:t.target.value}),children:[e.jsx("option",{value:"",children:"Unassigned"}),p.map(t=>e.jsx("option",{value:t.id,children:t.username},t.id))]})]}),e.jsxs("div",{className:"form-group",style:{flex:1},children:[e.jsx("label",{children:"Due Date"}),e.jsx("input",{type:"date",value:c.dueDate,onChange:t=>h({...c,dueDate:t.target.value})})]})]}),e.jsxs("div",{style:{display:"flex",gap:"15px"},children:[e.jsxs("div",{className:"form-group",style:{flex:1},children:[e.jsx("label",{children:"Priority"}),e.jsxs("select",{value:c.priority,onChange:t=>h({...c,priority:t.target.value}),children:[e.jsx("option",{value:"Low",children:"Low"}),e.jsx("option",{value:"Medium",children:"Medium"}),e.jsx("option",{value:"High",children:"High"})]})]}),e.jsxs("div",{className:"form-group",style:{flex:1},children:[e.jsx("label",{children:"Status"}),e.jsxs("select",{value:c.status,onChange:t=>h({...c,status:t.target.value}),children:[e.jsx("option",{value:"To Do",children:"To Do"}),e.jsx("option",{value:"In Progress",children:"In Progress"}),e.jsx("option",{value:"Completed",children:"Completed"})]})]})]}),e.jsxs("div",{className:"form-actions",children:[e.jsx("button",{type:"button",className:"btn-secondary",onClick:()=>y(!1),children:"Cancel"}),e.jsx("button",{type:"submit",className:"btn-primary",children:"Save Task"})]})]})]})})]})}function _({variant:n="secondary",size:s="md",icon:i,children:a,className:d="",...o}){return e.jsxs("button",{className:`ui-btn ui-btn-${n} ui-btn-${s} ${d}`.trim(),...o,children:[i&&e.jsx("span",{className:"ui-btn-icon",children:i}),a&&e.jsx("span",{className:"ui-btn-label",children:a})]})}function ie({title:n,children:s,onClose:i,isOpen:a,size:d="md"}){const o=r.useRef(null);return r.useEffect(()=>{const p=l=>{if(l.key==="Escape"&&a&&i(),l.key==="Tab"&&o.current){const u=Array.from(o.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(y=>!y.disabled);if(u.length===0)return;const x=u[0],m=u[u.length-1];l.shiftKey&&document.activeElement===x?(l.preventDefault(),m.focus()):!l.shiftKey&&document.activeElement===m&&(l.preventDefault(),x.focus())}};return a&&(window.addEventListener("keydown",p),document.body.classList.add("modal-open"),setTimeout(()=>{if(!o.current)return;const l=o.current.querySelector("input, textarea, select, button");l&&l.focus()},50)),()=>{window.removeEventListener("keydown",p),document.body.classList.remove("modal-open")}},[a,i]),a?e.jsx("div",{className:"modal-overlay",onClick:i,children:e.jsxs("div",{className:"modal-content modal-"+d,onClick:p=>p.stopPropagation(),ref:o,role:"dialog","aria-modal":"true","aria-label":n,children:[e.jsxs("div",{className:"modal-header",children:[e.jsx("h2",{children:n}),e.jsx(_,{variant:"ghost",size:"sm",icon:e.jsx(se,{size:18}),onClick:i,"aria-label":"Close"})]}),s]})}):null}const re=r.createContext(null),le=({children:n})=>{const[s,i]=r.useState(!1),[a,d]=r.useState(""),o=r.useRef(null),p=r.useCallback(x=>new Promise(m=>{d(x),i(!0),o.current=m}),[]),l=()=>{o.current&&o.current(!0),i(!1)},u=()=>{o.current&&o.current(!1),i(!1)};return e.jsxs(re.Provider,{value:{askConfirm:p},children:[n,e.jsxs(ie,{title:"Confirmation",isOpen:s,onClose:u,children:[e.jsx("p",{className:"confirm-message",children:a}),e.jsxs("div",{className:"modal-actions",children:[e.jsx(_,{variant:"secondary",onClick:u,children:"Cancel"}),e.jsx(_,{variant:"danger",onClick:l,children:"Confirm"})]})]})]})};window.RitaPlugin={mount:(n,s)=>{const a=window.ReactDOM.createRoot(n);a.render(e.jsx(oe,{children:e.jsx(le,{children:e.jsx(ae,{...s.appProps})})})),window.RitaPlugin._root=a},unmount:()=>{const n=window.RitaPlugin._root;n&&n.unmount()}}})(React);
