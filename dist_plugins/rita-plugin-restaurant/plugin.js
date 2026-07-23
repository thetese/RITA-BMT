(function(d){"use strict";var jt={exports:{}},J={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Kt=d,Qt=Symbol.for("react.element"),Yt=Symbol.for("react.fragment"),Jt=Object.prototype.hasOwnProperty,Xt=Kt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,Zt={key:!0,ref:!0,__self:!0,__source:!0};function Nt(n,r,a){var l,u={},c=null,p=null;a!==void 0&&(c=""+a),r.key!==void 0&&(c=""+r.key),r.ref!==void 0&&(p=r.ref);for(l in r)Jt.call(r,l)&&!Zt.hasOwnProperty(l)&&(u[l]=r[l]);if(n&&n.defaultProps)for(l in r=n.defaultProps,r)u[l]===void 0&&(u[l]=r[l]);return{$$typeof:Qt,type:n,key:c,ref:p,props:u,_owner:Xt.current}}J.Fragment=Yt,J.jsx=Nt,J.jsxs=Nt,jt.exports=J;var t=jt.exports;/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const kt=(...n)=>n.filter((r,a,l)=>!!r&&r.trim()!==""&&l.indexOf(r)===a).join(" ").trim();/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Gt=n=>n.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const te=n=>n.replace(/^([A-Z])|[\s-_]+(\w)/g,(r,a,l)=>l?l.toUpperCase():a.toLowerCase());/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const At=n=>{const r=te(n);return r.charAt(0).toUpperCase()+r.slice(1)};/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var pt={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ee=n=>{for(const r in n)if(r.startsWith("aria-")||r==="role"||r==="title")return!0;return!1},ne=d.createContext({}),oe=()=>d.useContext(ne),re=d.forwardRef(({color:n,size:r,strokeWidth:a,absoluteStrokeWidth:l,className:u="",children:c,iconNode:p,...m},h)=>{const{size:f=24,strokeWidth:y=2,absoluteStrokeWidth:k=!1,color:v="currentColor",className:N=""}=oe()??{},D=l??k?Number(a??y)*24/Number(r??f):a??y;return d.createElement("svg",{ref:h,...pt,width:r??f??pt.width,height:r??f??pt.height,stroke:n??v,strokeWidth:D,className:kt("lucide",N,u),...!c&&!ee(m)&&{"aria-hidden":"true"},...m},[...p.map(([H,M])=>d.createElement(H,M)),...Array.isArray(c)?c:[c]])});/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=(n,r)=>{const a=d.forwardRef(({className:l,...u},c)=>d.createElement(re,{ref:c,iconNode:r,className:kt(`lucide-${Gt(At(n))}`,`lucide-${n}`,l),...u}));return a.displayName=At(n),a};/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const se=I("arrow-left",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ie=I("banknote",[["rect",{width:"20",height:"12",x:"2",y:"6",rx:"2",key:"9lu3g6"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}],["path",{d:"M6 12h.01M18 12h.01",key:"113zkx"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ae=I("chef-hat",[["path",{d:"M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z",key:"1qvrer"}],["path",{d:"M6 17h12",key:"1jwigz"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const de=I("circle-pause",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"10",x2:"10",y1:"15",y2:"9",key:"c1nkhi"}],["line",{x1:"14",x2:"14",y1:"15",y2:"9",key:"h65svq"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const le=I("credit-card",[["rect",{width:"20",height:"14",x:"2",y:"5",rx:"2",key:"ynyp8z"}],["line",{x1:"2",x2:"22",y1:"10",y2:"10",key:"1b3vmo"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ce=I("printer",[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pe=I("save",[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",key:"1c8476"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",key:"1ydtos"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7",key:"t51u73"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ue=I("shopping-cart",[["circle",{cx:"8",cy:"21",r:"1",key:"jimo8o"}],["circle",{cx:"19",cy:"21",r:"1",key:"13723u"}],["path",{d:"M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12",key:"9zh506"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xe=I("smartphone",[["rect",{width:"14",height:"20",x:"5",y:"2",rx:"2",ry:"2",key:"1yt0o3"}],["path",{d:"M12 18h.01",key:"mhygvu"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const me=I("x",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);let X;const he=new Uint8Array(16);function ge(){if(!X&&(X=typeof crypto<"u"&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto),!X))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return X(he)}const j=[];for(let n=0;n<256;++n)j.push((n+256).toString(16).slice(1));function ye(n,r=0){return j[n[r+0]]+j[n[r+1]]+j[n[r+2]]+j[n[r+3]]+"-"+j[n[r+4]]+j[n[r+5]]+"-"+j[n[r+6]]+j[n[r+7]]+"-"+j[n[r+8]]+j[n[r+9]]+"-"+j[n[r+10]]+j[n[r+11]]+j[n[r+12]]+j[n[r+13]]+j[n[r+14]]+j[n[r+15]]}const Tt={randomUUID:typeof crypto<"u"&&crypto.randomUUID&&crypto.randomUUID.bind(crypto)};function fe(n,r,a){if(Tt.randomUUID&&!n)return Tt.randomUUID();n=n||{};const l=n.random||(n.rng||ge)();return l[6]=l[6]&15|64,l[8]=l[8]&63|128,ye(l)}const be=(n,r,a,l,u,c,p={},m=null)=>{const h=new Date().toLocaleString(),f=n.map(S=>{const R=S.quantity*S.unitPrice,W=S.discountAmount||0,mt=R-W;return`
    <tr>
      <td style="padding: 4px 0;">
        ${S.productName} (${S.taxTyCd==="A"?"A":"B"})<br>
        <small>${S.quantity}${S.unit&&S.unit!=="Pcs"?" "+S.unit:""} x ${S.unitPrice.toLocaleString()}</small>
        ${W>0?`<br><small style="color: #666;">Disc: -${W.toLocaleString()}</small>`:""}
      </td>
      <td style="text-align: right; vertical-align: bottom; padding: 4px 0;">${mt.toLocaleString()}</td>
    </tr>
  `}).join(""),{tin:y="",rcptSign:k="",intrlData:v="",rcptNo:N="",sdcId:D="",mrcNo:H="",taxblAmtA:M=0,taxblAmtB:Z=0,taxAmtB:G=0}=p,xt=`https://myrra.rra.gov.rw/receipt?tin=${y}&rcptNo=${N}&sdcId=${D}&sign=${k}`;return`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Receipt</title>
      <style>
        body {
          font-family: 'Courier New', Courier, monospace;
          width: 80mm;
          margin: 0;
          padding: 10px;
          color: #000;
          font-size: 12px;
          line-height: 1.4;
        }
        .header {
          text-align: center;
          margin-bottom: 10px;
        }
        .header h1 {
          margin: 0;
          font-size: 18px;
          font-weight: bold;
        }
        .rra-header {
          text-align: center;
          margin-bottom: 15px;
          font-weight: bold;
          font-size: 14px;
        }
        .info {
          margin-bottom: 15px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        th {
          text-align: left;
          border-bottom: 1px dashed #000;
          border-top: 1px dashed #000;
          padding: 4px 0;
        }
        .totals {
          border-top: 1px dashed #000;
          padding-top: 5px;
          text-align: right;
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 10px;
        }
        .taxes {
          border-top: 1px dashed #000;
          border-bottom: 1px dashed #000;
          padding: 5px 0;
          margin-bottom: 15px;
        }
        .taxes table { margin: 0; }
        .taxes th, .taxes td { border: none; padding: 2px 0; font-weight: normal; font-size: 11px; }
        .rra-footer {
          text-align: center;
          margin-top: 15px;
          font-size: 11px;
          word-break: break-all;
        }
        .qr-code {
          text-align: center;
          margin: 15px 0;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 10px;
          border-top: 1px dashed #000;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${p.businessName||"RITA SALES"}</h1>
        ${p.businessAddress?`<div>${p.businessAddress}</div>`:""}
        ${p.businessPhone?`<div>Tel: ${p.businessPhone}</div>`:""}
      </div>
      
      <div class="rra-header">
        <div>TIN: ${y}</div>
        <div>Welcome to RRA EBM System</div>
      </div>

      <div class="info">
        <div>Receipt No: ${N}</div>
        <div>Date: ${h}</div>
        <div>Payment: ${m?Object.entries(m).filter(([S,R])=>R>0).map(([S,R])=>`${S} (${R.toLocaleString()})`).join(", "):l}</div>
        ${u?`<div>Customer: ${u}</div>`:""}
        ${c?`<div>Served by: ${c}</div>`:""}
      </div>

      <table>
        <thead>
          <tr>
            <th>Item (Tax)</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${f}
        </tbody>
      </table>

      <div class="totals">
        TOTAL DUE: ${r.toLocaleString()} FRW
      </div>

      <div class="taxes">
        <table>
          <tr>
            <th style="text-align: left">TAX</th>
            <th style="text-align: right">TAXABLE</th>
            <th style="text-align: right">TAX AMT</th>
          </tr>
          <tr>
            <td>A-EX (0%)</td>
            <td style="text-align: right">${M.toLocaleString()}</td>
            <td style="text-align: right">0</td>
          </tr>
          <tr>
            <td>B (18%)</td>
            <td style="text-align: right">${Math.round(Z).toLocaleString()}</td>
            <td style="text-align: right">${Math.round(G).toLocaleString()}</td>
          </tr>
          <tr>
            <td colspan="3" style="border-top: 1px dotted #000; padding-top: 3px;"></td>
          </tr>
          <tr style="font-weight: bold;">
            <td>TOTAL TAX</td>
            <td style="text-align: right">${Math.round(M+Z).toLocaleString()}</td>
            <td style="text-align: right">${Math.round(G).toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <div class="rra-footer">
        <div>SDC ID: ${D}</div>
        <div>Receipt Signature:</div>
        <div style="font-weight: bold; margin: 5px 0;">${k}</div>
        <div>Internal Data:</div>
        <div style="font-weight: bold; margin: 5px 0;">${v}</div>
        <div>MRC: ${H}</div>
      </div>

      <div class="qr-code">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(xt)}" alt="QR Code" />
      </div>

      <div class="footer">
        Thank you for your business!<br>
        Please come again.
      </div>
    </body>
    </html>
  `},ve=(n,r,a,l,u={},c="")=>{const p=new Date().toLocaleString(),m=n.map(h=>{const f=h.quantity*h.unitPrice,y=h.discountAmount||0,k=f-y;return`
    <tr>
      <td style="padding: 4px 0;">
        ${h.productName}<br>
        <small>${h.quantity}${h.unit&&h.unit!=="Pcs"?" "+h.unit:""} x ${h.unitPrice.toLocaleString()}</small>
        ${y>0?`<br><small style="color: #666;">Disc: -${y.toLocaleString()}</small>`:""}
      </td>
      <td style="text-align: right; vertical-align: bottom; padding: 4px 0;">${k.toLocaleString()}</td>
    </tr>
  `}).join("");return`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Proforma Bill</title>
      <style>
        body { font-family: 'Courier New', Courier, monospace; width: 80mm; margin: 0; padding: 10px; color: #000; font-size: 12px; line-height: 1.4; }
        .header { text-align: center; margin-bottom: 10px; }
        .header h1 { margin: 0; font-size: 18px; font-weight: bold; }
        .info { margin-bottom: 15px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        th { text-align: left; border-bottom: 1px dashed #000; border-top: 1px dashed #000; padding: 4px 0; }
        .totals { border-top: 1px dashed #000; padding-top: 5px; text-align: right; font-weight: bold; font-size: 16px; margin-bottom: 10px; }
        .footer { text-align: center; margin-top: 20px; font-size: 11px; border-top: 1px dashed #000; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${u.businessName||"RITA SALES"}</h1>
        ${u.businessAddress?`<div>${u.businessAddress}</div>`:""}
        ${u.businessPhone?`<div>Tel: ${u.businessPhone}</div>`:""}
        <div style="font-weight: bold; font-size: 14px; margin-top: 10px;">PROFORMA BILL</div>
      </div>
      
      <div class="info">
        <div>Date: ${p}</div>
        ${c?`<div><strong>Table/Order: ${c}</strong></div>`:""}
        ${a?`<div>Customer: ${a}</div>`:""}
        ${l?`<div>Waiter: ${l}</div>`:""}
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${m}
        </tbody>
      </table>

      <div class="totals">
        TOTAL: ${r.toLocaleString()} FRW
      </div>

      <div class="footer">
        This is not a fiscal receipt.<br>
        Please review your bill before payment.
      </div>
    </body>
    </html>
  `},Ce={getVsdcUrl(){return localStorage.getItem("vsdcUrl")||"http://localhost:8080"},async saveSales(n){const r=`${this.getVsdcUrl()}/trnsSales/saveSales`;try{const a=await fetch(r,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(n)});if(!a.ok)throw console.warn("VSDC API responded with error:",a.status,a.statusText),new Error(`VSDC error: ${a.status}`);return await a.json()}catch(a){throw console.error("VSDC connection failed:",a),a}},async saveStockItems(n){const r=`${this.getVsdcUrl()}/saveStockItems/saveStockItems`;try{const a=await fetch(r,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(n)});if(!a.ok)throw new Error(`VSDC error: ${a.status}`);return await a.json()}catch(a){throw console.error("VSDC connection failed:",a),a}}};function ut({variant:n="secondary",size:r="md",icon:a,children:l,className:u="",...c}){return t.jsxs("button",{className:`ui-btn ui-btn-${n} ui-btn-${r} ${u}`.trim(),...c,children:[a&&t.jsx("span",{className:"ui-btn-icon",children:a}),l&&t.jsx("span",{className:"ui-btn-label",children:l})]})}function we({title:n,children:r,onClose:a,isOpen:l,size:u="md"}){const c=d.useRef(null);return d.useEffect(()=>{const p=m=>{if(m.key==="Escape"&&l&&a(),m.key==="Tab"&&c.current){const h=Array.from(c.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(k=>!k.disabled);if(h.length===0)return;const f=h[0],y=h[h.length-1];m.shiftKey&&document.activeElement===f?(m.preventDefault(),y.focus()):!m.shiftKey&&document.activeElement===y&&(m.preventDefault(),f.focus())}};return l&&(window.addEventListener("keydown",p),document.body.classList.add("modal-open"),setTimeout(()=>{if(!c.current)return;const m=c.current.querySelector("input, textarea, select, button");m&&m.focus()},50)),()=>{window.removeEventListener("keydown",p),document.body.classList.remove("modal-open")}},[l,a]),l?t.jsx("div",{className:"modal-overlay",onClick:a,children:t.jsxs("div",{className:"modal-content modal-"+u,onClick:p=>p.stopPropagation(),ref:c,role:"dialog","aria-modal":"true","aria-label":n,children:[t.jsxs("div",{className:"modal-header",children:[t.jsx("h2",{children:n}),t.jsx(ut,{variant:"ghost",size:"sm",icon:t.jsx(me,{size:18}),onClick:a,"aria-label":"Close"})]}),r]})}):null}const $t=d.createContext(null),Se=({children:n})=>{const[r,a]=d.useState(!1),[l,u]=d.useState(""),c=d.useRef(null),p=d.useCallback(f=>new Promise(y=>{u(f),a(!0),c.current=y}),[]),m=()=>{c.current&&c.current(!0),a(!1)},h=()=>{c.current&&c.current(!1),a(!1)};return t.jsxs($t.Provider,{value:{askConfirm:p},children:[n,t.jsxs(we,{title:"Confirmation",isOpen:r,onClose:h,children:[t.jsx("p",{className:"confirm-message",children:l}),t.jsxs("div",{className:"modal-actions",children:[t.jsx(ut,{variant:"secondary",onClick:h,children:"Cancel"}),t.jsx(ut,{variant:"danger",onClick:m,children:"Confirm"})]})]})]})},je=()=>{const n=d.useContext($t);if(!n)throw new Error("useConfirm must be used within ConfirmProvider");return n};function Pt({mode:n,shift:r,onSubmit:a,onCancel:l}){const[u,c]=d.useState(""),[p,m]=d.useState(null),{askConfirm:h}=je();d.useEffect(()=>{n==="close"&&r&&r.id&&window.api.getExpectedCash(r.id).then(m).catch(console.error)},[n,r]);const f=async y=>{if(y.preventDefault(),!u||isNaN(u))return;const k=parseFloat(u);if(n==="close"&&p!==null&&k!==p){const v=k-p,N=v>0?`You are OVER by ${v.toLocaleString()} FRW.`:`You are SHORT by ${Math.abs(v).toLocaleString()} FRW.`;if(!await h(`Discrepancy Detected!

Expected Cash: ${p.toLocaleString()} FRW
Actual Cash: ${k.toLocaleString()} FRW

${N}

Are you sure you want to close this shift with this discrepancy?`))return}a(k)};return t.jsx("div",{style:{display:"flex",justifyContent:"center",alignItems:"center",height:"100%",background:"var(--bg-color)",color:"var(--text-color)"},children:t.jsx("div",{style:{background:"var(--card-bg)",padding:"40px",borderRadius:"12px",boxShadow:"0 4px 15px rgba(0,0,0,0.1)",maxWidth:"400px",width:"100%",textAlign:"center"},children:n==="open"?t.jsxs(t.Fragment,{children:[t.jsx("h2",{style:{marginBottom:"10px"},children:"Open Shift"}),t.jsx("p",{style:{color:"var(--text-secondary)",marginBottom:"30px"},children:"Declare your starting cash float to begin selling."}),t.jsxs("form",{onSubmit:f,children:[t.jsxs("div",{style:{marginBottom:"20px",textAlign:"left"},children:[t.jsx("label",{style:{display:"block",marginBottom:"8px",fontWeight:"bold"},children:"Starting Cash (FRW) *"}),t.jsx("input",{type:"number",value:u,onChange:y=>c(y.target.value),placeholder:"e.g. 10000",style:{width:"100%",padding:"12px",borderRadius:"6px",border:"1px solid var(--border-color)",fontSize:"1.2rem",boxSizing:"border-box"},required:!0})]}),t.jsx("button",{type:"submit",style:{width:"100%",padding:"12px",background:"var(--primary)",color:"#fff",border:"none",borderRadius:"6px",fontSize:"1.1rem",cursor:"pointer",fontWeight:"bold"},children:"Open Shift"})]})]}):t.jsxs(t.Fragment,{children:[t.jsx("h2",{style:{marginBottom:"10px",color:"var(--danger)"},children:"Close Shift"}),t.jsxs("p",{style:{color:"var(--text-secondary)",marginBottom:"20px"},children:["Shift opened at: ",new Date(r.openedAt).toLocaleTimeString(),t.jsx("br",{}),"Count the physical cash in your drawer."]}),t.jsxs("form",{onSubmit:f,children:[t.jsxs("div",{style:{marginBottom:"20px",textAlign:"left"},children:[t.jsx("label",{style:{display:"block",marginBottom:"8px",fontWeight:"bold"},children:"Actual Cash Counted (FRW) *"}),t.jsx("input",{type:"number",value:u,onChange:y=>c(y.target.value),placeholder:"Enter actual cash",style:{width:"100%",padding:"12px",borderRadius:"6px",border:"1px solid var(--border-color)",fontSize:"1.2rem",boxSizing:"border-box"},required:!0})]}),p!==null&&u&&!isNaN(u)&&parseFloat(u)!==p&&t.jsxs("div",{style:{padding:"10px",background:"var(--danger)",color:"white",borderRadius:"6px",marginBottom:"20px",fontSize:"0.9rem"},children:["Warning: The expected cash amount in drawer is ",p.toLocaleString()," FRW. You have a discrepancy of ",(parseFloat(u)-p).toLocaleString()," FRW."]}),t.jsxs("div",{style:{display:"flex",gap:"10px"},children:[t.jsx("button",{type:"button",onClick:l,style:{flex:1,padding:"12px",background:"#e2e8f0",color:"#000",border:"none",borderRadius:"6px",fontSize:"1.1rem",cursor:"pointer",fontWeight:"bold"},children:"Cancel"}),t.jsx("button",{type:"submit",style:{flex:1,padding:"12px",background:"var(--danger)",color:"#fff",border:"none",borderRadius:"6px",fontSize:"1.1rem",cursor:"pointer",fontWeight:"bold"},children:"Close Shift"})]})]})]})})})}function Ne({currentUser:n,categories:r=[],sales:a=[],onSave:l}){var qt;const[u,c]=d.useState([]),[p,m]=d.useState(null),[h,f]=d.useState("waiterSelect"),[y,k]=d.useState([]),[v,N]=d.useState([]),[D,H]=d.useState(""),[M,Z]=d.useState(""),[G,xt]=d.useState("Cash"),[S,R]=d.useState(""),[W,mt]=d.useState([]),[P,Te]=d.useState(""),[_,$e]=d.useState(0),[It,tt]=d.useState(""),[L,O]=d.useState(null),[Wt,E]=d.useState(""),[et,zt]=d.useState([]),[Pe,Dt]=d.useState(!1),[Ie,ht]=d.useState(!1),[g,T]=d.useState({Cash:0,Card:0,Momo:0}),[z,U]=d.useState("Cash"),[We,gt]=d.useState(!1),[V,nt]=d.useState(""),[yt,ze]=d.useState([]),[ot,ft]=d.useState(null),[De,bt]=d.useState(null),Re=async()=>{if(!window.api)return;const e=await window.api.getProducts();k(e)},rt=async()=>{if(Re(),window.api){const e=await window.api.getAccounters();c(e);const s=await window.api.getHeldCarts();zt(s);const i=await window.api.getCustomers();mt(i);const o=await window.api.getTables();if(ze(o),n!=null&&n.id){const x=await window.api.getActiveShift(n.id);ft(x)}}};d.useEffect(()=>{rt()},[]);const K=d.useRef(""),Rt=d.useRef(Date.now()),Lt=(e="success")=>{try{const s=window.AudioContext||window.webkitAudioContext;if(!s)return;const i=new s,o=i.createOscillator(),x=i.createGain();o.connect(x),x.connect(i.destination),e==="success"?(o.type="sine",o.frequency.setValueAtTime(800,i.currentTime),x.gain.setValueAtTime(.1,i.currentTime),o.start(),o.stop(i.currentTime+.1)):(o.type="sawtooth",o.frequency.setValueAtTime(300,i.currentTime),x.gain.setValueAtTime(.1,i.currentTime),o.start(),o.stop(i.currentTime+.3))}catch{}};d.useEffect(()=>{const e=s=>{if(s.target.tagName==="INPUT"||s.target.tagName==="TEXTAREA"||s.target.tagName==="SELECT"||h!=="pos")return;const i=Date.now();if(i-Rt.current>50&&(K.current=""),Rt.current=i,s.key==="Enter"){if(K.current.length>0){const o=K.current;let x=y.find(C=>C.barcode===o),w=null;if(!x&&o.length===13&&/^2[0-9]/.test(o)){const C=o.substring(0,7),A=o.substring(7,12);x=y.find($=>$.barcode&&$.barcode.startsWith(C)),x&&(w=parseInt(A,10))}x?(Mt(x,w),Lt("success")):(Lt("error"),alert(`Barcode ${o} not found in database!`)),K.current=""}}else s.key.length===1&&(K.current+=s.key)};return window.addEventListener("keydown",e),()=>window.removeEventListener("keydown",e)},[y,h]);const Le=async e=>{const s=await window.api.openShift(n.id,e);ft(s)},Me=async e=>{await window.api.closeShift(ot.id,e),ft(null),bt(null)};if(n!=null&&n.id&&!ot)return t.jsx(Pt,{mode:"open",onSubmit:Le,onCancel:()=>{},shift:null});if(De==="close"&&ot)return t.jsx(Pt,{mode:"close",shift:ot,onSubmit:Me,onCancel:()=>bt(null)});const Mt=(e,s=null)=>{e.stockQuantity<=0&&!s||N(i=>{const o=s!==null?s:e.unitPrice,x=1,w=i.find(C=>C.productId===e.id&&C.unitPrice===o);return w&&s===null?w.quantity>=e.stockQuantity?i:i.map(C=>C.productId===e.id?{...C,quantity:C.quantity+1}:C):[...i,{productId:e.id+(s?"-"+Date.now():""),originalProductId:e.id,productName:e.productName+(s?" (Scale Item)":""),category:e.category,unitPrice:o,costPrice:e.costPrice,taxTyCd:e.taxTyCd||"B",itemCd:e.itemCd,itemClsCd:e.itemClsCd,unit:e.unit||"Pcs",quantity:x,discount:"",status:"pending"}]})},_t=(e,s)=>{N(i=>i.map(o=>{if(o.productId===e){const x=o.quantity+s,w=y.find(C=>C.id===e);return w&&x>w.stockQuantity?o:{...o,quantity:x>0?x:0}}return o}).filter(o=>o.quantity>0))},_e=(e,s)=>{N(i=>i.map(o=>{if(o.productId===e){const x=parseFloat(s)||0,w=y.find(C=>C.id===o.originalProductId||C.id===o.productId);return w&&x>w.stockQuantity?o:{...o,quantity:x>0?x:0}}return o}).filter(o=>o.quantity>0))},Bt=async()=>{if(v.length!==0)try{L?(await window.api.updateHeldCart(L,{cartData:JSON.stringify(v)}),N([]),R(""),tt(""),O(null),E(""),f("waiterSelect"),m(null),rt()):(nt(S||""),gt(!0))}catch(e){alert("Error saving order: "+e.message+`

Please CLOSE and RESTART the app fully to apply updates.`)}},vt=async()=>{if(!V.trim()){alert("Please enter a name for the table.");return}try{await window.api.addHeldCart({name:V,cartData:JSON.stringify(v),waiterName:p.name}),gt(!1),N([]),R(""),tt(""),O(null),E(""),f("waiterSelect"),m(null),rt()}catch(e){alert("Error saving order: "+e.message)}},Ot=async e=>{v.length>0&&!L&&!confirm("This will overwrite the current active cart. Continue?")||(N(JSON.parse(e.cartData)),O(e.id),E(e.name),Dt(!1),f("pos"))},Be=async e=>{if(!confirm("Delete this open order permanently?"))return;await window.api.deleteHeldCart(e),L===e&&(O(null),E(""),N([]));const s=await window.api.getHeldCarts();zt(s)},Oe=async()=>{if(v.length!==0)try{const e=v.map(A=>({...A,discountAmount:q(A)})),s=await window.api.getSetting("businessName")||"",i=await window.api.getSetting("businessAddress")||"",o=await window.api.getSetting("businessPhone")||"",x=ve(e,F,S,p.name,{businessName:s,businessAddress:i,businessPhone:o},Wt),w=await window.api.getSetting("receiptPrinter"),C=await window.api.printReceipt(x,w||"");C.success||alert("Failed to print bill: "+(C.errorType||"Unknown error"))}catch(e){alert("Error printing bill: "+e.message)}},Ee=(e,s)=>{N(i=>i.map(o=>o.productId===e?{...o,discount:s}:o))},q=e=>{const s=e.quantity*e.unitPrice;if(!e.discount)return 0;if(e.discount.includes("%")){const i=parseFloat(e.discount)||0;return s*i/100}return parseFloat(e.discount)||0},F=v.reduce((e,s)=>e+(s.quantity*s.unitPrice-q(s)),0),Ct=(Number(g.Cash)||0)+(Number(g.Card)||0)+(Number(g.Momo)||0),B=Math.max(0,F-_*10),wt=Ct-B,qe=async()=>{var e;if(v.length!==0){if(Ct<F){alert("Insufficient payment amount.");return}try{const s=fe(),i=new Date().toISOString().split("T")[0],o=await window.api.getSetting("tin")||"999999999",x=await window.api.getSetting("businessName")||"",w=await window.api.getSetting("businessAddress")||"",C=await window.api.getSetting("businessPhone")||"";let A=0,$=0,st=0;const Fe=v.map((b,it)=>{const at=b.quantity*b.unitPrice,dt=q(b),St=b.discount.includes("%")&&parseFloat(b.discount)||0,Y=at-dt;let lt=0,ct=Y;return b.taxTyCd==="B"?(lt=Y-Y/1.18,ct=Y-lt,$+=ct,st+=lt):A+=ct,{itemSeq:it+1,itemCd:b.itemCd||"RW2NTBA0000012",itemClsCd:b.itemClsCd||"5059690800",itemNm:b.productName,bcd:null,pkgUnitCd:"NT",pkg:1,qtyUnitCd:"U",qty:b.quantity,prc:b.unitPrice,splyAmt:at,dcRt:St,dcAmt:dt,taxTyCd:b.taxTyCd,taxblAmt:ct,taxAmt:lt,totAmt:Y}}),He={tin:o,bhfId:"00",invcNo:1,orgInvcNo:0,custTin:"",custNm:S,salesTyCd:"N",rcptTyCd:"S",pmtTyCd:g.Cash>=g.Card&&g.Cash>=g.Momo?"01":g.Card>=g.Momo?"02":"04",salesSttsCd:"02",cfmDt:i.replace(/-/g,"")+"120000",salesDt:i.replace(/-/g,""),stockRlsDt:i.replace(/-/g,"")+"120000",totItemCnt:v.length,taxblAmtA:A,taxblAmtB:$,taxblAmtC:0,taxblAmtD:0,taxRtA:0,taxRtB:18,taxRtC:0,taxRtD:0,taxAmtA:0,taxAmtB:st,taxAmtC:0,taxAmtD:0,totTaxblAmt:A+$,totTaxAmt:st,totAmt:F,itemList:Fe},Q=await Ce.saveSales(He),Ft=Q.data.rcptSign,Ht=Q.data.intrlData,Ut=Q.data.rcptNo;for(const b of v){const it=q(b),at=b.discount.includes("%")&&parseFloat(b.discount)||0,dt=b.quantity*b.unitPrice-it;await window.api.addSale({productId:b.originalProductId||b.productId,productName:b.productName,category:b.category,quantity:b.quantity,unitPrice:b.unitPrice,costPrice:b.costPrice,totalPrice:dt-(_>0?_*10/v.length:0),date:i,customerName:P?(e=W.find(St=>St.id===P))==null?void 0:e.name:"",customerId:P||null,notes:It,paymentMethod:g.Cash>=g.Card&&g.Cash>=g.Momo?"Cash":g.Card>=g.Momo?"Card":"Mobile Money",paymentDetails:JSON.stringify({Cash:Number(g.Cash)||0,Card:Number(g.Card)||0,"Mobile Money":Number(g.Momo)||0}),discountAmount:it,discountRate:at,receiptId:s,receiptSignature:Ft,internalData:Ht,receiptNo:Ut,waiterName:p.name},n.id)}_>0&&P&&await window.api.deductCustomerPoints(P,_);const Ue=v.map(b=>({...b,discountAmount:q(b)})),Ve=be(Ue,F,s,G,S,p.name,{tin:o,businessName:x,businessAddress:w,businessPhone:C,rcptSign:Ft,intrlData:Ht,rcptNo:Ut,sdcId:Q.data.sdcId,mrcNo:Q.data.mrcNo,taxblAmtA:A,taxblAmtB:$,taxAmtB:st},{Cash:Number(g.Cash)||0,Card:Number(g.Card)||0,"Mobile Money":Number(g.Momo)||0}),Ke=await window.api.getSetting("receiptPrinter"),Vt=await window.api.printReceipt(Ve,Ke||"");Vt.success?alert("Checkout complete and receipt printed!"):alert("Checkout complete, but printing failed: "+(Vt.errorType||"Unknown error")),L&&await window.api.deleteHeldCart(L),N([]),R(""),tt(""),xt("Cash"),T({Cash:0,Card:0,Momo:0}),ht(!1),O(null),E(""),f("waiterSelect"),m(null),rt(),l&&l()}catch(s){alert("Error during checkout: "+s.message)}}},Et=y.filter(e=>!(D&&e.category!==D||M&&!e.productName.toLowerCase().includes(M.toLowerCase())));if(h==="waiterSelect")return t.jsxs("div",{style:{padding:"20px",maxWidth:"800px",margin:"0 auto",textAlign:"center",display:"flex",flexDirection:"column",height:"100%"},children:[t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"40px"},children:[t.jsx("h1",{style:{fontSize:"2.5rem",margin:0},children:"Select Waiter"}),t.jsx("button",{className:"btn-danger",style:{padding:"10px 20px",fontSize:"1.2rem",borderRadius:"8px"},onClick:()=>bt("close"),children:"Close Shift"})]}),t.jsxs("div",{style:{display:"flex",flexWrap:"wrap",gap:"20px",justifyContent:"center"},children:[u.map(e=>t.jsx("button",{onClick:()=>{m(e),f("dashboard")},style:{padding:"30px 40px",fontSize:"1.5rem",borderRadius:"16px",border:"none",background:"var(--primary)",color:"#fff",cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",minWidth:"200px"},children:e.name},e.id)),u.length===0&&t.jsx("div",{style:{color:"var(--text-secondary)"},children:"No team members configured. Ask Admin to add people to the Team tab."})]})]});if(h==="dashboard"){const e=et.filter(o=>o.waiterName===p.name),s=new Date().toISOString().split("T")[0],i=a?a.filter(o=>o.waiterName===p.name&&o.date&&o.date.startsWith(s)):[];return t.jsxs("div",{style:{padding:"20px",maxWidth:"1000px",margin:"0 auto",width:"100%"},children:[t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"30px"},children:[t.jsxs("h1",{style:{fontSize:"2.5rem",margin:0},children:["Welcome, ",p.name,"!"]}),t.jsx("button",{className:"btn-secondary",onClick:()=>{f("waiterSelect"),m(null)},children:"Switch Waiter"})]}),t.jsx("button",{className:"btn-primary",style:{width:"100%",padding:"25px",fontSize:"1.8rem",borderRadius:"16px",marginBottom:"40px"},onClick:()=>{N([]),O(null),E(""),f("pos")},children:"➕ Start New Order"}),t.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"30px"},children:[t.jsxs("div",{style:{background:"var(--card-bg)",padding:"20px",borderRadius:"12px",boxShadow:"0 4px 12px rgba(0,0,0,0.05)"},children:[t.jsx("h2",{style:{borderBottom:"2px solid var(--border-color)",paddingBottom:"10px"},children:"Your Open Tables (Updated)"}),t.jsx("div",{style:{marginTop:"15px",display:"flex",flexDirection:"column",gap:"10px"},children:e.length===0?t.jsx("div",{style:{color:"var(--text-secondary)"},children:"No open tables."}):e.map(o=>{const x=JSON.parse(o.cartData),w=x.reduce((A,$)=>A+$.quantity,0),C=x.reduce((A,$)=>A+$.quantity*$.unitPrice,0);return t.jsxs("div",{style:{padding:"15px",border:"1px solid var(--border-color)",borderRadius:"8px",display:"flex",justifyContent:"space-between",alignItems:"center"},children:[t.jsxs("div",{children:[t.jsx("div",{style:{fontWeight:"bold",fontSize:"1.1rem"},children:o.name}),t.jsxs("div",{style:{color:"var(--text-secondary)"},children:[w," items - ",C.toLocaleString()," FRW"]})]}),t.jsx("button",{className:"btn-primary",onClick:()=>Ot(o),children:"Resume"})]},o.id)})})]}),t.jsxs("div",{style:{background:"var(--card-bg)",padding:"20px",borderRadius:"12px",boxShadow:"0 4px 12px rgba(0,0,0,0.05)"},children:[t.jsx("h2",{style:{borderBottom:"2px solid var(--border-color)",paddingBottom:"10px"},children:"Your Closed Sales (Today)"}),t.jsx("div",{style:{marginTop:"15px",display:"flex",flexDirection:"column",gap:"10px",maxHeight:"400px",overflowY:"auto"},children:i.length===0?t.jsx("div",{style:{color:"var(--text-secondary)"},children:"No closed sales yet today."}):i.map(o=>t.jsxs("div",{style:{padding:"15px",border:"1px solid var(--border-color)",borderRadius:"8px",display:"flex",justifyContent:"space-between",alignItems:"center"},children:[t.jsxs("div",{children:[t.jsxs("div",{style:{fontWeight:"bold",fontSize:"1.1rem"},children:[o.productName," (x",o.quantity,")"]}),t.jsxs("div",{style:{color:"var(--text-secondary)"},children:[new Date(o.createdAt).toLocaleTimeString(),o.customerName?` - ${o.customerName}`:""]})]}),t.jsxs("div",{style:{fontWeight:"bold",color:"var(--primary)"},children:[o.totalPrice.toLocaleString()," FRW"]})]},o.id))})]})]})]})}return t.jsxs("div",{className:"pos-container",children:[t.jsxs("div",{className:"pos-panel pos-products-panel",children:[t.jsxs("div",{className:"pos-search-bar",children:[t.jsx("input",{type:"text",placeholder:"Search products...",value:M,onChange:e=>Z(e.target.value),className:"pos-search-input"}),t.jsxs("select",{value:D,onChange:e=>H(e.target.value),className:"pos-search-input",style:{flex:"0 0 200px"},children:[t.jsx("option",{value:"",children:"All Categories"}),r.map(e=>t.jsx("option",{value:e,children:e},e))]})]}),t.jsxs("div",{className:"pos-product-grid",children:[Et.map(e=>{const s=e.stockQuantity<=0,i=e.stockQuantity>0&&e.stockQuantity<=5,o=e.category?e.category.charCodeAt(0)%5:0,x=s?"var(--bg-secondary)":`var(--pos-cat-${o})`;return t.jsxs("div",{onClick:()=>{s||Mt(e,null)},className:`pos-product-card ${s?"out-of-stock":""}`,style:{background:x},children:[i&&t.jsx("div",{style:{position:"absolute",top:"-8px",right:"-8px",background:"#ff9800",color:"#fff",fontSize:"0.7rem",padding:"2px 6px",borderRadius:"10px",fontWeight:"bold",boxShadow:"0 2px 4px rgba(0,0,0,0.2)",zIndex:10},children:"LOW STOCK"}),t.jsxs("div",{children:[t.jsx("div",{style:{display:"inline-block",padding:"2px 6px",background:"var(--pos-cat-tag-bg)",borderRadius:"4px",fontSize:"0.65rem",fontWeight:"bold",textTransform:"uppercase",color:"var(--pos-cat-tag-text)",marginBottom:"4px",maxWidth:"100%",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},children:e.category||"Item"}),t.jsx("div",{className:"pos-product-title",style:{color:"var(--pos-card-title)"},children:e.productName})]}),t.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"flex-start",marginTop:"6px"},children:[t.jsxs("div",{style:{fontSize:"0.7rem",color:i?"#ff9800":"var(--text-secondary)",fontWeight:i?"bold":"normal",marginBottom:"2px"},children:["Stock: ",e.stockQuantity||0]}),t.jsxs("div",{className:"pos-product-price",style:{whiteSpace:"nowrap"},children:[e.unitPrice.toLocaleString()," FRW"]})]})]},e.id)}),Et.length===0&&t.jsx("div",{style:{gridColumn:"1 / -1",textAlign:"center",color:"var(--text-secondary)",padding:"40px",fontSize:"1.2rem"},children:"No products found."})]})]}),t.jsxs("div",{className:"pos-panel pos-cart-panel",children:[t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",margin:"0 0 20px 0"},children:[t.jsx("h2",{style:{margin:0,fontSize:"1.5rem"},children:L?`Table: ${Wt}`:"New Order"}),t.jsxs("div",{style:{display:"flex",gap:"8px"},children:[t.jsxs("button",{className:"btn-secondary btn-sm",onClick:()=>f("dashboard"),style:{padding:"8px 12px",display:"flex",alignItems:"center",gap:"6px"},children:[t.jsx(se,{size:16})," Home"]}),t.jsx("button",{className:"btn-secondary btn-sm",onClick:Bt,disabled:v.length===0,style:{padding:"8px 12px",display:"flex",alignItems:"center",gap:"6px"},children:L?t.jsxs(t.Fragment,{children:[t.jsx(pe,{size:16})," Update"]}):t.jsxs(t.Fragment,{children:[t.jsx(de,{size:16})," Hold"]})})]})]}),t.jsxs("div",{className:"pos-cart-list",children:[v.map(e=>{const s=q(e);return t.jsxs("div",{className:"pos-cart-item",children:[t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start"},children:[t.jsxs("div",{style:{flex:1,paddingRight:"10px"},children:[t.jsx("div",{style:{fontWeight:"600",fontSize:"0.95rem",color:"var(--text-primary)"},children:e.productName}),t.jsxs("div",{style:{fontSize:"0.85rem",color:"var(--text-secondary)",marginTop:"4px"},children:[e.unitPrice.toLocaleString()," FRW",s>0&&t.jsxs("span",{style:{color:"var(--danger)",marginLeft:"5px",fontWeight:"bold"},children:["(-",s.toLocaleString(),")"]})]})]}),t.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"10px"},children:[t.jsx("button",{onClick:()=>_t(e.productId,-1),className:"pos-qty-btn",children:"-"}),t.jsx("input",{type:"number",step:"0.01",value:e.quantity,onChange:i=>_e(e.productId,i.target.value),style:{width:"50px",textAlign:"center",border:"none",background:"transparent",fontWeight:"bold",fontSize:"1.1rem"}}),e.unit&&e.unit!=="Pcs"&&t.jsx("span",{style:{fontSize:"0.8rem",color:"var(--text-secondary)"},children:e.unit}),t.jsx("button",{onClick:()=>_t(e.productId,1),className:"pos-qty-btn plus",children:"+"})]})]}),t.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginTop:"10px",opacity:.8},children:[t.jsx("span",{style:{fontSize:"0.75rem",color:"var(--text-secondary)",textTransform:"uppercase",letterSpacing:"0.5px"},children:"Disc:"}),t.jsx("input",{type:"text",placeholder:"% or FRW",value:e.discount,onChange:i=>Ee(e.productId,i.target.value),style:{padding:"4px 8px",fontSize:"0.8rem",borderRadius:"6px",border:"1px solid var(--border-color)",width:"80px",background:"transparent"}})]})]},e.productId)}),v.length===0?t.jsxs("div",{style:{textAlign:"center",color:"var(--text-secondary)",marginTop:"60px",fontSize:"1.1rem",display:"flex",flexDirection:"column",alignItems:"center",gap:"10px"},children:[t.jsx(ue,{size:48,style:{opacity:.3}}),"Cart is empty"]}):null]}),t.jsxs("div",{className:"pos-checkout-area",children:[t.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px",marginBottom:"20px"},children:[t.jsxs("select",{value:P,onChange:e=>Te(e.target.value),className:"pos-search-input",style:{padding:"10px 16px"},children:[t.jsx("option",{value:"",children:"Select Customer (Optional)"}),W.map(e=>t.jsxs("option",{value:e.id,children:[e.name," (",e.points||0," pts)"]},e.id))]}),t.jsx("input",{type:"text",placeholder:"Notes (Optional)",value:It,onChange:e=>tt(e.target.value),className:"pos-search-input",style:{padding:"10px 16px"}}),P&&((qt=W.find(e=>e.id===P))==null?void 0:qt.points)>0&&t.jsxs("div",{style:{display:"flex",gap:"10px",alignItems:"center",background:"rgba(79, 70, 229, 0.05)",padding:"12px",borderRadius:"12px",border:"1px dashed var(--primary)"},children:[t.jsxs("span",{style:{fontSize:"0.85rem",color:"var(--primary)",flex:1,fontWeight:"600"},children:["Redeem Points (Max ",W.find(e=>e.id===P).points,")",t.jsx("br",{}),t.jsx("small",{style:{opacity:.8},children:"1 pt = 10 FRW off"})]}),t.jsx("input",{type:"number",max:W.find(e=>e.id===P).points,min:"0",value:_,onChange:e=>$e(Math.min(parseInt(e.target.value)||0,W.find(s=>s.id===P).points)),style:{padding:"8px",borderRadius:"8px",border:"1px solid var(--primary)",width:"80px",textAlign:"center",fontWeight:"bold"}})]})]}),t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"},children:[t.jsx("span",{style:{fontSize:"1.25rem",fontWeight:"700",color:"var(--text-secondary)"},children:"Total"}),t.jsxs("span",{className:"pos-gradient-text",children:[Math.max(0,F-_*10).toLocaleString()," FRW"]})]}),t.jsx("div",{style:{display:"flex",gap:"12px",marginBottom:"12px"},children:t.jsxs("button",{className:"btn-primary",style:{flex:"1",padding:"16px",borderRadius:"16px",fontWeight:"bold",display:"flex",justifyContent:"center",alignItems:"center"},onClick:Bt,disabled:v.length===0,children:[t.jsx(ae,{size:18,style:{marginRight:"8px"}}),L?"Update Kitchen":"Send to Kitchen"]})}),t.jsxs("div",{style:{display:"flex",gap:"12px"},children:[t.jsxs("button",{className:"btn-secondary",style:{flex:"0 0 120px",padding:"16px",borderRadius:"16px",fontWeight:"bold",border:"2px solid var(--border-color)"},onClick:Oe,disabled:v.length===0,children:[t.jsx(ce,{size:18,style:{marginRight:"6px"}})," Bill"]}),t.jsx("button",{className:"pos-checkout-btn",style:{flex:"1"},onClick:()=>{T({Cash:0,Card:0,Momo:0}),ht(!0)},disabled:v.length===0,children:"Checkout"})]})]})]}),Pe&&t.jsx("div",{className:"modal-overlay",children:t.jsxs("div",{className:"modal-content",style:{maxWidth:"600px"},children:[t.jsx("h2",{children:"Open Orders / Tables"}),t.jsx("div",{style:{maxHeight:"400px",overflowY:"auto",margin:"15px 0"},children:et.length===0?t.jsx("div",{style:{color:"var(--text-secondary)",textAlign:"center",padding:"20px"},children:"No open orders."}):et.map(e=>{const s=JSON.parse(e.cartData),i=s.reduce((x,w)=>x+w.quantity,0),o=s.reduce((x,w)=>x+w.quantity*w.unitPrice,0);return t.jsxs("div",{style:{padding:"15px",border:"1px solid var(--border-color)",borderRadius:"8px",marginBottom:"10px",display:"flex",justifyContent:"space-between",alignItems:"center"},children:[t.jsxs("div",{children:[t.jsx("div",{style:{fontWeight:"bold"},children:e.name}),t.jsxs("div",{style:{fontSize:"0.85rem",color:"var(--text-secondary)"},children:["Waiter: ",e.waiterName||"Unknown"," | ",i," items - ",o.toLocaleString()," FRW",t.jsx("br",{}),"Updated: ",new Date(e.updatedAt||e.createdAt).toLocaleTimeString()]})]}),t.jsxs("div",{style:{display:"flex",gap:"8px"},children:[t.jsx("button",{className:"btn-primary btn-sm",onClick:()=>Ot(e),children:"Resume"}),t.jsx("button",{className:"btn-secondary btn-sm btn-danger",onClick:()=>Be(e.id),children:"Delete"})]})]},e.id)})}),t.jsx("div",{style:{textAlign:"right"},children:t.jsx("button",{className:"btn-secondary",onClick:()=>Dt(!1),children:"Close"})})]})}),Ie&&t.jsx("div",{className:"modal-overlay",children:t.jsxs("div",{className:"modal-content",style:{maxWidth:"560px"},children:[t.jsx("h2",{children:"Payment"}),t.jsxs("div",{style:{fontSize:"1.5rem",fontWeight:"bold",textAlign:"center",margin:"16px 0"},children:["Total: ",B.toLocaleString()," FRW"]}),t.jsxs("div",{style:{display:"flex",gap:"8px",marginBottom:"16px"},children:[t.jsxs("button",{className:"btn-secondary",style:{flex:1,padding:"10px",fontSize:"0.85rem",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"},onClick:()=>{T({Cash:B,Card:0,Momo:0}),U("Cash")},children:[t.jsx(ie,{size:16})," All Cash"]}),t.jsxs("button",{className:"btn-secondary",style:{flex:1,padding:"10px",fontSize:"0.85rem",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"},onClick:()=>{T({Cash:0,Card:0,Momo:B}),U("Momo")},children:[t.jsx(xe,{size:16})," All Momo"]}),t.jsxs("button",{className:"btn-secondary",style:{flex:1,padding:"10px",fontSize:"0.85rem",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"},onClick:()=>{T({Cash:0,Card:B,Momo:0}),U("Card")},children:[t.jsx(le,{size:16})," All Card"]})]}),t.jsxs("div",{style:{display:"flex",gap:"16px",marginBottom:"16px"},children:[t.jsx("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:"10px"},children:[{key:"Cash",label:"Cash (FRW)"},{key:"Card",label:"Card (FRW)"},{key:"Momo",label:"MoMo (FRW)"}].map(e=>t.jsxs("div",{onClick:()=>U(e.key),style:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",borderRadius:"8px",cursor:"pointer",border:z===e.key?"2px solid var(--primary)":"1px solid var(--border-color)",background:z===e.key?"rgba(79,70,229,0.04)":"transparent",transition:"all 0.15s ease"},children:[t.jsx("label",{style:{fontWeight:"600",fontSize:"0.9rem",color:z===e.key?"var(--primary)":"var(--text-primary)"},children:e.label}),t.jsx("input",{type:"number",min:"0",value:g[e.key],onChange:s=>T({...g,[e.key]:s.target.value}),onFocus:()=>U(e.key),style:{padding:"8px",borderRadius:"6px",border:"1px solid var(--border-color)",width:"120px",textAlign:"right",fontWeight:"bold",fontSize:"1.1rem"}})]},e.key))}),t.jsxs("div",{style:{width:"180px",flexShrink:0},children:[t.jsxs("div",{className:"tender-presets",style:{marginBottom:"8px"},children:[t.jsx("button",{className:"tender-preset-btn",onClick:()=>T({...g,[z]:B}),children:"Exact"}),t.jsx("button",{className:"tender-preset-btn",onClick:()=>T({...g,[z]:5e3}),children:"5K"}),t.jsx("button",{className:"tender-preset-btn",onClick:()=>T({...g,[z]:1e4}),children:"10K"}),t.jsx("button",{className:"tender-preset-btn",onClick:()=>T({...g,[z]:2e4}),children:"20K"}),t.jsx("button",{className:"tender-preset-btn",onClick:()=>T({...g,[z]:5e4}),children:"50K"})]}),t.jsx("div",{className:"numpad-grid",children:["1","2","3","4","5","6","7","8","9","C","0","⌫"].map(e=>t.jsx("button",{className:`numpad-btn ${e==="C"?"numpad-clear":""}`,onClick:()=>{const s=String(g[z]||"");let i;e==="C"?i=0:e==="⌫"?i=s.length<=1?0:Number(s.slice(0,-1)):i=Number(s==="0"?e:s+e),T({...g,[z]:i})},children:e},e))})]})]}),t.jsxs("div",{style:{padding:"14px",background:wt>=0?"var(--success)":"var(--danger)",color:"#fff",borderRadius:"8px",marginBottom:"16px",display:"flex",justifyContent:"space-between",fontWeight:"bold",fontSize:"1.05rem"},children:[t.jsx("span",{children:wt>=0?"Change Due:":"Remaining Balance:"}),t.jsxs("span",{children:[Math.abs(wt).toLocaleString()," FRW"]})]}),t.jsxs("div",{style:{display:"flex",gap:"10px"},children:[t.jsx("button",{className:"btn-secondary",style:{flex:1,padding:"14px"},onClick:()=>ht(!1),children:"Cancel"}),t.jsx("button",{className:"btn-primary",style:{flex:1,padding:"14px"},onClick:qe,disabled:Ct<B,children:"Complete Sale"})]})]})}),We&&t.jsx("div",{className:"modal-overlay",children:t.jsxs("div",{className:"modal-content",style:{maxWidth:yt.length>0?"800px":"400px",width:"100%"},children:[t.jsx("h2",{children:"Save Table / Order"}),yt.length>0?t.jsx("div",{style:{maxHeight:"60vh",overflowY:"auto",marginBottom:"20px"},children:Object.entries(yt.reduce((e,s)=>(e[s.zone]||(e[s.zone]=[]),e[s.zone].push(s),e),{})).map(([e,s])=>t.jsxs("div",{style:{marginBottom:"20px"},children:[t.jsx("h3",{style:{borderBottom:"1px solid var(--border-color)",paddingBottom:"8px",marginBottom:"15px"},children:e}),t.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(120px, 1fr))",gap:"15px"},children:s.map(i=>{const o=et.find(x=>x.name===i.name);return t.jsxs("div",{onClick:()=>{nt(i.name)},onDoubleClick:async()=>{nt(i.name),setTimeout(vt,50)},style:{padding:"15px",borderRadius:"8px",border:V===i.name?"3px solid var(--primary)":"1px solid var(--border-color)",backgroundColor:o?"var(--danger-hover)":"var(--card-bg)",color:o?"var(--danger)":"var(--text-primary)",cursor:"pointer",textAlign:"center",boxShadow:V===i.name?"0 0 0 2px rgba(99,102,241,0.2)":"none"},children:[t.jsx("div",{style:{fontWeight:"bold",fontSize:"1.1rem",marginBottom:"8px"},children:i.name}),t.jsx("div",{style:{fontSize:"0.8rem",color:o?"var(--danger)":"var(--text-secondary)"},children:o?`Occupied by ${o.waiterName||"Unknown"}`:`${i.seats} Seats`})]},i.id)})})]},e))}):t.jsx("p",{style:{color:"var(--text-secondary)",marginBottom:"20px"},children:"Enter a name to identify this table or customer."}),t.jsx("input",{type:"text",value:V,onChange:e=>nt(e.target.value),placeholder:"Selected table or enter custom name...",autoFocus:!0,onKeyDown:e=>{e.key==="Enter"&&vt()},style:{width:"100%",padding:"12px",borderRadius:"8px",border:"1px solid var(--border-color)",marginBottom:"20px",fontSize:"1.1rem"}}),t.jsxs("div",{style:{display:"flex",gap:"10px"},children:[t.jsx("button",{className:"btn-secondary",style:{flex:1},onClick:()=>gt(!1),children:"Cancel"}),t.jsx("button",{className:"btn-primary",style:{flex:1},onClick:vt,children:"Save Order"})]})]})})]})}const ke=d.createContext(null),Ae=({children:n})=>{const[r,a]=d.useState([]),l=(c,p="info",m=3e3)=>{const h=Date.now();a(f=>[...f,{id:h,message:c,type:p}]),m>0&&setTimeout(()=>{a(f=>f.filter(y=>y.id!==h))},m)},u=c=>{a(p=>p.filter(m=>m.id!==c))};return t.jsxs(ke.Provider,{value:{showToast:l},children:[n,t.jsx("div",{style:{position:"fixed",bottom:"20px",right:"20px",zIndex:9999,display:"flex",flexDirection:"column",gap:"10px"},children:r.map(c=>t.jsxs("div",{style:{background:c.type==="error"?"var(--danger)":c.type==="success"?"var(--success)":"var(--primary)",color:"#fff",padding:"12px 20px",borderRadius:"8px",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",display:"flex",justifyContent:"space-between",alignItems:"center",minWidth:"250px",animation:"slideIn 0.3s ease-out"},children:[t.jsx("span",{children:c.message}),t.jsx("button",{onClick:()=>u(c.id),style:{background:"transparent",border:"none",color:"#fff",cursor:"pointer",fontSize:"1.2rem",marginLeft:"10px"},children:"×"})]},c.id))}),t.jsx("style",{children:`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `})]})};window.RitaPlugin={mount:(n,r)=>{const l=window.ReactDOM.createRoot(n);l.render(t.jsx(Ae,{children:t.jsx(Se,{children:t.jsx(Ne,{...r.appProps})})})),window.RitaPlugin._root=l},unmount:()=>{const n=window.RitaPlugin._root;n&&n.unmount()}}})(React);
