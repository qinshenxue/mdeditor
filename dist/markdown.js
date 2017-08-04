!function(t){"use strict";function e(t,e){for(var s=[],l=0;l<e.length;l++){var n=e[l];if(/^\s+/.test(n)){for(var a=[];l<e.length;l++){if(!/^\s+/.test(e[l])){l--;break}a.push(e[l].replace(/^\s+/,""))}s[s.length-1].children=f(a)}else s.push({tag:"li",md:e[l],children:[],html:r("ul"==t?e[l].replace(/^[\.\*\-]\s*/,""):e[l].replace(/^\d\.\s*/,""))})}return s}function r(t){return t=i(t),t=s(t),t=h(t),t=l(t),t=n(t),t=a(t)}function s(t){return t.replace(p.img,'<img alt="$1" src="$2">')}function l(t){return t.replace(p.a,function(t,e,s){return'<a href="'+s+'" target="_blank">'+r(e.replace(/\\([\(\)\[\])])/g,"$1"))+"</a>"})}function n(t){return t.replace(p.b,"<b>$1</b>")}function a(t){return t.replace(p.i,"<i>$1</i>")}function h(t){return t.replace(p.inlineCode,"<code>$1</code>")}function i(t){return t.replace(/\</g,"&lt;").replace(/\>/g,"&gt;")}function u(t){for(var e=[],s=0;s<t.length;s++){var l=t[s];if(/^\s+/.test(l)){for(var n=[];s<t.length;s++){if(!/^\s+/.test(t[s])){s--;break}n.push(t[s].replace(/^\s+/,""))}e[e.length-1].children=f(n)}else e.push({tag:"text",md:l,children:[],html:r(l.replace(/^(!)?>/,""))})}return e}function c(t){function e(t){if(t<n.length&&"left"!==n[t])return{"text-align":n[t]}}for(var s=/[^|]+/g,l=t[1].match(s)||[],n=[],a=0,h=l.length;a<h;a++)/^\s*-+:\s*$/.test(l[a])?n.push("right"):/^\s*:-+:\s*$/.test(l[a])?n.push("center"):n.push("left");for(var i={tag:"tr",children:[]},u=t[0].match(s)||[],c=u.length,f=0;f<c;f++)i.children.push({tag:"th",style:e(f),md:u[f],html:r(u[f].trim())});for(var o=[],g=2,p=t.length;g<p;g++){for(var d={tag:"tr",children:[]},m=c,v=t[g].match(s)||[];m--;){var b=v[m];d.children.unshift({tag:"td",style:e(m),md:b,html:b?r(b.trim()):""})}o.push(d)}return[i].concat(o)}function f(t){for(var s=[],l=t.length,n="",a=0;a<l;a++){var h=t[a];if(p.title.test(h)){var f=/^#{1,6}/,o=h.match(f);s.push({tag:"h"+o[0].length,md:h,html:r(h.replace(f,""))})}else if(p.hr.test(h))s.push({tag:"hr",md:h});else if((n=!!p.ul.test(h)&&"ul")||(n=!!p.ol.test(h)&&"ol")){for(g=[];a<l;a++){b=t[a];if(!p[n].test(b)&&!/^\s+.+/.test(b)){a--;break}g.push(b)}s.push({tag:n,children:e(n,g),md:g})}else if(p.table.test(h)&&t[a+1]&&p.align.test(t[a+1])){g=[h,t[a+1]];for(a+=2;a<l;a++){b=t[a];if(!p.table.test(b)){a--;break}g.push(b)}s.push({tag:"table",children:c(g),md:g})}else if(p.blockquote.test(h)){var g=[h],d=0==h.indexOf("!")?"warning":"";for(a++;a<l;a++){b=t[a];if(!p.blockquote.test(b)&&!/^\s+.+/.test(b)){a--;break}g.push(b)}s.push({tag:"blockquote",class:d,children:u(g),md:g})}else if(p.code.test(h)){var g=[h],m=h.match(/[^`\s]+/);m=m?m[0]:"";var v="";for(a++;a<l;a++){var b=i(t[a]);if(p.code.test(b))break;g.push(b),v+=b,/^\n/.test(b)||(v+="\n")}g.push("```"),s.push({tag:"pre",children:[{tag:"code",html:v}],attr:{"data-lang":m},class:m,md:g})}else/^\n+/.test(h)||s.push({tag:"p",md:h,html:r(h)})}return s}function o(t){for(var e=[],r=0;r<t.length;r++){var s=t[r];if("text"==s.tag)e.push(s.html),s.children&&e.push(o(s.children));else{if(e.push("<"+s.tag),s.class&&e.push(' class="'+s.class+'" '),s.style){e.push(' style="');for(var l in s.style)e.push(l+":"+s.style[l]+";");e.push('" ')}if(s.attr)for(var n in s.attr)e.push(" "+n+'="'+s.attr[n]+'" ');e.push(">"),s.html&&e.push(s.html),s.children&&e.push(o(s.children)),e.push("</"+s.tag+">")}}return e.join("")}function g(t){return f(t.match(/.+|^\n/gm)||[])}var p={title:/^(#{1,6}).+$/,ul:/^[\.\-\*]\s+.+$/,ol:/^\d+\.\s?.+$/,blockquote:/^!?>.+?$/,code:/^\`{3}.*$/,table:/^(\|[^|]+)+\|\s*$/,align:/^(\|\s*:?-+:?\s*)+\|\s*$/,hr:/^(\*|\_|\-){3,}$/,img:/\!\[(.*?)\]\((.*?)\)/g,a:/\[((?:[^\(\)\[\]]|\\\[|\\\]|\\\(|\\\))+)\]\((.+?)\)/g,b:/\*\*(.+?)\*\*/g,i:/\*(.+?)\*/g,inlineCode:/\`(.+?)\`/g};t.mdToTree=g,t.mdToHtml=function(t){return o(g(t))}}(this.md=this.md||{});
