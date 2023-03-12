/* eslint-disable import/no-import-module-exports */
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import React from 'react';
import Image from 'next/image';
import Script from 'next/script';
import { selectRandomPlaceholder } from '@/lib/utils';
import { VoteDataWithProjects } from '@/types/VoteData';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/lib/prisma';
import Button from '@/components/Button';

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { id } = context.query;

    if (!id || typeof id !== 'string' || id.length === 0) {
        return {
            notFound: true,
        };
    }

    const session = await getServerSession(
        context.req,
        context.res,
        authOptions,
    );

    if (!session) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }

    if (user.isAdmin) {
        return {
            redirect: {
                destination: `/vote/inspect/${id}`,
                permanent: false,
            },
        };
    }

    const vote = await prisma.vote.findUnique({
        where: { id },
        include: {
            voteFor: {
                include: {
                    logo: true,
                },
            },
            ballots: {
                where: {
                    userId: user.id,
                },
            },
        },
    });

    if (!vote) {
        return {
            notFound: true,
        };
    }

    if (!vote.open) {
        return {
            redirect: {
                destination: `/vote`,
                permanent: false,
            },
        };
    }

    // redirect if ballot has already been cast
    if (!vote.ballots || vote.ballots.length === 0 || vote.ballots[0].isCast) {
        return {
            redirect: {
                destination: `/vote`,
                permanent: false,
            },
        };
    }

    return {
        props: {
            userEmail: session.user.email,
            securityKey: vote.ballots[0].securityKey,
            vote: {
                id: vote.id,
                title: vote.title,
                description: vote.description ?? '',
                linkedForm: vote.linkedForm,
                voteFor: vote.voteFor.map((project) => ({
                    id: project.id,
                    title: project.title,
                    tagline: project.tagline,
                    description: project.description,
                    githubLink: project.githubLink,
                    websiteLink: project.websiteLink,
                    videoLink: project.videoLink,
                    logo: project.logo
                        ? {
                              id: project.logo?.id,
                              url: project.logo?.url,
                          }
                        : null,
                })),
            },
        },
    };
};

export default function InspectVote({
    userEmail,
    securityKey,
    vote,
}: {
    userEmail: string;
    securityKey: string;
    vote: VoteDataWithProjects;
}) {
    React.useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // prettier-ignore
        // eslint-disable-next-line
        !function(){!function(e){if(typeof window!=="undefined"){let t; var n=0; var o=!1; var i=!1; var a="message".length; var r="[iFrameSizer]"; var l=r.length; var d=null; var s=window.requestAnimationFrame; var m={max:1,scroll:1,bodyScroll:1,documentElementScroll:1}; var c={}; var u=null; var f={autoResize:!0,bodyBackground:null,bodyMargin:null,bodyMarginV1:8,bodyPadding:null,checkOrigin:!0,inPageLinks:!1,enablePublicMethods:!0,heightCalculationMethod:"bodyOffset",id:"iFrameResizer",interval:32,log:!1,maxHeight:1/0,maxWidth:1/0,minHeight:0,minWidth:0,mouseEvents:!0,resizeFrom:"parent",scrolling:!1,sizeHeight:!0,sizeWidth:!1,warningTimeout:5e3,tolerance:0,widthCalculationMethod:"scroll",onClose(){return!0},onClosed(){},onInit(){},onMessage(){v("onMessage function not defined")},onMouseEnter(){},onMouseLeave(){},onResized(){},onScroll(){return!0}}; var p={};window.jQuery&&((t=window.jQuery).fn?t.fn.iFrameResize||(t.fn.iFrameResize=function(e){return this.filter("iframe").each((function(t,n){W(n,e)})).end()}):x("","Unable to bind to jQuery, it is not fully loaded.")),typeof define==="function"&&define.amd?define([],B):typeof module==="object"&&typeof module.exports==="object"&&(module.exports=B()),window.iFrameResize=window.iFrameResize||B()}function h(){return window.MutationObserver||window.WebKitMutationObserver||window.MozMutationObserver}function g(e,t,n){e.addEventListener(t,n,!1)}function y(e,t,n){e.removeEventListener(t,n,!1)}function _(e){return `${r}[${function(e){let t=`Host page: ${e}`;return window.top!==window.self&&(t=window.parentIFrame&&window.parentIFrame.getId?`${window.parentIFrame.getId()}: ${e}`:`Nested host page: ${e}`),t}(e)}]`}function b(e){return c[e]?c[e].log:o}function w(e,t){k("log",e,t,b(e))}function x(e,t){k("info",e,t,b(e))}function v(e,t){k("warn",e,t,!0)}function k(e,t,n,o){!0===o&&typeof window.console==="object"&&console[e](_(t),n)}function I(e){function t(){i("Height"),i("Width"),R((function(){z(A),T(B),b("onResized",A)}),A,"init")}function n(e){return e.boxSizing!=="border-box"?0:(e.paddingTop?parseInt(e.paddingTop,10):0)+(e.paddingBottom?parseInt(e.paddingBottom,10):0)}function o(e){return e.boxSizing!=="border-box"?0:(e.borderTopWidth?parseInt(e.borderTopWidth,10):0)+(e.borderBottomWidth?parseInt(e.borderBottomWidth,10):0)}function i(e){const t=Number(c[B][`max${e}`]); const n=Number(c[B][`min${e}`]); const o=e.toLowerCase(); let i=Number(A[o]);w(B,`Checking ${o} is in range ${n}-${t}`),i<n&&(i=n,w(B,`Set ${o} to min value`)),i>t&&(i=t,w(B,`Set ${o} to max value`)),A[o]=`${i}`}function s(e){return P.substr(P.indexOf(":")+a+e)}function m(e,t){let n; let o; let i;n=function(){let n; let o;j("Send Page Info",`pageInfo:${n=document.body.getBoundingClientRect(),o=A.iframe.getBoundingClientRect(),JSON.stringify({iframeHeight:o.height,iframeWidth:o.width,clientHeight:Math.max(document.documentElement.clientHeight,window.innerHeight||0),clientWidth:Math.max(document.documentElement.clientWidth,window.innerWidth||0),offsetTop:parseInt(o.top-n.top,10),offsetLeft:parseInt(o.left-n.left,10),scrollTop:window.pageYOffset,scrollLeft:window.pageXOffset,documentHeight:document.documentElement.clientHeight,documentWidth:document.documentElement.clientWidth,windowHeight:window.innerHeight,windowWidth:window.innerWidth})}`,e,t)},o=32,p[i=t]||(p[i]=setTimeout((function(){p[i]=null,n()}),o))}function u(e){const t=e.getBoundingClientRect();return F(B),{x:Math.floor(Number(t.left)+Number(d.x)),y:Math.floor(Number(t.top)+Number(d.y))}}function f(e){const t=e?u(A.iframe):{x:0,y:0}; const n={x:Number(A.width)+t.x,y:Number(A.height)+t.y};w(B,`Reposition requested from iFrame (offset x:${t.x} y:${t.y})`),window.top!==window.self?window.parentIFrame?window.parentIFrame[`scrollTo${e?"Offset":""}`](n.x,n.y):v(B,"Unable to scroll to requested position, window.parentIFrame not found"):(d=n,h(),w(B,"--"))}function h(){!1!==b("onScroll",d)?T(B):M()}function _(e){let t={};if(Number(A.width)===0&&Number(A.height)===0){const n=s(9).split(":");t={x:n[1],y:n[0]}}else t={x:A.width,y:A.height};b(e,{iframe:A.iframe,screenX:Number(t.x),screenY:Number(t.y),type:A.type})}function b(e,t){return E(B,e,t)}let k; let I; let O; let W; let H; let L; var P=e.data; var A={}; var B=null;P==="[iFrameResizerChild]Ready"?function(){for(const e in c)j("iFrame requested init",N(e),c[e].iframe,e)}():r===(`${P}`).substr(0,l)&&P.substr(l).split(":")[0]in c?(O=P.substr(l).split(":"),W=O[1]?parseInt(O[1],10):0,H=c[O[0]]&&c[O[0]].iframe,L=getComputedStyle(H),A={iframe:H,id:O[0],height:W+n(L)+o(L),width:O[2],type:O[3]},B=A.id,c[B]&&(c[B].loaded=!0),(I=A.type in{true:1,false:1,undefined:1})&&w(B,"Ignoring init message from meta parent page"),!I&&function(e){let t=!0;return c[e]||(t=!1,v(`${A.type} No settings for ${e}. Message was: ${P}`)),t}(B)&&(w(B,`Received: ${P}`),k=!0,A.iframe===null&&(v(B,`IFrame (${A.id}) not found`),k=!1),k&&function(){let t; const n=e.origin; const o=c[B]&&c[B].checkOrigin;if(o&&`${n}`!="null"&&!(o.constructor===Array?function(){let e=0; let t=!1;for(w(B,`Checking connection is from allowed list of origins: ${o}`);e<o.length;e++)if(o[e]===n){t=!0;break}return t}():(t=c[B]&&c[B].remoteHost,w(B,`Checking connection is from: ${t}`),n===t)))throw new Error(`Unexpected message received from: ${n} for ${A.iframe.id}. Message was: ${e.data}. This error can be disabled by setting the checkOrigin: false option or by providing of array of trusted domains.`);return!0}()&&function(){switch(c[B]&&c[B].firstRun&&c[B]&&(c[B].firstRun=!1),A.type){case"close":C(A.iframe);break;case"message":a=s(6),w(B,`onMessage passed: {iframe: ${A.iframe.id}, message: ${a}}`),b("onMessage",{iframe:A.iframe,message:JSON.parse(a)}),w(B,"--");break;case"mouseenter":_("onMouseEnter");break;case"mouseleave":_("onMouseLeave");break;case"autoResize":c[B].autoResize=JSON.parse(s(9));break;case"scrollTo":f(!1);break;case"scrollToOffset":f(!0);break;case"pageInfo":m(c[B]&&c[B].iframe,B),function(){function e(e,o){function i(){c[n]?m(c[n].iframe,n):t()}["scroll","resize"].forEach((function(t){w(n,`${e+t} listener for sendPageInfo`),o(window,t,i)}))}function t(){e("Remove ",y)}var n=B;e("Add ",g),c[n]&&(c[n].stopPageInfo=t)}();break;case"pageInfoStop":c[B]&&c[B].stopPageInfo&&(c[B].stopPageInfo(),delete c[B].stopPageInfo);break;case"inPageLink":n=s(9).split("#")[1]||"",o=decodeURIComponent(n),(i=document.getElementById(o)||document.getElementsByName(o)[0])?(e=u(i),w(B,`Moving to in page link (#${n}) at x: ${e.x} y: ${e.y}`),d={x:e.x,y:e.y},h(),w(B,"--")):window.top!==window.self?window.parentIFrame?window.parentIFrame.moveToAnchor(n):w(B,`In page link #${n} not found and window.parentIFrame not found`):w(B,`In page link #${n} not found`);break;case"reset":S(A);break;case"init":t(),b("onInit",A.iframe);break;default:Number(A.width)===0&&Number(A.height)===0?v(`Unsupported message received (${A.type}), this is likely due to the iframe containing a later version of iframe-resizer than the parent page`):t()}let e; let n; let o; let i; let a}())):x(B,`Ignored: ${P}`)}function E(e,t,n){let o=null; let i=null;if(c[e]){if(typeof(o=c[e][t])!=="function")throw new TypeError(`${t} on iFrame[${e}] is not a function`);i=o(n)}return i}function O(e){const t=e.id;delete c[t]}function C(e){const t=e.id;if(!1!==E(t,"onClose",t)){w(t,`Removing iFrame: ${t}`);try{e.parentNode&&e.parentNode.removeChild(e)}catch(e){v(e)}E(t,"onClosed",t),w(t,"--"),O(e)}else w(t,"Close iframe cancelled by onClose event")}function F(t){d===null&&w(t,`Get page position: ${(d={x:window.pageXOffset!==e?window.pageXOffset:document.documentElement.scrollLeft,y:window.pageYOffset!==e?window.pageYOffset:document.documentElement.scrollTop}).x},${d.y}`)}function T(e){d!==null&&(window.scrollTo(d.x,d.y),w(e,`Set page position: ${d.x},${d.y}`),M())}function M(){d=null}function S(e){w(e.id,`Size reset requested by ${e.type==="init"?"host page":"iFrame"}`),F(e.id),R((function(){z(e),j("reset","reset",e.iframe,e.id)}),e,"reset")}function z(e){function t(t){i||e[t]!=="0"||(i=!0,w(o,"Hidden iFrame detected, creating visibility listener"),function(){function e(){function e(e){function t(t){return(c[e]&&c[e].iframe.style[t])==="0px"}function n(e){return e.offsetParent!==null}c[e]&&n(c[e].iframe)&&(t("height")||t("width"))&&j("Visibility change","resize",c[e].iframe,e)}Object.keys(c).forEach((function(t){e(t)}))}function t(t){w("window",`Mutation observed: ${t[0].target} ${t[0].type}`),H(e,16)}function n(){const e=document.querySelector("body"); const n={attributes:!0,attributeOldValue:!1,characterData:!0,characterDataOldValue:!1,childList:!0,subtree:!0};new o(t).observe(e,n)}var o=h();o&&n()}())}function n(n){!function(t){e.id?(e.iframe.style[t]=`${e[t]}px`,w(e.id,`IFrame (${o}) ${t} set to ${e[t]}px`)):w("undefined","messageData id not set")}(n),t(n)}var o=e.iframe.id;c[o]&&(c[o].sizeHeight&&n("height"),c[o].sizeWidth&&n("width"))}function R(e,t,n){n!==t.type&&s&&!window.jasmine?(w(t.id,"Requesting animation frame"),s(e)):e()}function j(e,t,n,o,i){let a; let l=!1;o=o||n.id,c[o]&&(n&&"contentWindow"in n&&n.contentWindow!==null?(a=c[o]&&c[o].targetOrigin,w(o,`[${e}] Sending msg to iframe[${o}] (${t}) targetOrigin: ${a}`),n.contentWindow.postMessage(r+t,a)):v(o,`[${e}] IFrame(${o}) not found`),i&&c[o]&&c[o].warningTimeout&&(c[o].msgTimeout=setTimeout((function(){!c[o]||c[o].loaded||l||(l=!0,v(o,`IFrame has not responded within ${c[o].warningTimeout/1e3} seconds. Check iFrameResizer.contentWindow.js has been loaded in iFrame. This message can be ignored if everything is working, or you can set the warningTimeout option to a higher value or zero to suppress this warning.`))}),c[o].warningTimeout)))}function N(e){return `${e}:${c[e].bodyMarginV1}:${c[e].sizeWidth}:${c[e].log}:${c[e].interval}:${c[e].enablePublicMethods}:${c[e].autoResize}:${c[e].bodyMargin}:${c[e].heightCalculationMethod}:${c[e].bodyBackground}:${c[e].bodyPadding}:${c[e].tolerance}:${c[e].inPageLinks}:${c[e].resizeFrom}:${c[e].widthCalculationMethod}:${c[e].mouseEvents}`}function W(t,i){function a(e){const t=e.split("Callback");if(t.length===2){const n=`on${t[0].charAt(0).toUpperCase()}${t[0].slice(1)}`;this[n]=this[e],delete this[e],v(d,`Deprecated: '${e}' has been renamed '${n}'. The old method will be removed in the next major version.`)}}let r; let l; var d=function(e){let a;return e===""&&(t.id=(a=i&&i.id||f.id+n++,document.getElementById(a)!==null&&(a+=n++),e=a),o=(i||{}).log,w(e,`Added missing iframe ID: ${e} (${t.src})`)),e}(t.id);d in c&&"iFrameResizer"in t?v(d,"Ignored iFrame, already setup."):(!function(e){let n;e=e||{},c[d]={firstRun:!0,iframe:t,remoteHost:t.src&&t.src.split("/").slice(0,3).join("/")},function(e){if(typeof e!=="object")throw new TypeError("Options is not an object")}(e),Object.keys(e).forEach(a,e),function(e){for(const t in f)Object.prototype.hasOwnProperty.call(f,t)&&(c[d][t]=Object.prototype.hasOwnProperty.call(e,t)?e[t]:f[t])}(e),c[d]&&(c[d].targetOrigin=!0===c[d].checkOrigin?(n=c[d].remoteHost)===""||n.match(/^(about:blank|javascript:|file:\/\/)/)!==null?"*":n:"*")}(i),function(){switch(w(d,`IFrame scrolling ${c[d]&&c[d].scrolling?"enabled":"disabled"} for ${d}`),t.style.overflow=!1===(c[d]&&c[d].scrolling)?"hidden":"auto",c[d]&&c[d].scrolling){case"omit":break;case!0:t.scrolling="yes";break;case!1:t.scrolling="no";break;default:t.scrolling=c[d]?c[d].scrolling:"no"}}(),function(){function e(e){const n=c[d][e];1/0!==n&&n!==0&&(t.style[e]=typeof n==="number"?`${n}px`:n,w(d,`Set ${e} = ${t.style[e]}`))}function n(e){if(c[d][`min${e}`]>c[d][`max${e}`])throw new Error(`Value for min${e} can not be greater than max${e}`)}n("Height"),n("Width"),e("maxHeight"),e("minHeight"),e("maxWidth"),e("minWidth")}(),typeof(c[d]&&c[d].bodyMargin)!=="number"&&(c[d]&&c[d].bodyMargin)!=="0"||(c[d].bodyMarginV1=c[d].bodyMargin,c[d].bodyMargin=`${c[d].bodyMargin}px`),r=N(d),(l=h())&&function(e){t.parentNode&&new e((function(e){e.forEach((function(e){Array.prototype.slice.call(e.removedNodes).forEach((function(e){e===t&&C(t)}))}))})).observe(t.parentNode,{childList:!0})}(l),g(t,"load",(function(){let n; let o;j("iFrame.onload",r,t,e,!0),n=c[d]&&c[d].firstRun,o=c[d]&&c[d].heightCalculationMethod in m,!n&&o&&S({iframe:t,height:0,width:0,type:"init"})})),j("init",r,t,e,!0),c[d]&&(c[d].iframe.iFrameResizer={close:C.bind(null,c[d].iframe),removeListeners:O.bind(null,c[d].iframe),resize:j.bind(null,"Window resize","resize",c[d].iframe),moveToAnchor(e){j("Move to anchor",`moveToAnchor:${e}`,c[d].iframe,d)},sendMessage(e){j("Send Message",`message:${e=JSON.stringify(e)}`,c[d].iframe,d)}}))}function H(e,t){u===null&&(u=setTimeout((function(){u=null,e()}),t))}function L(){document.visibilityState!=="hidden"&&(w("document","Trigger event: Visiblity change"),H((function(){P("Tab Visable","resize")}),16))}function P(e,t){Object.keys(c).forEach((function(n){(function(e){return c[e]&&c[e].resizeFrom==="parent"&&c[e].autoResize&&!c[e].firstRun})(n)&&j(e,t,c[n].iframe,n)}))}function A(){g(window,"message",I),g(window,"resize",(function(){let e;w("window",`Trigger event: ${e="resize"}`),H((function(){P(`Window ${e}`,"resize")}),16)})),g(document,"visibilitychange",L),g(document,"-webkit-visibilitychange",L)}function B(){function t(e,t){t&&(!function(){if(!t.tagName)throw new TypeError("Object is not a valid DOM element");if(t.tagName.toUpperCase()!=="IFRAME")throw new TypeError(`Expected <IFRAME> tag, found <${t.tagName}>`)}(),W(t,e),n.push(t))}let n;return function(){let e; const t=["moz","webkit","o","ms"];for(e=0;e<t.length&&!s;e+=1)s=window[`${t[e]}RequestAnimationFrame`];s?s=s.bind(window):w("setup","RequestAnimationFrame not supported")}(),A(),function(o,i){switch(n=[],function(e){e&&e.enablePublicMethods&&v("enablePublicMethods option has been removed, public methods are now always available in the iFrame")}(o),typeof i){case"undefined":case"string":Array.prototype.forEach.call(document.querySelectorAll(i||"iframe"),t.bind(e,o));break;case"object":t(o,i);break;default:throw new TypeError(`Unexpected data type (${typeof i})`)}return n}}}();const e=e=>{const t=e.source; const n=document.getElementsByTagName("iframe");let o=null;for(let e=0;e<n.length;e++){const i=n[e];if(i.contentWindow==t||i.contentWindow==t?.parent){o=i;break}}return o}; const t=e=>{try{return localStorage.getItem(e)}catch(e){return null}}; const n=(e,t)=>{try{localStorage.setItem(e,t)}catch(e){}};const o={overlay:"index-module_overlay__8wtEj",layoutDefault:"index-module_layoutDefault__2IbL4",layoutModal:"index-module_layoutModal__DRP2G",popupContainer:"index-module_popupContainer__2msgQ",loadingIndicator:"index-module_loadingIndicator__kFdXs",loadingIndicatorNoOverlay:"index-module_loadingIndicatorNoOverlay__3ZuSn",spin:"index-module_spin__37ne-",emoji:"index-module_emoji__1XBIX",animate__wave:"index-module_animate__wave__1uYZ0",wave:"index-module_wave__28Vlw","animate__heart-beat":"index-module_animate__heart-beat__2IJ5_",heartBeat:"index-module_heartBeat__2Hu6C",animate__flash:"index-module_animate__flash__1AGEr",flash:"index-module_flash__R4MoF",animate__bounce:"index-module_animate__bounce__2H-Ho",bounce:"index-module_bounce__3V938","animate__rubber-band":"index-module_animate__rubber-band__1o6I-",rubberBand:"index-module_rubberBand__1JT4E","animate__head-shake":"index-module_animate__head-shake__o7vZO",headShake:"index-module_headShake__5UxEd",animate__tada:"index-module_animate__tada__2Gs8a",tada:"index-module_tada__2IKJp",animate__spin:"index-module_animate__spin__3oc__"};!function(e,t){void 0===t&&(t={});const n=t.insertAt;if(e&&typeof document!=="undefined"){const o=document.head||document.getElementsByTagName("head")[0]; const i=document.createElement("style");i.type="text/css",n==="top"&&o.firstChild?o.insertBefore(i,o.firstChild):o.appendChild(i),i.styleSheet?i.styleSheet.cssText=e:i.appendChild(document.createTextNode(e))}}("@-webkit-keyframes index-module_spin__37ne-{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}@keyframes index-module_spin__37ne-{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}@-webkit-keyframes index-module_wave__28Vlw{0%{transform:rotate(0deg)}50%{transform:rotate(20deg)}to{transform:rotate(0deg)}}@keyframes index-module_wave__28Vlw{0%{transform:rotate(0deg)}50%{transform:rotate(20deg)}to{transform:rotate(0deg)}}@-webkit-keyframes index-module_heartBeat__2Hu6C{0%{transform:scale(1)}50%{transform:scale(1.08)}to{transform:scale(1)}}@keyframes index-module_heartBeat__2Hu6C{0%{transform:scale(1)}50%{transform:scale(1.08)}to{transform:scale(1)}}@-webkit-keyframes index-module_flash__R4MoF{0%,50%,to{opacity:1}25%,75%{opacity:.2}}@keyframes index-module_flash__R4MoF{0%,50%,to{opacity:1}25%,75%{opacity:.2}}@-webkit-keyframes index-module_bounce__3V938{0%,20%,53%,to{transform:translateZ(0)}40%,43%{transform:translate3d(0,-30px,0) scaleY(1.1)}70%{transform:translate3d(0,-15px,0) scaleY(1.05)}80%{transform:translateZ(0) scaleY(.95)}90%{transform:translate3d(0,-4px,0) scaleY(1.02)}}@keyframes index-module_bounce__3V938{0%,20%,53%,to{transform:translateZ(0)}40%,43%{transform:translate3d(0,-30px,0) scaleY(1.1)}70%{transform:translate3d(0,-15px,0) scaleY(1.05)}80%{transform:translateZ(0) scaleY(.95)}90%{transform:translate3d(0,-4px,0) scaleY(1.02)}}@-webkit-keyframes index-module_rubberBand__1JT4E{0%{transform:scaleX(1)}30%{transform:scale3d(1.25,.75,1)}40%{transform:scale3d(.75,1.25,1)}50%{transform:scale3d(1.15,.85,1)}65%{transform:scale3d(.95,1.05,1)}75%{transform:scale3d(1.05,.95,1)}to{transform:scaleX(1)}}@keyframes index-module_rubberBand__1JT4E{0%{transform:scaleX(1)}30%{transform:scale3d(1.25,.75,1)}40%{transform:scale3d(.75,1.25,1)}50%{transform:scale3d(1.15,.85,1)}65%{transform:scale3d(.95,1.05,1)}75%{transform:scale3d(1.05,.95,1)}to{transform:scaleX(1)}}@-webkit-keyframes index-module_headShake__5UxEd{0%{transform:translateX(0)}6.5%{transform:translateX(-6px) rotateY(-9deg)}18.5%{transform:translateX(5px) rotateY(7deg)}31.5%{transform:translateX(-3px) rotateY(-5deg)}43.5%{transform:translateX(2px) rotateY(3deg)}50%{transform:translateX(0)}}@keyframes index-module_headShake__5UxEd{0%{transform:translateX(0)}6.5%{transform:translateX(-6px) rotateY(-9deg)}18.5%{transform:translateX(5px) rotateY(7deg)}31.5%{transform:translateX(-3px) rotateY(-5deg)}43.5%{transform:translateX(2px) rotateY(3deg)}50%{transform:translateX(0)}}@-webkit-keyframes index-module_tada__2IKJp{0%{transform:scaleX(1)}10%,20%{transform:scale3d(.9,.9,.9) rotate(-3deg)}30%,50%,70%,90%{transform:scale3d(1.1,1.1,1.1) rotate(3deg)}40%,60%,80%{transform:scale3d(1.1,1.1,1.1) rotate(-3deg)}to{transform:scaleX(1)}}@keyframes index-module_tada__2IKJp{0%{transform:scaleX(1)}10%,20%{transform:scale3d(.9,.9,.9) rotate(-3deg)}30%,50%,70%,90%{transform:scale3d(1.1,1.1,1.1) rotate(3deg)}40%,60%,80%{transform:scale3d(1.1,1.1,1.1) rotate(-3deg)}to{transform:scaleX(1)}}.index-module_overlay__8wtEj{align-items:center;background-color:hsla(0,0%,6%,.6);bottom:0;display:flex;justify-content:center;left:0;position:fixed;right:0;top:0;z-index:100000005}.index-module_layoutDefault__2IbL4{bottom:20px;position:fixed;right:20px;width:auto}.index-module_layoutDefault__2IbL4,.index-module_layoutModal__DRP2G{background-color:transparent;border-radius:5px;box-shadow:0 0 0 1px hsla(0,0%,6%,.05),0 3px 6px hsla(0,0%,6%,.1),0 9px 24px hsla(0,0%,6%,.2);display:flex;height:auto;max-width:95vw;opacity:0;z-index:2147483000}.index-module_layoutModal__DRP2G{position:relative;width:700px}.index-module_popupContainer__2msgQ{border-radius:5px;display:flex;overflow-y:auto;width:100%}.index-module_popupContainer__2msgQ iframe{border-radius:5px;max-height:95vh}.index-module_loadingIndicator__kFdXs{align-items:center;background-color:#f5f5f5;border-radius:50%;color:#444;display:inline-flex;height:50px;justify-content:center;position:absolute;width:50px;z-index:2147483000}.index-module_loadingIndicatorNoOverlay__3ZuSn{bottom:10px;position:fixed;right:10px}.index-module_loadingIndicator__kFdXs svg{-webkit-animation:index-module_spin__37ne- 1.618s linear infinite;animation:index-module_spin__37ne- 1.618s linear infinite;height:20px;width:20px}.index-module_emoji__1XBIX{display:inline-block;font-size:42px;left:-21px;line-height:1;position:absolute;top:-21px}.index-module_animate__wave__1uYZ0{-webkit-animation:index-module_wave__28Vlw 1s ease-in-out 20;animation:index-module_wave__28Vlw 1s ease-in-out 20}.index-module_animate__heart-beat__2IJ5_{-webkit-animation:index-module_heartBeat__2Hu6C 1.3s ease-in-out 20;animation:index-module_heartBeat__2Hu6C 1.3s ease-in-out 20}.index-module_animate__flash__1AGEr{-webkit-animation:index-module_flash__R4MoF 2.5s 20;animation:index-module_flash__R4MoF 2.5s 20}.index-module_animate__bounce__2H-Ho{-webkit-animation:index-module_bounce__3V938 1.5s 20;animation:index-module_bounce__3V938 1.5s 20;transform-origin:center bottom}.index-module_animate__rubber-band__1o6I-{-webkit-animation:index-module_rubberBand__1JT4E 1.5s 20;animation:index-module_rubberBand__1JT4E 1.5s 20}.index-module_animate__head-shake__o7vZO{-webkit-animation:index-module_headShake__5UxEd 1.5s ease-in-out 20;animation:index-module_headShake__5UxEd 1.5s ease-in-out 20}.index-module_animate__tada__2Gs8a{-webkit-animation:index-module_tada__2IKJp 1.5s 20;animation:index-module_tada__2IKJp 1.5s 20}.index-module_animate__spin__3oc__{-webkit-animation:index-module_spin__37ne- 1.618s linear 20;animation:index-module_spin__37ne- 1.618s linear 20}@media (max-height:1000px){.index-module_popupContainer__2msgQ iframe{max-height:85vh}}@media (max-width:576px){.index-module_popupContainer__2msgQ iframe{max-height:70vh}.index-module_layoutDefault__2IbL4,.index-module_layoutModal__DRP2G{max-width:calc(100% - 40px)}}"),(i=>{const{document:a}=i; const r={};let l=!1; let d=!1;const s=()=>{a.querySelectorAll("iframe[data-tally-src]:not([src])").forEach((e=>{if(!e.dataset.tallyEmbedWidgetInitialized)if(i.IntersectionObserver){const t=new IntersectionObserver((n=>{n.forEach((({intersectionRatio:n})=>{n>0&&(m(e),t.unobserve(e))}))}),{root:null,rootMargin:"500px",threshold:[.01]});t.observe(e)}else m(e)}));a.querySelectorAll("iframe:not([data-tally-src])").forEach((e=>{e.dataset.tallyEmbedWidgetInitialized||e.src.indexOf("dynamicHeight=1")!==-1&&(void 0!==e.sandbox&&e.removeAttribute("sandbox"),e.dataset.tallyEmbedWidgetInitialized="1",iFrameResize({checkOrigin:!1,heightCalculationMethod:"taggedElement",scrolling:!0},e))}))}; const m=e=>{if(e.dataset.tallyEmbedWidgetInitialized)return;e.dataset.tallyEmbedWidgetInitialized="1",e.setAttribute("loading","lazy");let t=e.dataset.tallySrc;t&&(void 0!==e.sandbox&&e.removeAttribute("sandbox"),t+=t.indexOf("?")>-1?"&":"?",t+=`originPage=${encodeURIComponent(i.location.pathname)}`,i.location.search&&(t+=`&${i.location.search.substring(1)}`),e.src=t,t.indexOf("dynamicHeight=1")!==-1&&iFrameResize({checkOrigin:!1,heightCalculationMethod:"taggedElement",scrolling:!0},e))}; const c=(e,t)=>t?.key??`Tally.showOnce_${e}`; const u=(e,t)=>t?.key??`Tally.doNotShowAfterSubmit_${e}`; const f=e=>{e.preventDefault()}; const p=()=>{const e={};return new URLSearchParams(i.location.search).forEach(((t,n)=>{e[n]=encodeURIComponent(t)})),e}; const h=()=>{l||(i.addEventListener("message",(t=>{if(typeof t.data==="string")try{const o=JSON.parse(t.data);if(!o?.event?.startsWith("Tally."))return;switch(o.event){case"Tally.FormLoaded":{s();const e=r[o.payload.formId];e?.showOnce&&n(c(o.payload.formId,e),"1");break}case"Tally.FormPageView":{const n=r[o.payload.formId];n?.onPageView&&n.onPageView(o.payload.page),n?.emoji&&o.payload.page>1&&a.querySelector(".emoji")?.remove();const i=e(t);i&&i.getBoundingClientRect().top<0&&i.scrollIntoView();break}case"Tally.FormSubmitted":{const e=r[o.payload.formId];e?.onSubmit&&e.onSubmit(o.payload),void 0!==e?.autoClose&&setTimeout((()=>{y(o.payload.formId)}),e.autoClose),e?.emoji&&a.querySelector(".emoji")?.remove(),e?.doNotShowAfterSubmit&&n(u(o.payload.formId,e),"1");break}case"Tally.PopupClosed":y(o.payload.formId)}}catch(e){}})),l=!0)}; const g=(e,t)=>{const n=t?.width||376; const r=`${t?.customFormUrl?t.customFormUrl:`https://tally.so/popup/${e}`}${(e=>{const t=Object.keys(e).filter((t=>void 0!==e[t]&&e[t]!==null)).map((t=>`${t}=${e[t]}`)).join("&");return t?`?${t}`:""})({originPage:encodeURIComponent(i.location.pathname),...p(),...t?.hiddenFields||{},popup:t?.customFormUrl?"1":void 0,alignLeft:t?.alignLeft||n<=500?"1":void 0,hideTitle:t?.hideTitle?"1":void 0,preview:t?.preview?"1":void 0})}`;if(a.querySelector(`iframe[src="${r}"]`)!==null)return;let l=o.layoutDefault;t?.layout==="modal"&&(l=o.layoutModal);const s=a.createElement("div");s.className=`tally-popup ${l} tally-form-${e}`,s.innerHTML=`<div class="${o.popupContainer}"><iframe src="${r}" frameborder="0" marginheight="0" marginwidth="0" title="Tally Forms" style="width: 1px; min-width: 100%;"></iframe></div>`,s.style.width=`${n}px`;const m=s.querySelector("iframe");if(t?.emoji?.text){const e=a.createElement("div");e.className=`emoji ${o.emoji} ${o[`animate__${t.emoji.animation}`]??""}`,e.innerHTML=t.emoji.text,s.appendChild(e)}const c=a.createElement("div");c.className=`tally-overlay ${o.overlay}`,c.onclick=()=>{y(e)};let u=o.loadingIndicator;t?.overlay||t?.layout==="modal"||(u=`${o.loadingIndicator} ${o.loadingIndicatorNoOverlay}`);const h=a.createElement("div");h.className=`tally-loading-indicator ${u}`,h.innerHTML='<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>',t?.overlay||t?.layout==="modal"?(c.appendChild(h),c.appendChild(s),a.body.appendChild(c),d=a.body.style.overflow==="hidden",d||(a.body.style.overflow="hidden",a.body.addEventListener("touchmove",f,!1))):(a.body.appendChild(h),a.body.appendChild(s)),m&&(m.dataset.tallyEmbedWidgetInitialized="1",iFrameResize({checkOrigin:!1,heightCalculationMethod:"taggedElement",scrolling:!0,onInit:()=>{h.remove(),s.style.opacity="1",t?.onOpen&&t.onOpen()}},m))}; const y=e=>{const t=a.querySelector(`.tally-form-${e}`);if(!t)return;const n=t.querySelector("iframe");if(!n)return;t.remove(),n.iFrameResizer?.close(),a.querySelectorAll(".tally-overlay").forEach((e=>{e.remove(),d||(a.body.style.overflow="visible",a.body.removeEventListener("touchmove",f,!1))})),a.querySelectorAll(".tally-loading-indicator").forEach((e=>{e.remove()}));const o=r[e];o?.onClose&&o.onClose()}; const _=(e,n)=>{if(r[e]=n,!(n?.showOnce&&t(c(e,n))!==null||n?.doNotShowAfterSubmit&&t(u(e,n))!==null))if(n?.open?.trigger!=="time"||typeof n?.open?.ms!=="number")if(n?.open?.trigger!=="exit")if(n?.open?.trigger!=="scroll"||typeof n?.open?.scrollPercent!=="number")g(e,n);else{const t=()=>{const o=(i.document.body.scrollHeight-i.innerHeight)*(n.open.scrollPercent/100);a.documentElement.scrollTop>=o&&(g(e,n),a.removeEventListener("scroll",t))};a.addEventListener("scroll",t)}else{const t=o=>{o.toElement||o.relatedTarget||(g(e,n),a.removeEventListener("mouseout",t))};a.addEventListener("mouseout",t)}else setTimeout((()=>g(e,n)),n.open.ms)};if(!i.Tally){const e={};e.openPopup=_,e.closePopup=y,e.loadEmbeds=s,i.Tally=e}(({formId:e,popup:t})=>{e&&_(e,t),s(),h(),a.addEventListener("click",(e=>{const t=e.target.closest("[data-tally-open]");if(t){e.preventDefault();const n=t.dataset; const o={};o.layout=n.tallyLayout,o.width=void 0!==n.tallyWidth?parseInt(n.tallyWidth,10):void 0,o.alignLeft=n.tallyAlignLeft?n.tallyAlignLeft==="1":void 0,o.hideTitle=n.tallyHideTitle?n.tallyHideTitle==="1":void 0,o.overlay=n.tallyOverlay?n.tallyOverlay==="1":void 0,n.tallyEmojiText&&n.tallyEmojiAnimation&&(o.emoji={text:n.tallyEmojiText,animation:n.tallyEmojiAnimation}),o.autoClose=void 0!==n.tallyAutoClose?parseInt(n.tallyAutoClose,10):void 0,o.customFormUrl=n.tallyCustomFormUrl,n.tallyOnOpen&&typeof i[n.tallyOnOpen]==="function"&&(o.onOpen=i[n.tallyOnOpen]),n.tallyOnClose&&typeof i[n.tallyOnClose]==="function"&&(o.onClose=i[n.tallyOnClose]),n.tallyOnPageView&&typeof i[n.tallyOnPageView]==="function"&&(o.onPageView=i[n.tallyOnPageView]),n.tallyOnSubmit&&typeof i[n.tallyOnSubmit]==="function"&&(o.onSubmit=i[n.tallyOnSubmit]);for(const e in n)e.startsWith("tally")||(o.hiddenFields={...o.hiddenFields||{},[e]:n[e]});return void _(n.tallyOpen,o)}const n=e.target.closest("a");if(n&&n.href&&n.href.indexOf("#")<n.href.indexOf("tally-open")){e.preventDefault();const t=n.href.substring(n.href.indexOf("#")+1); const o=new URLSearchParams(t); const a={};o.forEach(((e,t)=>{switch(t.replace("tally-","")){case"layout":a.layout=e;break;case"width":a.width=parseInt(e,10);break;case"align-left":a.alignLeft=e==="1"||void 0;break;case"hide-title":a.hideTitle=e==="1"||void 0;break;case"overlay":a.overlay=e==="1"||void 0;break;case"emoji-text":a.emoji={...a.emoji||{},text:e,animation:o.get("tally-emoji-animation")};break;case"auto-close":a.autoClose=parseInt(e,10);break;case"custom-form-url":a.customFormUrl=e;break;case"on-open":a.onOpen=typeof i[e]==="function"?e:void 0;break;case"on-close":a.onClose=typeof i[e]==="function"?e:void 0;break;case"on-page-view":a.onPageView=typeof i[e]==="function"?e:void 0;break;case"on-submit":a.onSubmit=typeof i[e]==="function"?e:void 0}})),o.forEach(((e,t)=>{t.indexOf("tally-")===-1&&(a.hiddenFields={...a.hiddenFields||{},[t]:e})})),_(o.get("tally-open"),a)}}))})(i.TallyConfig??{})})(window)}();

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        Tally.loadEmbeds();
    }, []);
    return (
        <>
            <div className="mx-auto max-w-7xl px-8 py-8">
                <Link href="/vote">
                    <Button
                        alignedLeft
                        fullWidth
                        colorType="transparent"
                        className="mb-6"
                    >
                        ← Go back to all votes
                    </Button>
                </Link>

                <h1 className="mt-8 font-display text-4xl font-extrabold">
                    {vote.title}
                </h1>
                <p className="mb-4">{vote.description}</p>

                <div className="flex flex-col gap-8 lg:flex-row">
                    <div className="flex flex-1 flex-col">
                        <h2 className="mb-4 font-display text-3xl font-extrabold">
                            Projects
                        </h2>
                        <div className="flex max-h-96 flex-col gap-4 overflow-auto pr-4 lg:max-h-none lg:pr-0">
                            {vote.voteFor.map((project) => (
                                <button
                                    type="button"
                                    className="flex cursor-pointer flex-col items-stretch justify-center gap-4 rounded-lg border border-zinc-400 bg-zinc-700 px-4 py-4 transition-shadow hover:shadow-lg hover:shadow-zinc-400/20"
                                    key={project.id}
                                    onClick={() => {
                                        window.open(
                                            `/projects/${project.id}`,
                                            '_blank',
                                        );
                                    }}
                                >
                                    <div className="flex flex-row gap-4">
                                        <div className="flex w-20 flex-col">
                                            {project.logo ? (
                                                <Image
                                                    src={project.logo.url}
                                                    alt=""
                                                    width={512}
                                                    height={512}
                                                    className="aspect-square h-full w-full rounded-2xl object-contain"
                                                />
                                            ) : (
                                                <Image
                                                    src={selectRandomPlaceholder(
                                                        project.id,
                                                    )}
                                                    alt=""
                                                    width={512}
                                                    height={512}
                                                    className="aspect-square h-full w-full rounded-2xl object-contain"
                                                />
                                            )}
                                        </div>
                                        <div className="flex flex-1 flex-col">
                                            <p className="mb-1 font-display text-2xl font-semibold">
                                                {project.title}
                                            </p>
                                            {project.tagline &&
                                                project.tagline.length > 0 && (
                                                    <p className="text-lg leading-snug">
                                                        {project.tagline}
                                                    </p>
                                                )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1">
                        <h2 className="mb-4 font-display text-3xl font-extrabold">
                            Vote
                        </h2>
                        <iframe
                            data-tally-src={`https://tally.so/embed/3XLEOV?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1&email=${encodeURIComponent(
                                userEmail,
                            )}&securityKey=${encodeURIComponent(
                                securityKey,
                            )}&voteId=${encodeURIComponent(vote.id)}`}
                            loading="lazy"
                            width="100%"
                            height="238"
                            frameBorder="0"
                            marginHeight={0}
                            marginWidth={0}
                            title="Vote"
                        />
                    </div>
                </div>
            </div>
            <Script src="https://tally.so/widgets/embed.js" />
        </>
    );
}
