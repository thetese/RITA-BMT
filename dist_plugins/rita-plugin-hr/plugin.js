(function(i){"use strict";var B={exports:{}},R={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var ce=i,de=Symbol.for("react.element"),me=Symbol.for("react.fragment"),ue=Object.prototype.hasOwnProperty,pe=ce.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,he={key:!0,ref:!0,__self:!0,__source:!0};function Q(t,n,l){var r,u={},a=null,m=null;l!==void 0&&(a=""+l),n.key!==void 0&&(a=""+n.key),n.ref!==void 0&&(m=n.ref);for(r in n)ue.call(n,r)&&!he.hasOwnProperty(r)&&(u[r]=n[r]);if(t&&t.defaultProps)for(r in n=t.defaultProps,n)u[r]===void 0&&(u[r]=n[r]);return{$$typeof:de,type:t,key:a,ref:m,props:u,_owner:pe.current}}R.Fragment=me,R.jsx=Q,R.jsxs=Q,B.exports=R;var e=B.exports;const Y=i.createContext(null),xe=()=>i.useContext(Y),fe=({children:t})=>{const[n,l]=i.useState([]),r=(a,m="info",d=3e3)=>{const p=Date.now();l(h=>[...h,{id:p,message:a,type:m}]),d>0&&setTimeout(()=>{l(h=>h.filter(f=>f.id!==p))},d)},u=a=>{l(m=>m.filter(d=>d.id!==a))};return e.jsxs(Y.Provider,{value:{showToast:r},children:[t,e.jsx("div",{style:{position:"fixed",bottom:"20px",right:"20px",zIndex:9999,display:"flex",flexDirection:"column",gap:"10px"},children:n.map(a=>e.jsxs("div",{style:{background:a.type==="error"?"var(--danger)":a.type==="success"?"var(--success)":"var(--primary)",color:"#fff",padding:"12px 20px",borderRadius:"8px",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",display:"flex",justifyContent:"space-between",alignItems:"center",minWidth:"250px",animation:"slideIn 0.3s ease-out"},children:[e.jsx("span",{children:a.message}),e.jsx("button",{onClick:()=>u(a.id),style:{background:"transparent",border:"none",color:"#fff",cursor:"pointer",fontSize:"1.2rem",marginLeft:"10px"},children:"×"})]},a.id))}),e.jsx("style",{children:`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `})]})};/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U=(...t)=>t.filter((n,l,r)=>!!n&&n.trim()!==""&&r.indexOf(n)===l).join(" ").trim();/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ye=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ge=t=>t.replace(/^([A-Z])|[\s-_]+(\w)/g,(n,l,r)=>r?r.toUpperCase():l.toLowerCase());/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const K=t=>{const n=ge(t);return n.charAt(0).toUpperCase()+n.slice(1)};/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var E={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const be=t=>{for(const n in t)if(n.startsWith("aria-")||n==="role"||n==="title")return!0;return!1},je=i.createContext({}),ve=()=>i.useContext(je),we=i.forwardRef(({color:t,size:n,strokeWidth:l,absoluteStrokeWidth:r,className:u="",children:a,iconNode:m,...d},p)=>{const{size:h=24,strokeWidth:f=2,absoluteStrokeWidth:j=!1,color:v="currentColor",className:w=""}=ve()??{},k=r??j?Number(l??f)*24/Number(n??h):l??f;return i.createElement("svg",{ref:p,...E,width:n??h??E.width,height:n??h??E.height,stroke:t??v,strokeWidth:k,className:U("lucide",w,u),...!a&&!be(d)&&{"aria-hidden":"true"},...d},[...m.map(([O,D])=>i.createElement(O,D)),...Array.isArray(a)?a:[a]])});/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=(t,n)=>{const l=i.forwardRef(({className:r,...u},a)=>i.createElement(we,{ref:a,iconNode:n,className:U(`lucide-${ye(K(t))}`,`lucide-${t}`,r),...u}));return l.displayName=K(t),l};/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ke=y("circle-check-big",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const V=y("clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 6v6l4 2",key:"mmk7yg"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ce=y("dollar-sign",[["line",{x1:"12",x2:"12",y1:"2",y2:"22",key:"7eqyqh"}],["path",{d:"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",key:"1b0p4s"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ne=y("log-out",[["path",{d:"m16 17 5-5-5-5",key:"1bji2h"}],["path",{d:"M21 12H9",key:"dn1m92"}],["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Re=y("pen",[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Se=y("plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _e=y("refresh-cw",[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ie=y("shield",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Te=y("trash-2",[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ae=y("users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["path",{d:"M16 3.128a4 4 0 0 1 0 7.744",key:"16gr8j"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const X=y("x",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);function M({variant:t="secondary",size:n="md",icon:l,children:r,className:u="",...a}){return e.jsxs("button",{className:`ui-btn ui-btn-${t} ui-btn-${n} ${u}`.trim(),...a,children:[l&&e.jsx("span",{className:"ui-btn-icon",children:l}),r&&e.jsx("span",{className:"ui-btn-label",children:r})]})}function Ee({title:t,children:n,onClose:l,isOpen:r,size:u="md"}){const a=i.useRef(null);return i.useEffect(()=>{const m=d=>{if(d.key==="Escape"&&r&&l(),d.key==="Tab"&&a.current){const p=Array.from(a.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(j=>!j.disabled);if(p.length===0)return;const h=p[0],f=p[p.length-1];d.shiftKey&&document.activeElement===h?(d.preventDefault(),f.focus()):!d.shiftKey&&document.activeElement===f&&(d.preventDefault(),h.focus())}};return r&&(window.addEventListener("keydown",m),document.body.classList.add("modal-open"),setTimeout(()=>{if(!a.current)return;const d=a.current.querySelector("input, textarea, select, button");d&&d.focus()},50)),()=>{window.removeEventListener("keydown",m),document.body.classList.remove("modal-open")}},[r,l]),r?e.jsx("div",{className:"modal-overlay",onClick:l,children:e.jsxs("div",{className:"modal-content modal-"+u,onClick:m=>m.stopPropagation(),ref:a,role:"dialog","aria-modal":"true","aria-label":t,children:[e.jsxs("div",{className:"modal-header",children:[e.jsx("h2",{children:t}),e.jsx(M,{variant:"ghost",size:"sm",icon:e.jsx(X,{size:18}),onClick:l,"aria-label":"Close"})]}),n]})}):null}const Z=i.createContext(null),Me=({children:t})=>{const[n,l]=i.useState(!1),[r,u]=i.useState(""),a=i.useRef(null),m=i.useCallback(h=>new Promise(f=>{u(h),l(!0),a.current=f}),[]),d=()=>{a.current&&a.current(!0),l(!1)},p=()=>{a.current&&a.current(!1),l(!1)};return e.jsxs(Z.Provider,{value:{askConfirm:m},children:[t,e.jsxs(Ee,{title:"Confirmation",isOpen:n,onClose:p,children:[e.jsx("p",{className:"confirm-message",children:r}),e.jsxs("div",{className:"modal-actions",children:[e.jsx(M,{variant:"secondary",onClick:p,children:"Cancel"}),e.jsx(M,{variant:"danger",onClick:d,children:"Confirm"})]})]})]})},Le=()=>{const t=i.useContext(Z);if(!t)throw new Error("useConfirm must be used within ConfirmProvider");return t},L={username:"",password:"",role:"Staff",pin:"",securityQuestion:"",securityAnswer:"",hourlyRate:0,commissionRate:0},Oe={id:"",userId:"",clockIn:"",clockOut:"",hourlyRate:0};function De({currentUser:t}){const{showToast:n}=xe(),{askConfirm:l}=Le(),[r,u]=i.useState([]),[a,m]=i.useState(L),[d,p]=i.useState(null),[h,f]=i.useState("users"),[j,v]=i.useState(null),[w,k]=i.useState(""),[O,D]=i.useState([]),[g,S]=i.useState(Oe),[Pe,C]=i.useState(!1),[_,J]=i.useState(!1),[G,q]=i.useState(!1),[P,$]=i.useState("ALL"),[F,ee]=i.useState(""),[z,se]=i.useState(""),Fe=async()=>{if(!window.api)return;const s=await window.api.getUsers();u(s)},N=async()=>{if(window.api){q(!0);try{const s=await window.api.getTimecards();D(s)}catch(s){console.error("Failed to load timecards:",s),n("Error loading timecards: "+s.message,"error")}finally{q(!1)}}},I=async()=>{await Fe(),await N()};i.useEffect(()=>{I()},[]);const b=s=>{const{name:o,value:c}=s.target;m(x=>({...x,[o]:c}))},ze=async s=>{s.preventDefault();try{if(d){const o=r.find(x=>x.id===d),c=await window.api.getUserByUsername(o.username);await window.api.updateUser({...c,username:a.username,role:a.role,pin:a.pin,securityQuestion:a.securityQuestion,securityAnswer:a.securityAnswer||c.securityAnswer,hourlyRate:parseFloat(a.hourlyRate)||0,commissionRate:parseFloat(a.commissionRate)||0},t==null?void 0:t.id)}else{if(a.password.length<4){n("Password too short","error");return}await window.api.addUser({username:a.username,passwordHash:a.password,role:a.role,pin:a.pin,securityQuestion:a.securityQuestion,securityAnswer:a.securityAnswer,hourlyRate:parseFloat(a.hourlyRate)||0,commissionRate:parseFloat(a.commissionRate)||0},t==null?void 0:t.id)}m(L),p(null),I(),n(d?"User updated successfully":"User added successfully","success")}catch(o){n("Error saving user: "+o.message,"error"),console.error(o)}},We=async s=>{const o=await window.api.getUserByUsername(s.username);m({username:o.username,password:"",role:o.role,pin:o.pin||"",securityQuestion:o.securityQuestion||"",securityAnswer:"",hourlyRate:o.hourlyRate||0,commissionRate:o.commissionRate||0}),p(o.id),v(null)},He=async(s,o)=>{if(s===t.id){n("You cannot delete your own account.","error");return}await l(`Delete user ${o}?`)&&(await window.api.deleteUser(s,t==null?void 0:t.id),I())},Be=async(s,o)=>{if(s.preventDefault(),w.length<4){n("Password too short.","error");return}try{const c=await window.api.getUserByUsername(o.username);await window.api.updateUser({...c,passwordHash:w},t==null?void 0:t.id),n(`Password for ${o.username} has been reset.`,"success"),v(null),k(""),I()}catch(c){n("Error resetting password: "+c.message,"error")}},W=s=>{if(!s)return"";const o=new Date(s),c=x=>String(x).padStart(2,"0");return`${o.getFullYear()}-${c(o.getMonth()+1)}-${c(o.getDate())}T${c(o.getHours())}:${c(o.getMinutes())}`},te=s=>s?new Date(s).toISOString():null,Qe=s=>{const o=s.target.value,c=r.find(x=>x.id===o);S(x=>({...x,userId:o,hourlyRate:c&&c.hourlyRate||0}))},H=s=>{const{name:o,value:c}=s.target;S(x=>({...x,[o]:c}))},Ye=()=>{const s=r[0];S({id:"",userId:s?s.id:"",clockIn:W(new Date().toISOString()),clockOut:"",hourlyRate:s&&s.hourlyRate||0}),J(!1),C(!0)},Ue=s=>{S({id:s.id,userId:s.userId,clockIn:W(s.clockIn),clockOut:W(s.clockOut),hourlyRate:s.hourlyRate||0}),J(!0),C(!0)},Ke=async s=>{if(s.preventDefault(),!g.userId){n("Please select an employee","error");return}if(!g.clockIn){n("Please select a clock-in time","error");return}const o={id:g.id,userId:g.userId,clockIn:te(g.clockIn),clockOut:te(g.clockOut),hourlyRate:parseFloat(g.hourlyRate)||0,storeId:"general"};try{_?(await window.api.updateTimecard(o,t==null?void 0:t.id),n("Timecard updated successfully","success")):(await window.api.addTimecard(o,t==null?void 0:t.id),n("Timecard added successfully","success")),C(!1),N()}catch(c){n("Failed to save timecard: "+c.message,"error")}},Ve=async s=>{if(await l("Are you sure you want to delete this timecard record? This action cannot be undone."))try{await window.api.deleteTimecard(s,t==null?void 0:t.id),n("Timecard deleted successfully","success"),N()}catch(o){n("Failed to delete timecard: "+o.message,"error")}},Xe=async s=>{if(await l("Force clock out for employee?"))try{await window.api.clockOut(s.id),n("Employee clocked out successfully","success"),N()}catch(o){n("Failed to clock out: "+o.message,"error")}},ae={};r.forEach(s=>{ae[s.id]=s.username});const T=O.filter(s=>{const o=P==="ALL"||s.userId===P,c=s.clockIn.substring(0,10),x=!F||c>=F,A=!z||c<=z;return o&&x&&A});let ne=0,oe=0,re=0;return T.forEach(s=>{if(s.clockOut){const o=(new Date(s.clockOut)-new Date(s.clockIn))/36e5;o>0&&(ne+=o,oe+=o*(s.hourlyRate||0))}else re++}),e.jsxs("div",{className:"management-page",style:{padding:"20px"},children:[e.jsx("style",{children:`
        .nav-tabs {
          display: flex;
          border-bottom: 2px solid var(--border-color, #e2e8f0);
          margin-bottom: 25px;
          gap: 15px;
        }
        .nav-tab-btn {
          background: transparent;
          border: none;
          padding: 12px 20px;
          font-weight: 600;
          font-size: 1rem;
          color: var(--text-secondary, #64748b);
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .nav-tab-btn:hover {
          color: var(--primary-color, #db2777);
        }
        .nav-tab-btn.active {
          color: var(--primary-color, #db2777);
          border-bottom-color: var(--primary-color, #db2777);
        }
        
        /* Stats Dashboard Cards */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 25px;
        }
        .stat-card {
          background: var(--card-bg, #ffffff);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        }
        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
        }
        .stat-info h3 {
          font-size: 0.85rem;
          color: var(--text-secondary, #64748b);
          margin: 0 0 5px 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .stat-info p {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary, #0f172a);
        }

        /* Filter bar */
        .filters-bar {
          background: var(--bg-secondary, #f8fafc);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 10px;
          padding: 15px 20px;
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          align-items: flex-end;
          margin-bottom: 25px;
        }
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 150px;
        }
        .filter-group label {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary, #64748b);
        }
        .filter-group select, .filter-group input {
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid var(--border-color, #e2e8f0);
          background: var(--bg-primary, #ffffff);
          color: var(--text-primary, #0f172a);
          font-size: 0.9rem;
          outline: none;
        }
        .filter-actions {
          display: flex;
          gap: 10px;
          margin-left: auto;
        }

        /* Modal Overlay & Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
          animation: fadeIn 0.2s ease-out;
        }
        .modal-box {
          background: var(--bg-primary, #ffffff);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 16px;
          width: 90%;
          max-width: 480px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }
        .modal-header {
          padding: 18px 24px;
          border-bottom: 1px solid var(--border-color, #e2e8f0);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--bg-secondary, #f8fafc);
        }
        .modal-header h3 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--text-primary, #0f172a);
        }
        .close-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary, #64748b);
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .close-btn:hover {
          background: var(--border-color, #e2e8f0);
          color: var(--text-primary, #0f172a);
        }
        .modal-body {
          padding: 24px;
        }
        
        .badge-active {
          background-color: #dcfce7;
          color: #15803d;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}),e.jsxs("h1",{style:{display:"flex",alignItems:"center",gap:"10px",marginBottom:"20px"},children:[e.jsx(Ie,{size:28})," Users & Access Settings"]}),e.jsxs("div",{className:"nav-tabs",children:[e.jsxs("button",{className:`nav-tab-btn ${h==="users"?"active":""}`,onClick:()=>f("users"),children:[e.jsx(Ae,{size:18})," User Accounts"]}),e.jsxs("button",{className:`nav-tab-btn ${h==="timecards"?"active":""}`,onClick:()=>f("timecards"),children:[e.jsx(V,{size:18})," Timecard & Attendance Manager"]})]}),h==="users"&&e.jsxs("div",{className:"management-page",style:{padding:0},children:[e.jsxs("div",{className:"sales-form",children:[e.jsx("h2",{children:d?"Edit User":"Add New User"}),e.jsxs("form",{onSubmit:ze,children:[e.jsxs("div",{className:"form-row",children:[e.jsx("label",{children:"Username *"}),e.jsx("input",{name:"username",value:a.username,onChange:b,required:!0,disabled:d&&t.username===a.username})]}),!d&&e.jsxs("div",{className:"form-row",children:[e.jsx("label",{children:"Initial Password *"}),e.jsx("input",{name:"password",type:"password",value:a.password,onChange:b,required:!0})]}),e.jsxs("div",{className:"form-row",children:[e.jsx("label",{children:"Role *"}),e.jsxs("select",{name:"role",value:a.role,onChange:b,required:!0,disabled:d&&t.username===a.username,children:[e.jsx("option",{value:"Admin",children:"Admin"}),e.jsx("option",{value:"Staff",children:"Staff"}),e.jsx("option",{value:"Sales",children:"Sales"}),e.jsx("option",{value:"Worker",children:"Worker"})]})]}),e.jsxs("div",{className:"form-row",children:[e.jsx("label",{children:"Security Question (Optional)"}),e.jsx("input",{name:"securityQuestion",value:a.securityQuestion,onChange:b,placeholder:"e.g. Favorite color?"})]}),e.jsxs("div",{className:"form-row",children:[e.jsx("label",{children:"POS Cashier PIN (Optional 4-digits)"}),e.jsx("input",{name:"pin",type:"text",maxLength:"4",value:a.pin||"",onChange:b,placeholder:"e.g. 1234"})]}),e.jsxs("div",{className:"form-row",children:[e.jsx("label",{children:"Security Answer (Leave blank to keep existing)"}),e.jsx("input",{name:"securityAnswer",type:"password",value:a.securityAnswer,onChange:b})]}),e.jsxs("div",{className:"form-row",children:[e.jsx("label",{children:"Hourly Rate (FRW)"}),e.jsx("input",{name:"hourlyRate",type:"number",min:"0",step:"any",value:a.hourlyRate||0,onChange:b})]}),e.jsxs("div",{className:"form-row",children:[e.jsx("label",{children:"Commission Rate (%)"}),e.jsx("input",{name:"commissionRate",type:"number",min:"0",max:"100",step:"any",value:a.commissionRate||0,onChange:b})]}),e.jsxs("div",{className:"form-actions",children:[d&&e.jsx("button",{type:"button",className:"btn-secondary",onClick:()=>{p(null),m(L)},children:"Cancel"}),e.jsx("button",{type:"submit",className:"btn-primary",children:d?"Update User":"Add User"})]})]})]}),e.jsxs("div",{className:"sales-list",style:{marginTop:"30px"},children:[e.jsx("h2",{children:"System Users"}),e.jsx("div",{className:"table-wrap",children:e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Username"}),e.jsx("th",{children:"Role"}),e.jsx("th",{children:"Hourly Rate"}),e.jsx("th",{children:"Created At"}),e.jsx("th",{children:"Actions"})]})}),e.jsxs("tbody",{children:[r.map(s=>e.jsxs(i.Fragment,{children:[e.jsxs("tr",{children:[e.jsxs("td",{children:[e.jsx("strong",{children:s.username})," ",s.id===t.id?"(You)":""]}),e.jsx("td",{children:e.jsx("span",{className:"badge",children:s.role})}),e.jsxs("td",{children:[(s.hourlyRate||0).toLocaleString()," FRW/hr"]}),e.jsx("td",{children:new Date(s.createdAt).toLocaleDateString()}),e.jsx("td",{children:e.jsxs("div",{className:"actions",children:[e.jsx("button",{className:"btn-sm",onClick:()=>We(s),children:"Edit"}),e.jsx("button",{className:"btn-sm",onClick:()=>{v(j===s.id?null:s.id),k(""),p(null)},children:"Reset Password"}),s.id!==t.id&&e.jsx("button",{className:"btn-sm btn-danger",onClick:()=>He(s.id,s.username),children:"Del"})]})})]}),j===s.id&&e.jsx("tr",{children:e.jsx("td",{colSpan:5,style:{background:"var(--bg-color)",padding:"15px"},children:e.jsxs("form",{onSubmit:o=>Be(o,s),style:{display:"flex",gap:"10px",alignItems:"center"},children:[e.jsx("input",{type:"password",placeholder:`New password for ${s.username}`,value:w,onChange:o=>k(o.target.value),required:!0,style:{flex:1}}),e.jsx("button",{type:"submit",className:"btn-primary btn-sm",children:"Save New Password"}),e.jsx("button",{type:"button",className:"btn-secondary btn-sm",onClick:()=>v(null),children:"Cancel"})]})})})]},s.id)),r.length===0&&e.jsx("tr",{children:e.jsx("td",{colSpan:5,className:"empty",children:"No users found."})})]})]})})]})]}),h==="timecards"&&e.jsxs("div",{children:[e.jsxs("div",{className:"stats-grid",children:[e.jsxs("div",{className:"stat-card",children:[e.jsx("div",{className:"stat-icon",style:{backgroundColor:"#db2777"},children:e.jsx(V,{size:24})}),e.jsxs("div",{className:"stat-info",children:[e.jsx("h3",{children:"Total Hours Worked"}),e.jsxs("p",{children:[ne.toFixed(1)," hrs"]})]})]}),e.jsxs("div",{className:"stat-card",children:[e.jsx("div",{className:"stat-icon",style:{backgroundColor:"#10b981"},children:e.jsx(Ce,{size:24})}),e.jsxs("div",{className:"stat-info",children:[e.jsx("h3",{children:"Total Est. Wages"}),e.jsxs("p",{children:[oe.toLocaleString()," FRW"]})]})]}),e.jsxs("div",{className:"stat-card",children:[e.jsx("div",{className:"stat-icon",style:{backgroundColor:"#6366f1"},children:e.jsx(ke,{size:24})}),e.jsxs("div",{className:"stat-info",children:[e.jsx("h3",{children:"Active Clocked-In"}),e.jsxs("p",{children:[re," employees"]})]})]})]}),e.jsxs("div",{className:"filters-bar",children:[e.jsxs("div",{className:"filter-group",children:[e.jsx("label",{children:"Employee"}),e.jsxs("select",{value:P,onChange:s=>$(s.target.value),children:[e.jsx("option",{value:"ALL",children:"All Employees"}),r.map(s=>e.jsx("option",{value:s.id,children:s.username},s.id))]})]}),e.jsxs("div",{className:"filter-group",children:[e.jsx("label",{children:"Start Date"}),e.jsx("input",{type:"date",value:F,onChange:s=>ee(s.target.value)})]}),e.jsxs("div",{className:"filter-group",children:[e.jsx("label",{children:"End Date"}),e.jsx("input",{type:"date",value:z,onChange:s=>se(s.target.value)})]}),e.jsxs("div",{className:"filter-actions",children:[e.jsx("button",{type:"button",className:"btn-secondary",onClick:()=>{$("ALL"),ee(""),se("")},style:{display:"flex",alignItems:"center",gap:"6px",padding:"8px 16px"},children:"Reset"}),e.jsxs("button",{type:"button",className:"btn-primary",onClick:Ye,style:{display:"flex",alignItems:"center",gap:"6px",padding:"8px 16px"},children:[e.jsx(Se,{size:16})," Add Shift Record"]})]})]}),e.jsxs("div",{className:"sales-list",children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"15px"},children:[e.jsxs("h2",{children:["Attendance Log (",T.length," entries)"]}),e.jsxs("button",{className:"btn-secondary btn-sm",onClick:N,style:{display:"flex",alignItems:"center",gap:"5px"},disabled:G,children:[e.jsx(_e,{size:12,className:G?"spin":""})," Refresh"]})]}),e.jsx("div",{className:"table-wrap",children:e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Employee"}),e.jsx("th",{children:"Clock In"}),e.jsx("th",{children:"Clock Out"}),e.jsx("th",{children:"Duration"}),e.jsx("th",{children:"Hourly Rate"}),e.jsx("th",{children:"Est. Wages"}),e.jsx("th",{style:{textAlign:"right"},children:"Actions"})]})}),e.jsxs("tbody",{children:[T.map(s=>{const o=new Date(s.clockIn),c=s.clockOut?new Date(s.clockOut):null;let x="Active",A=0;if(c){const ie=c-o,le=Math.floor(ie/(1e3*60)),Ze=Math.floor(le/60),Je=le%60;x=`${Ze}h ${Je}m`,A=ie/(1e3*60*60)*(s.hourlyRate||0)}return e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("strong",{children:ae[s.userId]||s.userId})}),e.jsx("td",{children:o.toLocaleString()}),e.jsx("td",{children:c?c.toLocaleString():e.jsx("span",{className:"badge-active",children:"Active Now"})}),e.jsx("td",{children:x}),e.jsxs("td",{children:[(s.hourlyRate||0).toLocaleString()," FRW"]}),e.jsx("td",{children:c?e.jsxs("strong",{children:[Math.round(A).toLocaleString()," FRW"]}):e.jsx("span",{style:{color:"var(--text-secondary)"},children:"-"})}),e.jsx("td",{children:e.jsxs("div",{className:"actions",style:{justifyContent:"flex-end",gap:"8px"},children:[!c&&e.jsxs("button",{className:"btn-sm",style:{background:"#e0f2fe",color:"#0369a1",borderColor:"#bbae6fd"},onClick:()=>Xe(s),title:"Force employee to Clock Out now",children:[e.jsx(Ne,{size:12,style:{marginRight:"4px"}})," Clock Out"]}),e.jsxs("button",{className:"btn-sm",onClick:()=>Ue(s),children:[e.jsx(Re,{size:12})," Edit"]}),e.jsxs("button",{className:"btn-sm btn-danger",onClick:()=>Ve(s.id),children:[e.jsx(Te,{size:12})," Delete"]})]})})]},s.id)}),T.length===0&&e.jsx("tr",{children:e.jsx("td",{colSpan:7,className:"empty",style:{textAlign:"center",padding:"30px"},children:"No timecard entries found matching the selection."})})]})]})})]})]}),Pe&&e.jsx("div",{className:"modal-overlay",children:e.jsxs("div",{className:"modal-box",children:[e.jsxs("div",{className:"modal-header",children:[e.jsx("h3",{children:_?"Modify Shift Record":"Manual Shift Log"}),e.jsx("button",{className:"close-btn",onClick:()=>C(!1),children:e.jsx(X,{size:20})})]}),e.jsx("form",{onSubmit:Ke,children:e.jsxs("div",{className:"modal-body",children:[e.jsxs("div",{className:"form-row",children:[e.jsx("label",{children:"Employee *"}),e.jsxs("select",{name:"userId",value:g.userId,onChange:Qe,required:!0,disabled:_,children:[e.jsx("option",{value:"",disabled:!0,children:"-- Select Employee --"}),r.map(s=>e.jsx("option",{value:s.id,children:s.username},s.id))]})]}),e.jsxs("div",{className:"form-row",children:[e.jsx("label",{children:"Clock In Time *"}),e.jsx("input",{name:"clockIn",type:"datetime-local",value:g.clockIn,onChange:H,required:!0})]}),e.jsxs("div",{className:"form-row",children:[e.jsx("label",{children:"Clock Out Time (Leave blank if currently clocked in)"}),e.jsx("input",{name:"clockOut",type:"datetime-local",value:g.clockOut,onChange:H})]}),e.jsxs("div",{className:"form-row",children:[e.jsx("label",{children:"Hourly Rate (FRW)"}),e.jsx("input",{name:"hourlyRate",type:"number",min:"0",step:"any",value:g.hourlyRate,onChange:H})]}),e.jsxs("div",{className:"form-actions",style:{marginTop:"25px",display:"flex",justifyContent:"flex-end",gap:"10px"},children:[e.jsx("button",{type:"button",className:"btn-secondary",onClick:()=>C(!1),children:"Cancel"}),e.jsx("button",{type:"submit",className:"btn-primary",children:_?"Update Record":"Save Record"})]})]})})]})})]})}window.RitaPlugin={mount:(t,n)=>{const r=window.ReactDOM.createRoot(t);r.render(e.jsx(fe,{children:e.jsx(Me,{children:e.jsx(De,{...n.appProps})})})),window.RitaPlugin._root=r},unmount:()=>{const t=window.RitaPlugin._root;t&&t.unmount()}}})(React);
