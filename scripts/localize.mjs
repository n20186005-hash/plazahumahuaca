import {landmarks,landmarkPath} from '../src/lib/landmarks.mjs';
import {towerRoute,towerEnglishMeta} from '../src/lib/visitor-routes.mjs';
import fs from 'node:fs';import path from 'node:path';import {parse,serialize} from 'parse5';
const origin='https://plazahumahuaca.com';
export function walk(node,fn){fn(node);for(const child of node.childNodes||[])walk(child,fn);}
export const attr=(n,k)=>n.attrs?.find(a=>a.name===k)?.value;
export function set(n,k,v){n.attrs??=[];const old=n.attrs.find(a=>a.name===k);if(old)old.value=v;else n.attrs.push({name:k,value:v});}
export function text(n){return n.nodeName==='#text'?n.value:(n.childNodes||[]).map(text).join('');}
function content(n,value){n.childNodes=[{nodeName:'#text',value,parentNode:n}];}
function element(tag,attrs={},value){const n={nodeName:tag,tagName:tag,namespaceURI:'http://www.w3.org/1999/xhtml',attrs:Object.entries(attrs).map(([name,value])=>({name,value})),childNodes:[]};if(value!==undefined)content(n,value);return n;}
const topics=['/','/privacy/','/terms/','/cookies/',towerRoute,...landmarks.map(landmarkPath)];
const enMeta={ ...Object.fromEntries(landmarks.map(p=>[landmarkPath(p),[p.name+' in '+p.town+' | Visitor guide',p.en]])), [towerRoute]:towerEnglishMeta, '/':['Plaza Sargento Mariano Gómez, Humahuaca: map and visitor guide','Find Humahuaca’s main square, map location, Cabildo and church context, access notes and a suggested walking visit.'], '/privacy/':['Privacy | Plaza Mariano Gómez Guide','Privacy, embedded resources and optional Analytics in the Plaza Mariano Gómez guide.'], '/terms/':['Terms | Plaza Mariano Gómez Guide','Terms and scope of the independent Plaza Mariano Gómez visitor guide.'], '/cookies/':['Cookie settings | Plaza Mariano Gómez Guide','Manage the existing optional Analytics preference in this browser.'], '/404.html':['Page not found | Plaza Mariano Gómez Guide','Return to the Plaza Mariano Gómez guide.']};
for(const topic of [...topics,'/404.html']){
 const input=topic==='/404.html'?'dist/404.html':topic==='/'?'dist/index.html':'dist'+topic+'index.html';const source=fs.readFileSync(input,'utf8');
 for(const lang of ['es','en']){
  const doc=parse(source),all=[];walk(doc,n=>all.push(n));const head=all.find(n=>n.tagName==='head');const body=all.find(n=>n.tagName==='body');const html=all.find(n=>n.tagName==='html');set(html,'lang',lang==='en'?'en':'es-AR');
  for(const node of all){
   const value=attr(node,'data-'+lang);if(value!==undefined)content(node,value);
   if(node.attrs)node.attrs=node.attrs.filter(a=>!['data-es','data-en'].includes(a.name));
   if(attr(node,'data-language')){
    const target=attr(node,'data-language');node.nodeName=node.tagName='a';node.attrs=node.attrs.filter(a=>!['type','aria-pressed'].includes(a.name));set(node,'href',(target==='en'?'/en':'')+(topic==='/404.html'?'/':topic));set(node,'class','lang-button'+(target===lang?' active':''));if(target===lang)set(node,'aria-current','page');
   }
   const href=attr(node,'href');if(href&&topics.includes(href)&&!attr(node,'data-language'))set(node,'href',(lang==='en'?'/en':'')+href);
   if(topic!=='/'&&href?.startsWith('#')&&href!=='#contenido')set(node,'href',(lang==='en'?'/en/':'/')+href);
   if(lang==='en'&&attr(node,'aria-label')){const labels={'Navegación principal':'Main navigation','Selector de idioma':'Language selector','Enlaces legales':'Legal links','Orientación':'Orientation','Datos de la plaza':'Square facts','Plaza Sargento Mariano Gómez — inicio':'Plaza Sargento Mariano Gómez — home'};if(labels[attr(node,'aria-label')])set(node,'aria-label',labels[attr(node,'aria-label')]);}
   if(lang==='en'&&attr(node,'alt')) {const labels={'Paisaje regional cerca de Purmamarca, febrero de 2005':'Regional landscape near Purmamarca, February2005','Personas en la plaza principal de Humahuaca, julio de 2012':'People in Humahuaca’s main square, July2012','Paisaje de la Quebrada de Humahuaca':'Historic landscape of the Quebrada de Humahuaca','Lámina ilustrada de paisaje andino':'Abstract contour-line illustration'};if(labels[attr(node,'alt')])set(node,'alt',labels[attr(node,'alt')]);}
   if(lang==='en'&&node.tagName==='iframe')set(node,'title','Map of Plaza Sargento Mariano Gómez');
  }
  const route=(lang==='en'?'/en':'')+topic,canonical=origin+route;
  head.childNodes=head.childNodes.filter(n=>!(n.tagName==='link'&&['canonical','alternate'].includes(attr(n,'rel'))));
  if(topic!=='/404.html'){
   head.childNodes.push(element('link',{rel:'canonical',href:canonical}));for(const [code,url]of [['es-AR',origin+topic],['en',origin+'/en'+topic],['x-default',origin+topic]])head.childNodes.push(element('link',{rel:'alternate',hreflang:code,href:url}));
  }
  const title=lang==='en'?enMeta[topic][0]:text(all.find(n=>n.tagName==='title'));
  const description=lang==='en'?enMeta[topic][1]:attr(all.find(n=>attr(n,'name')==='description'),'content');
  for(const n of all){if(n.tagName==='title')content(n,title);if(['description','twitter:description'].includes(attr(n,'name'))||attr(n,'property')==='og:description')set(n,'content',description);if(attr(n,'property')==='og:title'||attr(n,'name')==='twitter:title')set(n,'content',title);if(attr(n,'property')==='og:url')set(n,'content',canonical);}
  if(topic.startsWith('/cerca/')){
   const place=landmarks.find(p=>landmarkPath(p)===topic);
   head.childNodes.push(element('meta',{name:'keywords',content:[place?.name??'Torre de Santa Bárbara',place?.town??'Humahuaca','Jujuy',lang==='en'?'visitor guide':'guía de visita'].join(', ')}));
  }
  if(!topic.startsWith('/cerca/')) head.childNodes.push(element('meta',{property:'og:image',content:origin+'/assets/quebrada-landscape-commons.jpg'}),element('meta',{property:'og:image:alt',content:lang==='en'?'Quebrada landscape near Purmamarca, February2005; not a view from the square':'Paisaje regional cerca de Purmamarca, febrero2005; no es una vista desde la plaza'}));
  if(topic==='/'){
   const schema={'@context':'https://schema.org','@type':'TouristAttraction','@id':origin+'/#place',name:'Plaza Sargento Mariano Gómez',alternateName:['Plaza Humahuaca','Plaza Sargento Gómez'],url:origin+'/',mainEntityOfPage:canonical,description,image:origin+'/assets/humahuaca-plaza-commons.jpg',address:{'@type':'PostalAddress',addressLocality:'Humahuaca',addressRegion:'Jujuy',addressCountry:'AR'},geo:{'@type':'GeoCoordinates',latitude:-23.2039735,longitude:-65.3487032},hasMap:'https://maps.app.goo.gl/WNmM8pUaegvxb9r28'};
   head.childNodes.push(element('script',{type:'application/ld+json'},JSON.stringify(schema)));
   const faq=[];walk(body,n=>{if(n.tagName!=='details'||!n.childNodes?.some(c=>c.tagName==='summary'))return;const summary=n.childNodes.find(c=>c.tagName==='summary'),answer=n.childNodes.find(c=>c.tagName==='p');if(answer)faq.push({'@type':'Question',name:text(summary),acceptedAnswer:{'@type':'Answer',text:text(answer)}});});
   head.childNodes.push(element('script',{type:'application/ld+json'},JSON.stringify({'@context':'https://schema.org','@type':'FAQPage',mainEntity:faq})));
  }
  const output=lang==='es'?input:topic==='/404.html'?'dist/en/404.html':'dist/en'+(topic==='/'?'/index.html':topic+'index.html');fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,serialize(doc));
 }
}
const urls=topics.flatMap(topic=>[origin+topic,origin+'/en'+topic]);fs.writeFileSync('dist/sitemap-0.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(url=>'<url><loc>'+url+'</loc></url>').join('')+'</urlset>');
