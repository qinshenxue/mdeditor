!function(t){"use strict";function e(t,e){for(var n=[],s=0;s<e.length;s++){var l=e[s];if(/^\s+/.test(l)){for(var a=[];s<e.length;s++){if(!/^\s+/.test(e[s])){s--;break}a.push(e[s].replace(/^\s+/,""))}n[n.length-1].children=o(a)}else n.push({tag:"li",md:e[s],children:[],text:r("ul"==t?e[s].replace(/^[\.\*\-]\s*/,""):e[s].replace(/^\d\.\s*/,""))})}return n}function r(t){return t=u(t),t=n(t),t=i(t),t=s(t),t=l(t),t=a(t)}function n(t){return t.replace(d.img,function(t,e,r){return'<img class="mdeditor-img" alt="'+e+'" src="'+r+'">'})}function s(t){return t.replace(d.a,function(t,e,r){return'<a href="'+r+'" target="_blank">'+l(e.replace(/\\([\(\)\[\])])/g,"$1"))+"</a>"})}function l(t){return t.replace(d.b,function(t,e){return"<b>"+e+"</b>"})}function a(t){return t.replace(d.i,function(t,e){return"<i>"+e+"</i>"})}function i(t){return t.replace(d.inlineCode,function(t,e){return'<span class="mdeditor-inline-code">'+e+"</span>"})}function u(t){return t.replace(/\</g,"&lt;").replace(/\>/g,"&gt;")}function c(t){for(var e=[],n=0;n<t.length;n++){var s=t[n];if(/^\s+/.test(s)){for(var l=[];n<t.length;n++){if(!/^\s+/.test(t[n])){n--;break}l.push(t[n].replace(/^\s+/,""))}e[e.length-1].children=o(l)}else e.push({tag:"text",md:s,children:[],text:r(s.replace(/^(!)?>/,""))})}return e}function h(t){function e(t){if(t<s.length&&"left"!==s[t])return{"text-align":s[t]}}for(var n=t[1].match(d.tdSplit)||[],s=[],l=0,a=n.length;l<a;l++)/^\s*-+:\s*$/.test(n[l])?s.push("right"):/^\s*:-+:\s*$/.test(n[l])?s.push("center"):s.push("left");for(var i={tag:"tr",children:[]},u=t[0].match(d.tdSplit)||[],c=u.length,h=0;h<c;h++)i.children.push({tag:"th",style:e(h),md:u[h],text:r(u[h].trim())});for(var o=[],f=2,p=t.length;f<p;f++){for(var g={tag:"tr",children:[]},m=c,v=t[f].match(d.tdSplit)||[];m--;){var b=v[m];g.children.unshift({tag:"td",style:e(m),md:b,text:b?r(b.trim()):""})}o.push(g)}return[i].concat(o)}function o(t){for(var n=[],s=t.length,l="",a=0;a<s;a++){var i=t[a];if(d.title.test(i)){var u=i.match(/^#{1,6}/);n.push({tag:"h"+(u?u[0].length:1),md:i,text:r(i.replace(/^#{1,6}/,""))})}else if(d.hr.test(i))n.push({tag:"hr",md:i});else if((l=!!d.ul.test(i)&&"ul")||(l=!!d.ol.test(i)&&"ol")){for(o=[];a<s;a++){m=t[a];if(!d[l].test(m)&&!/^\s+.+/.test(m)){a--;break}o.push(m)}n.push({tag:l,children:e(l,o),md:o})}else if(d.table.test(i)&&t[a+1]&&d.tdAlign.test(t[a+1])){o=[i,t[a+1]];for(a+=2;a<s;a++){m=t[a];if(!d.table.test(m)){a--;break}o.push(m)}n.push({tag:"table",children:h(o),md:o})}else if(d.blockquote.test(i)){var o=[i],f=0==i.indexOf("!")?"warning":"";for(a++;a<s;a++){m=t[a];if(!d.blockquote.test(m)&&!/^\s+.+/.test(m)){a--;break}o.push(m)}n.push({tag:"blockquote",class:f,children:c(o),md:o})}else if(d.code.test(i)){var o=[i],p=i.match(/[^`\s]+/);p=p?p[0]:"";var g="";for(a++;a<s;a++){var m=t[a];if(d.code.test(m))break;o.push(m),g+=m,/^\n/.test(m)||(g+="\n")}o.push("```"),n.push({tag:"pre",children:[{tag:"code",text:g}],attr:{"data-lang":p},class:p,md:o})}else/^\n+/.test(i)||n.push({tag:"p",md:i,text:r(i)})}return n}function f(t){for(var e=[],r=0;r<t.length;r++){var n=t[r];if("text"==n.tag)e.push(n.text),n.children&&e.push(f(n.children));else{if(e.push("<"+n.tag),n.class&&e.push(' class="'+n.class+'" '),n.style){e.push(' style="');for(var s in n.style)e.push(s+":"+n.style[s]+";");e.push('" ')}if(n.attr)for(var l in n.attr)e.push(" "+l+'="'+n.attr[l]+'" ');e.push(">"),n.text&&e.push(n.text),n.children&&e.push(f(n.children)),e.push("</"+n.tag+">")}}return e.join("")}function p(t){return o(t.match(/.+|^\n/gm)||[])}var d={code:/^\`{3}.*$/,ul:/^[\.\-\*]\s+.+$/,ol:/^\d+\.\s?.+$/,img:/\!\[(.*?)\]\((.*?)\)/g,title:/^(#{1,6}).+$/,a:/\[((?:[^\(\)\[\]]|\\\[|\\\]|\\\(|\\\))+)\]\((.+?)\)/g,b:/\*\*(.+?)\*\*/g,i:/\*(.+?)\*/g,inlineCode:/\`(.+?)\`/g,blockquote:/^!?>.+?$/,hr:/^(\*|\_|\-){3,}$/,table:/^(\|[^|]+)+\|\s*$/,tdSplit:/[^|]+/g,tdAlign:/^(\|\s*:?-+:?\s*)+\|\s*$/};t.mdToTree=p,t.mdToHtml=function(t){return f(p(t))}}(this.md=this.md||{});
