(function(c){"use strict";var lt={exports:{}},V={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Ot=c,Wt=Symbol.for("react.element"),Bt=Symbol.for("react.fragment"),zt=Object.prototype.hasOwnProperty,Ft=Ot.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,Et={key:!0,ref:!0,__self:!0,__source:!0};function ct(e,n,s){var a,r={},l=null,d=null;s!==void 0&&(l=""+s),n.key!==void 0&&(l=""+n.key),n.ref!==void 0&&(d=n.ref);for(a in n)zt.call(n,a)&&!Et.hasOwnProperty(a)&&(r[a]=n[a]);if(e&&e.defaultProps)for(a in n=e.defaultProps,n)r[a]===void 0&&(r[a]=n[a]);return{$$typeof:Wt,type:e,key:l,ref:d,props:r,_owner:Ft.current}}V.Fragment=Bt,V.jsx=ct,V.jsxs=ct,lt.exports=V;var t=lt.exports;/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pt=(...e)=>e.filter((n,s,a)=>!!n&&n.trim()!==""&&a.indexOf(n)===s).join(" ").trim();/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ht=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Vt=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(n,s,a)=>a?a.toUpperCase():s.toLowerCase());/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ut=e=>{const n=Vt(e);return n.charAt(0).toUpperCase()+n.slice(1)};/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Z={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $t=e=>{for(const n in e)if(n.startsWith("aria-")||n==="role"||n==="title")return!0;return!1},Qt=c.createContext({}),Ut=()=>c.useContext(Qt),Xt=c.forwardRef(({color:e,size:n,strokeWidth:s,absoluteStrokeWidth:a,className:r="",children:l,iconNode:d,...p},h)=>{const{size:y=24,strokeWidth:i=2,absoluteStrokeWidth:u=!1,color:x="currentColor",className:m=""}=Ut()??{},f=a??u?Number(s??i)*24/Number(n??y):s??i;return c.createElement("svg",{ref:h,...Z,width:n??y??Z.width,height:n??y??Z.height,stroke:e??x,strokeWidth:f,className:pt("lucide",m,r),...!l&&!$t(p)&&{"aria-hidden":"true"},...p},[...d.map(([k,b])=>c.createElement(k,b)),...Array.isArray(l)?l:[l]])});/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=(e,n)=>{const s=c.forwardRef(({className:a,...r},l)=>c.createElement(Xt,{ref:l,iconNode:n,className:pt(`lucide-${Ht(ut(e))}`,`lucide-${e}`,a),...r}));return s.displayName=ut(e),s};/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Yt=I("banknote",[["rect",{width:"20",height:"12",x:"2",y:"6",rx:"2",key:"9lu3g6"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}],["path",{d:"M6 12h.01M18 12h.01",key:"113zkx"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Jt=I("circle-pause",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"10",x2:"10",y1:"15",y2:"9",key:"c1nkhi"}],["line",{x1:"14",x2:"14",y1:"15",y2:"9",key:"h65svq"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xt=I("credit-card",[["rect",{width:"20",height:"14",x:"2",y:"5",rx:"2",key:"ynyp8z"}],["line",{x1:"2",x2:"22",y1:"10",y2:"10",key:"1b3vmo"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Kt=I("folder-open",[["path",{d:"m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",key:"usdka0"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qt=I("minus",[["path",{d:"M5 12h14",key:"1ays0h"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Zt=I("plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Gt=I("printer",[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const te=I("save",[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",key:"1c8476"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",key:"1ydtos"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7",key:"t51u73"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ee=I("shopping-cart",[["circle",{cx:"8",cy:"21",r:"1",key:"jimo8o"}],["circle",{cx:"19",cy:"21",r:"1",key:"13723u"}],["path",{d:"M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12",key:"9zh506"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ne=I("smartphone",[["rect",{width:"14",height:"20",x:"5",y:"2",rx:"2",ry:"2",key:"1yt0o3"}],["path",{d:"M12 18h.01",key:"mhygvu"}]]);/**
 * @license lucide-react v1.23.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const oe=I("x",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);let $;const se=new Uint8Array(16);function ae(){if(!$&&($=typeof crypto<"u"&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto),!$))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return $(se)}const N=[];for(let e=0;e<256;++e)N.push((e+256).toString(16).slice(1));function re(e,n=0){return N[e[n+0]]+N[e[n+1]]+N[e[n+2]]+N[e[n+3]]+"-"+N[e[n+4]]+N[e[n+5]]+"-"+N[e[n+6]]+N[e[n+7]]+"-"+N[e[n+8]]+N[e[n+9]]+"-"+N[e[n+10]]+N[e[n+11]]+N[e[n+12]]+N[e[n+13]]+N[e[n+14]]+N[e[n+15]]}const mt={randomUUID:typeof crypto<"u"&&crypto.randomUUID&&crypto.randomUUID.bind(crypto)};function ie(e,n,s){if(mt.randomUUID&&!e)return mt.randomUUID();e=e||{};const a=e.random||(e.rng||ae)();return a[6]=a[6]&15|64,a[8]=a[8]&63|128,re(a)}const de=(e,n,s,a,r,l,d={},p=null)=>{const h=new Date().toLocaleString(),y=e.map(C=>{const O=C.quantity*C.unitPrice,B=C.discountAmount||0,z=O-B;return`
    <tr>
      <td style="padding: 4px 0;">
        ${C.productName} (${C.taxTyCd==="A"?"A":"B"})<br>
        <small>${C.quantity}${C.unit&&C.unit!=="Pcs"?" "+C.unit:""} x ${C.unitPrice.toLocaleString()}</small>
        ${B>0?`<br><small style="color: #666;">Disc: -${B.toLocaleString()}</small>`:""}
      </td>
      <td style="text-align: right; vertical-align: bottom; padding: 4px 0;">${z.toLocaleString()}</td>
    </tr>
  `}).join(""),{tin:i="",rcptSign:u="",intrlData:x="",rcptNo:m="",sdcId:f="",mrcNo:k="",taxblAmtA:b=0,taxblAmtB:U=0,taxAmtB:S=0}=d,tt=`https://myrra.rra.gov.rw/receipt?tin=${i}&rcptNo=${m}&sdcId=${f}&sign=${u}`;return`
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
        <h1>${d.businessName||"RITA SALES"}</h1>
        ${d.businessAddress?`<div>${d.businessAddress}</div>`:""}
        ${d.businessPhone?`<div>Tel: ${d.businessPhone}</div>`:""}
      </div>
      
      <div class="rra-header">
        <div>TIN: ${i}</div>
        <div>Welcome to RRA EBM System</div>
      </div>

      <div class="info">
        <div>Receipt No: ${m}</div>
        <div>Date: ${h}</div>
        <div>Payment: ${p?Object.entries(p).filter(([C,O])=>O>0).map(([C,O])=>`${C} (${O.toLocaleString()})`).join(", "):a}</div>
        ${r?`<div>Customer: ${r}</div>`:""}
        ${l?`<div>Served by: ${l}</div>`:""}
      </div>

      <table>
        <thead>
          <tr>
            <th>Item (Tax)</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${y}
        </tbody>
      </table>

      <div class="totals">
        TOTAL DUE: ${n.toLocaleString()} FRW
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
            <td style="text-align: right">${b.toLocaleString()}</td>
            <td style="text-align: right">0</td>
          </tr>
          <tr>
            <td>B (18%)</td>
            <td style="text-align: right">${Math.round(U).toLocaleString()}</td>
            <td style="text-align: right">${Math.round(S).toLocaleString()}</td>
          </tr>
          <tr>
            <td colspan="3" style="border-top: 1px dotted #000; padding-top: 3px;"></td>
          </tr>
          <tr style="font-weight: bold;">
            <td>TOTAL TAX</td>
            <td style="text-align: right">${Math.round(b+U).toLocaleString()}</td>
            <td style="text-align: right">${Math.round(S).toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <div class="rra-footer">
        <div>SDC ID: ${f}</div>
        <div>Receipt Signature:</div>
        <div style="font-weight: bold; margin: 5px 0;">${u}</div>
        <div>Internal Data:</div>
        <div style="font-weight: bold; margin: 5px 0;">${x}</div>
        <div>MRC: ${k}</div>
      </div>

      <div class="qr-code">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(tt)}" alt="QR Code" />
      </div>

      <div class="footer">
        Thank you for your business!<br>
        Please come again.
      </div>
    </body>
    </html>
  `},le=(e,n,s,a,r={},l="")=>{const d=new Date().toLocaleString(),p=e.map(h=>{const y=h.quantity*h.unitPrice,i=h.discountAmount||0,u=y-i;return`
    <tr>
      <td style="padding: 4px 0;">
        ${h.productName}<br>
        <small>${h.quantity}${h.unit&&h.unit!=="Pcs"?" "+h.unit:""} x ${h.unitPrice.toLocaleString()}</small>
        ${i>0?`<br><small style="color: #666;">Disc: -${i.toLocaleString()}</small>`:""}
      </td>
      <td style="text-align: right; vertical-align: bottom; padding: 4px 0;">${u.toLocaleString()}</td>
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
        <h1>${r.businessName||"RITA SALES"}</h1>
        ${r.businessAddress?`<div>${r.businessAddress}</div>`:""}
        ${r.businessPhone?`<div>Tel: ${r.businessPhone}</div>`:""}
        <div style="font-weight: bold; font-size: 14px; margin-top: 10px;">PROFORMA BILL</div>
      </div>
      
      <div class="info">
        <div>Date: ${d}</div>
        ${l?`<div><strong>Table/Order: ${l}</strong></div>`:""}
        ${s?`<div>Customer: ${s}</div>`:""}
        ${a?`<div>Waiter: ${a}</div>`:""}
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${p}
        </tbody>
      </table>

      <div class="totals">
        TOTAL: ${n.toLocaleString()} FRW
      </div>

      <div class="footer">
        This is not a fiscal receipt.<br>
        Please review your bill before payment.
      </div>
    </body>
    </html>
  `},ce={getVsdcUrl(){return localStorage.getItem("vsdcUrl")||"http://localhost:8080"},async saveSales(e){const n=`${this.getVsdcUrl()}/trnsSales/saveSales`;try{const s=await fetch(n,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e)});if(!s.ok)throw console.warn("VSDC API responded with error:",s.status,s.statusText),new Error(`VSDC error: ${s.status}`);return await s.json()}catch(s){throw console.error("VSDC connection failed:",s),s}},async saveStockItems(e){const n=`${this.getVsdcUrl()}/saveStockItems/saveStockItems`;try{const s=await fetch(n,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e)});if(!s.ok)throw new Error(`VSDC error: ${s.status}`);return await s.json()}catch(s){throw console.error("VSDC connection failed:",s),s}}};function G({variant:e="secondary",size:n="md",icon:s,children:a,className:r="",...l}){return t.jsxs("button",{className:`ui-btn ui-btn-${e} ui-btn-${n} ${r}`.trim(),...l,children:[s&&t.jsx("span",{className:"ui-btn-icon",children:s}),a&&t.jsx("span",{className:"ui-btn-label",children:a})]})}function pe({tone:e="neutral",children:n,className:s=""}){return t.jsx("span",{className:`ui-badge ui-badge-${e} ${s}`.trim(),children:n})}function Q({title:e,children:n,onClose:s,isOpen:a,size:r="md"}){const l=c.useRef(null);return c.useEffect(()=>{const d=p=>{if(p.key==="Escape"&&a&&s(),p.key==="Tab"&&l.current){const h=Array.from(l.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(u=>!u.disabled);if(h.length===0)return;const y=h[0],i=h[h.length-1];p.shiftKey&&document.activeElement===y?(p.preventDefault(),i.focus()):!p.shiftKey&&document.activeElement===i&&(p.preventDefault(),y.focus())}};return a&&(window.addEventListener("keydown",d),document.body.classList.add("modal-open"),setTimeout(()=>{if(!l.current)return;const p=l.current.querySelector("input, textarea, select, button");p&&p.focus()},50)),()=>{window.removeEventListener("keydown",d),document.body.classList.remove("modal-open")}},[a,s]),a?t.jsx("div",{className:"modal-overlay",onClick:s,children:t.jsxs("div",{className:"modal-content modal-"+r,onClick:d=>d.stopPropagation(),ref:l,role:"dialog","aria-modal":"true","aria-label":e,children:[t.jsxs("div",{className:"modal-header",children:[t.jsx("h2",{children:e}),t.jsx(G,{variant:"ghost",size:"sm",icon:t.jsx(oe,{size:18}),onClick:s,"aria-label":"Close"})]}),n]})}):null}const ht=c.createContext(null),ue=({children:e})=>{const[n,s]=c.useState(!1),[a,r]=c.useState(""),l=c.useRef(null),d=c.useCallback(y=>new Promise(i=>{r(y),s(!0),l.current=i}),[]),p=()=>{l.current&&l.current(!0),s(!1)},h=()=>{l.current&&l.current(!1),s(!1)};return t.jsxs(ht.Provider,{value:{askConfirm:d},children:[e,t.jsxs(Q,{title:"Confirmation",isOpen:n,onClose:h,children:[t.jsx("p",{className:"confirm-message",children:a}),t.jsxs("div",{className:"modal-actions",children:[t.jsx(G,{variant:"secondary",onClick:h,children:"Cancel"}),t.jsx(G,{variant:"danger",onClick:p,children:"Confirm"})]})]})]})},gt=()=>{const e=c.useContext(ht);if(!e)throw new Error("useConfirm must be used within ConfirmProvider");return e};function yt({mode:e,shift:n,onSubmit:s,onCancel:a}){const[r,l]=c.useState(""),[d,p]=c.useState(null),{askConfirm:h}=gt();c.useEffect(()=>{e==="close"&&n&&n.id&&window.api.getExpectedCash(n.id).then(p).catch(console.error)},[e,n]);const y=async i=>{if(i.preventDefault(),!r||isNaN(r))return;const u=parseFloat(r);if(e==="close"&&d!==null&&u!==d){const x=u-d,m=x>0?`You are OVER by ${x.toLocaleString()} FRW.`:`You are SHORT by ${Math.abs(x).toLocaleString()} FRW.`;if(!await h(`Discrepancy Detected!

Expected Cash: ${d.toLocaleString()} FRW
Actual Cash: ${u.toLocaleString()} FRW

${m}

Are you sure you want to close this shift with this discrepancy?`))return}s(u)};return t.jsx("div",{style:{display:"flex",justifyContent:"center",alignItems:"center",height:"100%",background:"var(--bg-color)",color:"var(--text-color)"},children:t.jsx("div",{style:{background:"var(--card-bg)",padding:"40px",borderRadius:"12px",boxShadow:"0 4px 15px rgba(0,0,0,0.1)",maxWidth:"400px",width:"100%",textAlign:"center"},children:e==="open"?t.jsxs(t.Fragment,{children:[t.jsx("h2",{style:{marginBottom:"10px"},children:"Open Shift"}),t.jsx("p",{style:{color:"var(--text-secondary)",marginBottom:"30px"},children:"Declare your starting cash float to begin selling."}),t.jsxs("form",{onSubmit:y,children:[t.jsxs("div",{style:{marginBottom:"20px",textAlign:"left"},children:[t.jsx("label",{style:{display:"block",marginBottom:"8px",fontWeight:"bold"},children:"Starting Cash (FRW) *"}),t.jsx("input",{type:"number",value:r,onChange:i=>l(i.target.value),placeholder:"e.g. 10000",style:{width:"100%",padding:"12px",borderRadius:"6px",border:"1px solid var(--border-color)",fontSize:"1.2rem",boxSizing:"border-box"},required:!0})]}),t.jsx("button",{type:"submit",style:{width:"100%",padding:"12px",background:"var(--primary)",color:"#fff",border:"none",borderRadius:"6px",fontSize:"1.1rem",cursor:"pointer",fontWeight:"bold"},children:"Open Shift"})]})]}):t.jsxs(t.Fragment,{children:[t.jsx("h2",{style:{marginBottom:"10px",color:"var(--danger)"},children:"Close Shift"}),t.jsxs("p",{style:{color:"var(--text-secondary)",marginBottom:"20px"},children:["Shift opened at: ",new Date(n.openedAt).toLocaleTimeString(),t.jsx("br",{}),"Count the physical cash in your drawer."]}),t.jsxs("form",{onSubmit:y,children:[t.jsxs("div",{style:{marginBottom:"20px",textAlign:"left"},children:[t.jsx("label",{style:{display:"block",marginBottom:"8px",fontWeight:"bold"},children:"Actual Cash Counted (FRW) *"}),t.jsx("input",{type:"number",value:r,onChange:i=>l(i.target.value),placeholder:"Enter actual cash",style:{width:"100%",padding:"12px",borderRadius:"6px",border:"1px solid var(--border-color)",fontSize:"1.2rem",boxSizing:"border-box"},required:!0})]}),d!==null&&r&&!isNaN(r)&&parseFloat(r)!==d&&t.jsxs("div",{style:{padding:"10px",background:"var(--danger)",color:"white",borderRadius:"6px",marginBottom:"20px",fontSize:"0.9rem"},children:["Warning: The expected cash amount in drawer is ",d.toLocaleString()," FRW. You have a discrepancy of ",(parseFloat(r)-d).toLocaleString()," FRW."]}),t.jsxs("div",{style:{display:"flex",gap:"10px"},children:[t.jsx("button",{type:"button",onClick:a,style:{flex:1,padding:"12px",background:"#e2e8f0",color:"#000",border:"none",borderRadius:"6px",fontSize:"1.1rem",cursor:"pointer",fontWeight:"bold"},children:"Cancel"}),t.jsx("button",{type:"submit",style:{flex:1,padding:"12px",background:"var(--danger)",color:"#fff",border:"none",borderRadius:"6px",fontSize:"1.1rem",cursor:"pointer",fontWeight:"bold"},children:"Close Shift"})]})]})]})})})}function xe({leftPanel:e,rightPanel:n}){return t.jsxs("div",{className:"pos-container",children:[t.jsx("div",{className:"pos-panel pos-products-panel",children:e}),t.jsx("div",{className:"pos-panel pos-cart-panel",children:n})]})}const ft=c.createContext(null),me=()=>c.useContext(ft),he=({children:e})=>{const[n,s]=c.useState([]),a=(l,d="info",p=3e3)=>{const h=Date.now();s(y=>[...y,{id:h,message:l,type:d}]),p>0&&setTimeout(()=>{s(y=>y.filter(i=>i.id!==h))},p)},r=l=>{s(d=>d.filter(p=>p.id!==l))};return t.jsxs(ft.Provider,{value:{showToast:a},children:[e,t.jsx("div",{style:{position:"fixed",bottom:"20px",right:"20px",zIndex:9999,display:"flex",flexDirection:"column",gap:"10px"},children:n.map(l=>t.jsxs("div",{style:{background:l.type==="error"?"var(--danger)":l.type==="success"?"var(--success)":"var(--primary)",color:"#fff",padding:"12px 20px",borderRadius:"8px",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",display:"flex",justifyContent:"space-between",alignItems:"center",minWidth:"250px",animation:"slideIn 0.3s ease-out"},children:[t.jsx("span",{children:l.message}),t.jsx("button",{onClick:()=>r(l.id),style:{background:"transparent",border:"none",color:"#fff",cursor:"pointer",fontSize:"1.2rem",marginLeft:"10px"},children:"×"})]},l.id))}),t.jsx("style",{children:`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `})]})},bt=(e="success")=>{try{const n=window.AudioContext||window.webkitAudioContext;if(!n)return;const s=new n,a=s.createOscillator(),r=s.createGain();a.connect(r),r.connect(s.destination),e==="success"?(a.type="sine",a.frequency.setValueAtTime(800,s.currentTime),r.gain.setValueAtTime(.1,s.currentTime),a.start(),a.stop(s.currentTime+.1)):(a.type="sawtooth",a.frequency.setValueAtTime(300,s.currentTime),r.gain.setValueAtTime(.1,s.currentTime),a.start(),a.stop(s.currentTime+.3))}catch{}};function ge(e,n,s,a){const r=c.useRef(""),l=c.useRef(Date.now());c.useEffect(()=>{const d=p=>{if(p.target.tagName==="INPUT"||p.target.tagName==="TEXTAREA"||p.target.tagName==="SELECT")return;const h=Date.now();if(h-l.current>50&&(r.current=""),l.current=h,p.key==="Enter"){if(r.current.length>0){const y=r.current;let i=e.find(x=>x.barcode===y),u=null;if(!i&&y.length===13&&/^2[0-9]/.test(y)){const x=y.substring(0,7),m=y.substring(7,12);i=e.find(f=>f.barcode&&f.barcode.startsWith(x)),i&&(u=parseInt(m,10))}i?(n(i,u),bt("success")):(bt("error"),a?a(`Barcode ${y} not found in database!`):alert(`Barcode ${y} not found in database!`)),r.current=""}}else p.key.length===1&&(r.current+=p.key)};return window.addEventListener("keydown",d),()=>window.removeEventListener("keydown",d)},[e,n,s])}function ye(e){const[n,s]=c.useState([]),a=(i,u=null)=>{i.stockQuantity<=0&&!u||s(x=>{const m=u!==null?u:i.unitPrice,f=1,k=x.find(b=>b.productId===i.id&&b.unitPrice===m);return k&&u===null?k.quantity>=i.stockQuantity?x:x.map(b=>b.productId===i.id?{...b,quantity:b.quantity+1}:b):[...x,{productId:i.id+(u?"-"+Date.now():""),originalProductId:i.id,productName:i.productName+(u?" (Scale Item)":""),category:i.category,unitPrice:m,costPrice:i.costPrice,taxTyCd:i.taxTyCd||"B",itemCd:i.itemCd,itemClsCd:i.itemClsCd,unit:i.unit||"Pcs",quantity:f,discount:"",status:"pending"}]})},r=(i,u)=>{s(x=>x.map(m=>{if(m.productId===i){const f=m.quantity+u,k=e.find(b=>b.id===i);return k&&f>k.stockQuantity?m:{...m,quantity:f>0?f:0}}return m}).filter(m=>m.quantity>0))},l=(i,u)=>{s(x=>x.map(m=>{if(m.productId===i){const f=parseFloat(u)||0,k=e.find(b=>b.id===m.originalProductId||b.id===m.productId);return k&&f>k.stockQuantity?m:{...m,quantity:f>0?f:0}}return m}).filter(m=>m.quantity>0))},d=(i,u)=>{s(x=>x.map(m=>m.productId===i?{...m,discount:u}:m))},p=i=>{const u=i.quantity*i.unitPrice;if(!i.discount)return 0;if(i.discount.includes("%")){const x=parseFloat(i.discount)||0;return u*x/100}return parseFloat(i.discount)||0},h=n.reduce((i,u)=>i+(u.quantity*u.unitPrice-p(u)),0);return{cart:n,setCart:s,addToCart:a,updateQuantity:r,setQuantity:l,updateDiscount:d,calculateItemDiscount:p,totalAmount:h,clearCart:()=>s([])}}function fe(e){const[n,s]=c.useState([]),[a,r]=c.useState(null),[l,d]=c.useState(""),p=async()=>{if(!e)return[];const x=await e.getHeldCarts();return s(x),x};return{heldCarts:n,activeOrderId:a,activeOrderName:l,loadHeldCarts:p,saveHeldCart:async(x,m,f)=>{a?await e.updateHeldCart(a,{cartData:JSON.stringify(x)}):await e.addHeldCart({name:m,cartData:JSON.stringify(x),waiterName:f})},restoreCart:async(x,m,f)=>m.length>0&&!a&&!await f()?null:(r(x.id),d(x.name),JSON.parse(x.cartData)),deleteHeldCart:async(x,m)=>await m()?(await e.deleteHeldCart(x),await p(),a===x?(r(null),d(""),!0):!1):!1,clearActiveOrder:()=>{r(null),d("")}}}const be=(e,n)=>{let s=0,a=0,r=0;return{itemList:e.map((d,p)=>{const h=d.quantity*d.unitPrice,y=n?n(d):0,i=d.discount&&d.discount.includes("%")&&parseFloat(d.discount)||0,u=h-y;let x=0,m=u;return d.taxTyCd==="B"?(x=u-u/1.18,m=u-x,a+=m,r+=x):s+=m,{itemSeq:p+1,itemCd:d.itemCd||"000000",itemClsCd:d.itemClsCd||"0000000",itemNm:d.productName,bcd:d.barcode||null,pkgUnitCd:"NT",pkg:1,qtyUnitCd:"U",qty:d.quantity,prc:d.unitPrice,splyAmt:h,dcRt:i,dcAmt:y,isrccCd:null,isrccNm:null,isrcRt:null,isrcAmt:null,taxTyCd:d.taxTyCd||"B",taxblAmt:parseFloat(m.toFixed(2)),taxAmt:parseFloat(x.toFixed(2)),totAmt:parseFloat(u.toFixed(2))}}),taxblAmtA:s,taxblAmtB:a,taxAmtB:r,totTaxblAmt:s+a,totTaxAmt:r,totAmt:s+a+r}},Ce=(e,n,s,a,r,l,d=null)=>{const{itemList:p,taxblAmtA:h,taxblAmtB:y,taxAmtB:i,totTaxblAmt:u,totTaxAmt:x,totAmt:m}=be(e,r);return(parseFloat(n.Cash)||0)+(parseFloat(n.Card)||0)+(parseFloat(n.Momo)||0),{rceipt:{tin:s,bhfId:"00",rcptNo:0,trdt:new Date().toISOString().split("T")[0].replace(/-/g,""),trtm:new Date().toISOString().split("T")[1].substring(0,8).replace(/:/g,""),rcptTyCd:"S",cuId:d?d.id:null,cuName:d?d.name:null,totRcptNo:0,taxblAmtA:h,taxblAmtB:y,taxblAmtC:0,taxblAmtD:0,taxAmtA:0,taxAmtB:i,taxAmtC:0,taxAmtD:0,totTaxblAmt:u,totTaxAmt:x,totAmt:m,prchrAcptcYn:"N",remark:null,tableNo:null,receiptId:l,itemSeq:p.length,itemList:p},taxblAmtA:h,taxblAmtB:y,taxAmtB:i,itemList:p}},_=e=>Number(e).toLocaleString(),ve={preparing:"warning",ready:"success",pending:"neutral"},we=c.memo(({item:e,dcAmt:n,onUpdateQuantity:s,onSetQuantity:a,onUpdateDiscount:r})=>t.jsxs("div",{className:"pos-cart-item",children:[t.jsxs("div",{className:"pos-cart-item-main",children:[t.jsxs("div",{className:"pos-cart-item-copy",children:[t.jsxs("div",{className:"pos-cart-item-title",children:[e.productName,e.status&&t.jsx(pe,{tone:ve[e.status]||"neutral",children:e.status})]}),t.jsxs("div",{className:"pos-cart-item-meta",children:[_(e.unitPrice)," FRW",n>0&&t.jsxs("span",{className:"pos-cart-discount",children:["-",_(n)]})]})]}),t.jsxs("div",{className:"pos-qty-control","aria-label":"Quantity for "+e.productName,children:[t.jsx("button",{type:"button",onClick:()=>s(e.productId,-1),className:"pos-qty-btn","aria-label":"Decrease quantity",children:t.jsx(qt,{size:16})}),t.jsx("input",{type:"number",step:"0.01",value:e.quantity,onChange:l=>a&&a(e.productId,l.target.value),style:{width:"50px",textAlign:"center",border:"none",background:"transparent",fontWeight:"bold"}}),e.unit&&e.unit!=="Pcs"&&t.jsx("span",{style:{fontSize:"0.8rem",color:"var(--text-secondary)",marginLeft:"2px"},children:e.unit}),t.jsx("button",{type:"button",onClick:()=>s(e.productId,1),className:"pos-qty-btn plus","aria-label":"Increase quantity",children:t.jsx(Zt,{size:16})})]})]}),t.jsxs("label",{className:"pos-discount-field",children:[t.jsx("span",{children:"Discount"}),t.jsx("input",{type:"text",placeholder:"% or FRW",value:e.discount,onChange:l=>r(e.productId,l.target.value)})]})]}));function Se({currentUser:e,categories:n=[],sales:s=[],onSave:a}){var Pt;const{showToast:r}=me(),{askConfirm:l}=gt(),[d,p]=c.useState([]),[h,y]=c.useState(""),[i,u]=c.useState(""),[x,m]=c.useState("Cash"),[f,k]=c.useState(""),[b,U]=c.useState([]),[S,tt]=c.useState(""),[C,O]=c.useState(0),[B,z]=c.useState(""),[je,Ct]=c.useState(!1),[Ne,X]=c.useState(!1),[g,M]=c.useState({Cash:0,Card:0,Momo:0,Credit:0}),[Y,et]=c.useState(null),[ke,vt]=c.useState(null),{cart:j,setCart:Ae,addToCart:wt,updateQuantity:Re,updateDiscount:Te,calculateItemDiscount:F,totalAmount:nt,clearCart:J}=ye(d),{heldCarts:St,activeOrderId:E,activeOrderName:ot,loadHeldCarts:jt,saveHeldCart:Nt,restoreCart:Pe,deleteHeldCart:kt,clearActiveOrder:st}=fe(window.api);ge(d,wt,!0,o=>r(o,"error"));const at=async()=>{if(!window.api)return;const o=await window.api.getProducts();p(o),await jt();const v=await window.api.getCustomers();if(U(v),e!=null&&e.id){const A=await window.api.getActiveShift(e.id);et(A)}};c.useEffect(()=>{e!=null&&e.id&&at()},[e==null?void 0:e.id]);const Ie=async o=>{const v=await window.api.openShift(e.id,o);et(v)},Me=async o=>{await window.api.closeShift(Y.id,o),et(null),vt(null)},[Le,K]=c.useState(!1),[rt,At]=c.useState("");if(e!=null&&e.id&&!Y)return t.jsx(yt,{mode:"open",onSubmit:Ie});if(ke==="close"&&Y)return t.jsx(yt,{mode:"close",shift:Y,onSubmit:Me,onCancel:()=>vt(null)});const De=async()=>{if(j.length!==0)try{E?(await Nt(j,ot,e.username),J(),k(""),z(""),st(),a&&a(),r("Order updated successfully","success")):(At(f||`Order-${Date.now().toString().slice(-4)}`),K(!0))}catch(o){r("Error saving order: "+o.message,"error")}},Rt=async()=>{if(!rt.trim()){r("Please enter a name for the order.","error");return}try{await Nt(j,rt,e.username),K(!1),J(),k(""),z(""),st(),await at(),r("Order suspended successfully","success")}catch(o){r("Error saving order: "+o.message,"error")}},_e=async()=>{if(j.length!==0)try{const o=j.map(W=>({...W,discountAmount:F(W)})),v=await window.api.getSetting("businessName")||"",A=await window.api.getSetting("businessAddress")||"",T=await window.api.getSetting("businessPhone")||"",R=le(o,nt,f,e.username,{businessName:v,businessAddress:A,businessPhone:T},ot),D=await window.api.getSetting("receiptPrinter"),P=await window.api.printReceipt(R,D||"");P.success||r("Failed to print bill: "+(P.errorType||"Unknown error"),"error")}catch(o){r("Error printing bill: "+o.message,"error")}},L=Math.max(0,(()=>{let o=j.reduce((A,T)=>A+T.unitPrice*T.quantity,0),v=j.reduce((A,T)=>A+F(T),0);return o-v})()-C*10),it=(Number(g.Cash)||0)+(Number(g.Card)||0)+(Number(g.Momo)||0)+(Number(g.Credit)||0),dt=it-L,Oe=async()=>{try{const o=await window.api.createStripeCheckout({amount:L,description:"Retail POS Sale"});o.success&&o.url?(window.open(o.url,"Stripe Checkout","width=500,height=700"),M({Cash:0,Card:L,Momo:0,Credit:0})):r("Stripe Error: "+(o.error||"Unknown Error"),"error")}catch(o){r("Stripe Error: "+o.message,"error")}},We=async()=>{if(j.length!==0){if(it<L){r("Insufficient payment amount.","error");return}try{const o=ie(),v=new Date().toISOString().split("T")[0],A=await window.api.getSetting("tin")||"999999999",T=await window.api.getSetting("businessName")||"",R=await window.api.getSetting("businessAddress")||"",D=await window.api.getSetting("businessPhone")||"",P=S?b.find(w=>w.id===S):null,W=Number(g.Credit)||0;if(W>0){if(!P){r("You must select a registered customer to use Store Credit.","error");return}if(!P.creditLimit||P.creditLimit<=0){r("This customer is not approved for store credit.","error");return}const w=P.accountBalance||0;if(w+W>P.creditLimit){r(`Credit limit exceeded! Customer can only borrow up to ${(P.creditLimit-w).toLocaleString()} FRW more.`,"error");return}}const{rceipt:q,taxblAmtA:Fe,taxblAmtB:Ee,taxAmtB:He,itemList:dn}=Ce(j,g,A,nt,F,o,P);q.pmtTyCd=Number(g.Cash)>=g.Card&&Number(g.Cash)>=g.Momo?"01":Number(g.Card)>=g.Momo?"02":"04",q.salesSttsCd="02",q.salesTyCd="N";const H=await ce.saveSales(q),It=H.data.rcptSign,Mt=H.data.intrlData,Lt=H.data.rcptNo;for(const w of j){const _t=F(w),Ue=w.discount.includes("%")&&parseFloat(w.discount)||0,Xe=w.quantity*w.unitPrice-_t;await window.api.addSale({productId:w.originalProductId||w.productId,productName:w.productName,category:w.category,quantity:w.quantity,unitPrice:w.unitPrice,costPrice:w.costPrice,totalPrice:Xe-(C>0?C*10/j.length:0),date:v,customerName:P?P.name:"",customerId:S||null,notes:B,paymentMethod:Number(g.Cash)>=g.Card&&Number(g.Cash)>=g.Momo&&Number(g.Cash)>=g.Credit?"Cash":Number(g.Card)>=g.Momo&&Number(g.Card)>=g.Credit?"Card":Number(g.Credit)>=g.Momo?"Store Credit":"Mobile Money",paymentDetails:JSON.stringify({Cash:Number(g.Cash)||0,Card:Number(g.Card)||0,"Mobile Money":Number(g.Momo)||0,"Store Credit":Number(g.Credit)||0}),discountAmount:_t,discountRate:Ue,receiptId:o,receiptSignature:It,internalData:Mt,receiptNo:Lt,waiterName:e.username},e.id)}C>0&&S&&await window.api.deductCustomerPoints(S,C),W>0&&S&&await window.api.adjustCustomerBalance(S,W);const Ve=j.map(w=>({...w,discountAmount:F(w)})),$e=de(Ve,nt,o,x,f,e.username,{tin:A,businessName:T,businessAddress:R,businessPhone:D,rcptSign:It,intrlData:Mt,rcptNo:Lt,sdcId:H.data.sdcId,mrcNo:H.data.mrcNo,taxblAmtA:Fe,taxblAmtB:Ee,taxAmtB:He},{Cash:Number(g.Cash)||0,Card:Number(g.Card)||0,"Mobile Money":Number(g.Momo)||0,"Store Credit":Number(g.Credit)||0}),Qe=await window.api.getSetting("receiptPrinter"),Dt=await window.api.printReceipt($e,Qe||"");Dt.success?r("Checkout complete and receipt printed!","success"):r("Checkout complete, but printing failed: "+(Dt.errorType||"Unknown error"),"error"),E&&await kt(E,()=>!0),J(),k(""),z(""),M({Cash:0,Card:0,Momo:0,Credit:0}),X(!1),st(),await at(),a&&a()}catch(o){r("Error during checkout: "+o.message,"error")}}},Tt=d.filter(o=>!(h&&o.category!==h||i&&!o.productName.toLowerCase().includes(i.toLowerCase()))),Be=t.jsxs(t.Fragment,{children:[t.jsxs("div",{className:"pos-search-bar",children:[t.jsx("input",{type:"text",placeholder:"Search products...",value:i,onChange:o=>u(o.target.value),className:"pos-search-input"}),t.jsxs("select",{value:h,onChange:o=>y(o.target.value),className:"pos-search-input",style:{flex:"0 0 200px"},children:[t.jsx("option",{value:"",children:"All Categories"}),n.map(o=>t.jsx("option",{value:o,children:o},o))]})]}),t.jsxs("div",{className:"pos-product-grid",children:[Tt.map(o=>{const v=o.stockQuantity<=0,A=o.stockQuantity>0&&o.stockQuantity<=5,T=o.category?o.category.charCodeAt(0)%5:0,R=v?"var(--bg-secondary)":`var(--pos-cat-${T})`;return t.jsxs("div",{onClick:()=>{v||wt(o,null)},className:`pos-product-card ${v?"out-of-stock":""}`,style:{background:R},children:[A&&t.jsx("div",{style:{position:"absolute",top:"-8px",right:"-8px",background:"#ff9800",color:"#fff",fontSize:"0.7rem",padding:"2px 6px",borderRadius:"10px",fontWeight:"bold",boxShadow:"0 2px 4px rgba(0,0,0,0.2)",zIndex:10},children:"LOW STOCK"}),t.jsxs("div",{children:[t.jsx("div",{style:{display:"inline-block",padding:"2px 6px",background:"var(--pos-cat-tag-bg)",borderRadius:"4px",fontSize:"0.65rem",fontWeight:"bold",textTransform:"uppercase",color:"var(--pos-cat-tag-text)",marginBottom:"4px",maxWidth:"100%",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},children:o.category||"Item"}),t.jsx("div",{className:"pos-product-title",style:{color:"var(--pos-card-title)"},children:o.productName})]}),t.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"flex-start",marginTop:"6px"},children:[t.jsxs("div",{style:{fontSize:"0.7rem",color:A?"#ff9800":"var(--text-secondary)",fontWeight:A?"bold":"normal",marginBottom:"2px"},children:["Stock: ",o.stockQuantity||0]}),t.jsxs("div",{className:"pos-product-price",style:{whiteSpace:"nowrap"},children:[_(o.unitPrice)," FRW"]})]})]},o.id)}),Tt.length===0&&t.jsx("div",{style:{gridColumn:"1 / -1",textAlign:"center",color:"var(--text-secondary)",padding:"40px",fontSize:"1.2rem"},children:"No products found."})]})]}),ze=t.jsxs(t.Fragment,{children:[t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",margin:"0 0 20px 0"},children:[t.jsx("h2",{style:{margin:0,fontSize:"1.5rem"},children:E?`Sale: ${ot}`:"New Sale"}),t.jsxs("div",{style:{display:"flex",gap:"8px"},children:[t.jsxs("button",{className:"btn-secondary btn-sm",onClick:()=>{jt(),Ct(!0)},style:{padding:"8px 12px",display:"flex",alignItems:"center",gap:"6px"},children:[t.jsx(Kt,{size:16})," Suspended"]}),t.jsx("button",{className:"btn-secondary btn-sm",onClick:De,disabled:j.length===0,style:{padding:"8px 12px",display:"flex",alignItems:"center",gap:"6px"},children:E?t.jsxs(t.Fragment,{children:[t.jsx(te,{size:16})," Update"]}):t.jsxs(t.Fragment,{children:[t.jsx(Jt,{size:16})," Suspend"]})})]})]}),t.jsxs("div",{className:"pos-cart-list",children:[j.map(o=>{const v=F(o);return t.jsx(we,{item:o,dcAmt:v,onUpdateQuantity:Re,onUpdateDiscount:Te},o.productId)}),j.length===0&&t.jsxs("div",{style:{textAlign:"center",color:"var(--text-secondary)",marginTop:"60px",fontSize:"1.1rem",display:"flex",flexDirection:"column",alignItems:"center",gap:"10px"},children:[t.jsx(ee,{size:48,style:{opacity:.3}})," Cart is empty"]})]}),t.jsxs("div",{className:"pos-checkout-area",children:[t.jsx("div",{style:{display:"grid",gridTemplateColumns:"1fr",gap:"15px",marginBottom:"20px"},children:t.jsxs("div",{className:"form-row",children:[t.jsx("label",{style:{display:"block",marginBottom:"5px"},children:"Customer"}),t.jsxs("select",{value:S,onChange:o=>tt(o.target.value),className:"pos-search-input",style:{padding:"10px 16px"},children:[t.jsx("option",{value:"",children:"Walk-in Customer"}),b.map(o=>t.jsx("option",{value:o.id,children:o.name},o.id))]})]})}),t.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px",marginBottom:"20px"},children:[t.jsx("input",{type:"text",placeholder:"Notes (Optional)",value:B,onChange:o=>z(o.target.value),className:"pos-search-input",style:{padding:"10px 16px"}}),S&&((Pt=b.find(o=>o.id===S))==null?void 0:Pt.points)>0&&t.jsxs("div",{style:{display:"flex",gap:"10px",alignItems:"center",background:"rgba(79, 70, 229, 0.05)",padding:"12px",borderRadius:"12px",border:"1px dashed var(--primary)"},children:[t.jsxs("span",{style:{fontSize:"0.85rem",color:"var(--primary)",flex:1,fontWeight:"600"},children:["Redeem Points (Max ",b.find(o=>o.id===S).points,")",t.jsx("br",{}),t.jsx("small",{style:{opacity:.8},children:"1 pt = 10 FRW off"})]}),t.jsx("input",{type:"number",max:b.find(o=>o.id===S).points,min:"0",value:C,onChange:o=>O(Math.min(parseInt(o.target.value)||0,b.find(v=>v.id===S).points)),style:{padding:"8px",borderRadius:"8px",border:"1px solid var(--primary)",width:"80px",textAlign:"center",fontWeight:"bold"}})]})]}),t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"},children:[t.jsx("span",{style:{fontSize:"1.25rem",fontWeight:"700",color:"var(--text-secondary)"},children:"Total"}),t.jsxs("span",{className:"pos-gradient-text",children:[_(L)," FRW"]})]}),t.jsxs("div",{style:{display:"flex",gap:"12px"},children:[t.jsxs("button",{className:"btn-secondary",style:{flex:"0 0 120px",padding:"16px",borderRadius:"16px",fontWeight:"bold",border:"2px solid var(--border-color)"},onClick:_e,disabled:j.length===0,children:[t.jsx(Gt,{size:18,style:{marginRight:"6px"}})," Bill"]}),t.jsx("button",{className:"pos-checkout-btn",style:{flex:"1"},onClick:()=>{M({Cash:0,Card:0,Momo:0,Credit:0}),X(!0)},disabled:j.length===0,children:"Checkout"})]})]})]});return t.jsxs(t.Fragment,{children:[t.jsx(xe,{leftPanel:Be,rightPanel:ze}),t.jsx(Q,{title:"Suspended Sales",isOpen:je,onClose:()=>Ct(!1),children:t.jsx("div",{style:{maxHeight:"400px",overflowY:"auto",margin:"15px 0"},children:St.length===0?t.jsx("div",{style:{color:"var(--text-secondary)",textAlign:"center",padding:"20px"},children:"No open orders."}):St.map(o=>{const v=JSON.parse(o.cartData),A=v.reduce((R,D)=>R+D.quantity,0),T=v.reduce((R,D)=>R+D.quantity*D.unitPrice,0);return t.jsxs("div",{style:{padding:"15px",border:"1px solid var(--border-color)",borderRadius:"8px",marginBottom:"10px",display:"flex",justifyContent:"space-between",alignItems:"center"},children:[t.jsxs("div",{children:[t.jsx("div",{style:{fontWeight:"bold"},children:o.name}),t.jsxs("div",{style:{fontSize:"0.85rem",color:"var(--text-secondary)"},children:["Waiter: ",o.waiterName||"Unknown"," | ",A," items - ",_(T)," FRW",t.jsx("br",{}),"Updated: ",new Date(o.updatedAt||o.createdAt).toLocaleTimeString()]})]}),t.jsxs("div",{style:{display:"flex",gap:"8px"},children:[t.jsx("button",{className:"btn-primary btn-sm",onClick:async()=>{const R=await Pe(o,j,()=>l("This will overwrite the current active cart. Continue?"));R&&Ae(R)},children:"Load"}),t.jsx("button",{className:"btn-secondary",style:{flex:1,color:"var(--danger-color)",borderColor:"var(--danger-color)"},onClick:async()=>{await kt(o.id,()=>l("Delete this open order permanently?"))&&J()},children:"Delete"})]})]},o.id)})})}),t.jsxs(Q,{title:"Payment",isOpen:Ne,onClose:()=>X(!1),children:[t.jsxs("div",{style:{fontSize:"1.5rem",fontWeight:"bold",textAlign:"center",margin:"20px 0"},children:["Total: ",_(L)," FRW"]}),t.jsxs("div",{style:{display:"flex",gap:"10px",marginBottom:"20px"},children:[t.jsxs("button",{className:"btn-secondary",style:{flex:1,padding:"8px",fontSize:"0.9rem",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"},onClick:()=>M({Cash:L,Card:0,Momo:0,Credit:0}),children:[t.jsx(Yt,{size:16})," All Cash"]}),t.jsxs("button",{className:"btn-secondary",style:{flex:1,padding:"8px",fontSize:"0.9rem",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"},onClick:()=>M({Cash:0,Card:0,Momo:L,Credit:0}),children:[t.jsx(ne,{size:16})," All MoMo"]}),t.jsxs("button",{className:"btn-secondary",style:{flex:1,padding:"8px",fontSize:"0.9rem",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"},onClick:()=>M({Cash:0,Card:L,Momo:0,Credit:0}),children:[t.jsx(xt,{size:16})," All Card"]}),S&&t.jsx("button",{className:"btn-secondary",style:{flex:1,padding:"8px",fontSize:"0.9rem",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",background:"var(--primary-color)",color:"white",border:"none"},onClick:()=>M({Cash:0,Card:0,Momo:0,Credit:L}),children:"All Credit"})]}),t.jsx("div",{style:{marginBottom:"20px"},children:t.jsxs("button",{className:"btn-primary",style:{width:"100%",padding:"12px",background:"#635BFF",color:"white",display:"flex",justifyContent:"center",alignItems:"center",gap:"8px",fontSize:"1.1rem"},onClick:Oe,children:[t.jsx(xt,{size:20})," Pay with Stripe"]})}),t.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"15px",marginBottom:"20px"},children:[t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[t.jsx("label",{style:{fontWeight:"bold"},children:"Cash (FRW)"}),t.jsx("input",{type:"number",min:"0",value:g.Cash,onChange:o=>M({...g,Cash:o.target.value}),style:{padding:"8px",borderRadius:"4px",border:"1px solid var(--border-color)",width:"150px",textAlign:"right"}})]}),t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[t.jsx("label",{style:{fontWeight:"bold"},children:"Card (FRW)"}),t.jsx("input",{type:"number",min:"0",value:g.Card,onChange:o=>M({...g,Card:o.target.value}),style:{padding:"8px",borderRadius:"4px",border:"1px solid var(--border-color)",width:"150px",textAlign:"right"}})]}),S&&t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid var(--border-color)",paddingBottom:"10px"},children:[t.jsx("label",{style:{fontWeight:"bold"},children:"Store Credit (FRW)"}),t.jsx("input",{type:"number",min:"0",value:g.Credit,onChange:o=>M({...g,Credit:o.target.value}),style:{padding:"8px",borderRadius:"4px",border:"1px solid var(--border-color)",width:"150px",textAlign:"right"}})]}),t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[t.jsx("label",{style:{fontWeight:"bold"},children:"Momo (FRW)"}),t.jsx("input",{type:"number",min:"0",value:g.Momo,onChange:o=>M({...g,Momo:o.target.value}),style:{padding:"8px",borderRadius:"4px",border:"1px solid var(--border-color)",width:"150px",textAlign:"right"}})]})]}),t.jsxs("div",{style:{padding:"15px",background:dt>=0?"var(--success)":"var(--danger)",color:"#fff",borderRadius:"8px",marginBottom:"20px",display:"flex",justifyContent:"space-between",fontWeight:"bold"},children:[t.jsx("span",{children:dt>=0?"Change Due:":"Remaining Balance:"}),t.jsxs("span",{children:[_(Math.abs(dt))," FRW"]})]}),t.jsxs("div",{style:{display:"flex",gap:"10px"},children:[t.jsx("button",{className:"btn-secondary",style:{flex:1},onClick:()=>X(!1),children:"Cancel"}),t.jsx("button",{className:"btn-primary",style:{flex:1},onClick:We,disabled:it<L,children:"Complete Sale"})]})]}),t.jsxs(Q,{title:"Save Suspended Sale",isOpen:Le,onClose:()=>K(!1),children:[t.jsx("p",{style:{color:"var(--text-secondary)",marginBottom:"15px"},children:"Enter a reference name for this suspended sale (e.g. Customer Name):"}),t.jsx("input",{type:"text",value:rt,onChange:o=>At(o.target.value),placeholder:"Order name...",autoFocus:!0,onKeyDown:o=>{o.key==="Enter"&&Rt()},style:{width:"100%",padding:"12px",borderRadius:"8px",border:"1px solid var(--border-color)",marginBottom:"20px",fontSize:"1.1rem"}}),t.jsxs("div",{style:{display:"flex",gap:"10px"},children:[t.jsx("button",{className:"btn-secondary",style:{flex:1},onClick:()=>K(!1),children:"Cancel"}),t.jsx("button",{className:"btn-primary",style:{flex:1},onClick:Rt,children:"Save"})]})]})]})}window.RitaPlugin={mount:(e,n)=>{const a=window.ReactDOM.createRoot(e);a.render(t.jsx(he,{children:t.jsx(ue,{children:t.jsx(Se,{...n.appProps})})})),window.RitaPlugin._root=a},unmount:()=>{const e=window.RitaPlugin._root;e&&e.unmount()}}})(React);
