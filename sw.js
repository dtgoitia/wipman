if(!self.define){let e,s={};const i=(i,n)=>(i=new URL(i+".js",n).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(n,o)=>{const r=e||("document"in self?document.currentScript.src:"")||location.href;if(s[r])return;let t={};const l=e=>i(e,r),d={module:{uri:r},exports:t,require:l};s[r]=Promise.all(n.map((e=>d[e]||l(e)))).then((e=>(o(...e),t)))}}define(["./workbox-27b29e6f"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"assets/index-64e0cbc7.css",revision:null},{url:"assets/index-a9a6b074.js",revision:null},{url:"assets/workbox-window.prod.es5-a7b12eab.js",revision:null},{url:"index.html",revision:"10375a7e07b8f43cb05a0113d8094882"},{url:"logo192.png",revision:"33dbdd0177549353eeeb785d02c294af"},{url:"logo512.png",revision:"917515db74ea8d1aee6a246cfbcc0b45"},{url:"vite.svg",revision:"7ae4ed8f8a0457e9e8722fd81e504747"},{url:"manifest.webmanifest",revision:"837fc49bf9fccde58d2a8b038ece8a6a"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
