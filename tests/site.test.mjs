import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {parse} from 'parse5';import worker from '../worker.mjs';
const routes=['/','/en/','/privacy/','/en/privacy/','/terms/','/en/terms/','/cookies/','/en/cookies/'];
function nodes(n,out=[]){out.push(n);for(const c of n.childNodes||[])nodes(c,out);return out;}const attr=(n,k)=>n.attrs?.find(a=>a.name===k)?.value;const text=n=>n.nodeName==='#text'?n.value:(n.childNodes||[]).map(text).join('');
const file=route=>'dist'+(route==='/'?'/index.html':route+'index.html');
test('all static page families are crawlable with matching language metadata, assets and FAQ',()=>{
 const titles=new Set();for(const route of routes){const html=fs.readFileSync(file(route),'utf8'),all=nodes(parse(html));
  assert.equal(all.filter(n=>n.tagName==='h1').length,1,route);const title=text(all.find(n=>n.tagName==='title'));assert.ok(!titles.has(title));titles.add(title);
  assert.equal(attr(all.find(n=>attr(n,'rel')==='canonical'),'href'),'https://plazahumahuaca.com'+route);
  const topic=route.replace(/^\/en(?=\/|$)/,'')||'/';for(const [lang,target]of [['es-AR',topic],['en','/en'+topic]])assert.equal(attr(all.find(n=>attr(n,'hreflang')===lang),'href'),'https://plazahumahuaca.com'+target);
  assert.ok(attr(all.find(n=>attr(n,'name')==='description'),'content').length>15);
  assert.ok(!html.includes('data-es=')&&!html.includes('data-en='));
  for(const match of html.matchAll(/(?:src|href)="(\/(?:assets|_astro)\/[^"?#]+)"/g))assert.ok(fs.existsSync('dist'+match[1]),match[1]);
  for(const match of html.matchAll(/href="#([^"?]+)"/g))assert.ok(all.some(n=>attr(n,'id')===match[1]),route+'#'+match[1]);
  for(const n of all.filter(n=>n.tagName==='script'&&attr(n,'type')==='application/ld+json')){const schema=JSON.parse(text(n));assert.ok(!schema.aggregateRating&&!schema.openingHoursSpecification);if(schema['@type']==='FAQPage')for(const q of schema.mainEntity){assert.ok(html.includes(q.name));assert.ok(html.includes(q.acceptedAnswer.text));}}
  if(route==='/en/'){assert.ok(html.includes('5,171'));assert.ok(html.includes('23 October 2026'));assert.ok(html.includes('not the opening schedule'));assert.ok(html.includes('Anitich'));assert.ok(html.includes('Eric Bousquet'));}
 }
 const sitemap=fs.readFileSync('dist/sitemap-0.xml','utf8');for(const route of routes)assert.ok(sitemap.includes('<loc>https://plazahumahuaca.com'+route+'</loc>'));
});
const env={ASSETS:{async fetch(request){const p=new URL(request.url).pathname;if(p==='/404.html'||p==='/en/404.html')return Response.redirect(new URL(p.slice(0,-5),request.url),308);const f=(p==='/404'||p==='/en/404')?'dist'+p+'.html':p.endsWith('/')?file(p):'dist'+p;const exists=fs.existsSync(f)&&fs.statSync(f).isFile();return new Response(exists?fs.readFileSync(f):'missing',{status:exists?200:404,headers:{'Content-Type':f.endsWith('.html')?'text/html':'application/octet-stream'}});}}};
test('actual Worker redirects canonical aliases with query preservation and sends true localized404/HEAD',async()=>{
 for(const [input,expected]of [['http://plazahumahuaca.com/privacy?x=1','https://plazahumahuaca.com/privacy?x=1'],['https://plazahumahuaca.com/en?x=1','https://plazahumahuaca.com/en/?x=1'],['https://plazahumahuaca.com/en/privacy/index.html?x=1','https://plazahumahuaca.com/en/privacy/?x=1']]){const r=await worker.fetch(new Request(input),env);assert.equal(r.status,301);assert.equal(r.headers.get('Location'),expected);}
 for(const route of routes){const r=await worker.fetch(new Request('https://plazahumahuaca.com'+route),env);assert.equal(r.status,200);}
 const missing=await worker.fetch(new Request('https://plazahumahuaca.com/en/no-such-page'),env);assert.equal(missing.status,404);assert.equal(missing.headers.get('X-Robots-Tag'),'noindex');assert.ok((await missing.text()).includes('This path is not in the guide.'));
 for(const p of ['/cookies/','/404.html','/en/missing']){const head=await worker.fetch(new Request('https://plazahumahuaca.com'+p,{method:'HEAD'}),env);assert.equal(await head.text(),'');assert.equal(head.status,p==='/cookies/'?200:404);}
});

test('observed Assets canonical error aliases keep designed localized body and remove Location',async()=>{
 for(const route of ['/missing','/404','/404/','/404.html','/en/missing','/en/404','/en/404.html']){
  const response=await worker.fetch(new Request('https://plazahumahuaca.com'+route),env);assert.equal(response.status,404);assert.equal(response.headers.get('Location'),null);assert.equal(response.headers.get('X-Robots-Tag'),'noindex');const body=await response.text();assert.ok(body.length>500);if(route.startsWith('/en/'))assert.ok(body.includes('This path is not in the guide.'));
  const head=await worker.fetch(new Request('https://plazahumahuaca.com'+route,{method:'HEAD'}),env);assert.equal(head.status,404);assert.equal(head.headers.get('Location'),null);assert.equal(await head.text(),'');
 }
});
