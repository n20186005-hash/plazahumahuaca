const pages=new Set(['/','/en/','/privacy/','/en/privacy/','/terms/','/en/terms/','/cookies/','/en/cookies/']);
export default {
 async fetch(request,env){
  const url=new URL(request.url),production=url.hostname==='plazahumahuaca.com'||url.hostname==='www.plazahumahuaca.com';
  if(production&&url.protocol==='http:'){url.protocol='https:';return Response.redirect(url.href,301);}
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
  let path=url.pathname.replace(/\/index\.html$/,'/');if(path==='/en')path='/en/';if(!path.endsWith('/')&&pages.has(path+'/'))path+='/';
  if(path!==url.pathname&&pages.has(path)){url.pathname=path;return Response.redirect(url.href,301);}
  let response=await env.ASSETS.fetch(request);
  if(response.status===404||['/404','/404/','/404.html','/en/404','/en/404/','/en/404.html'].includes(path)){
   const error=new URL(url);error.pathname=path.startsWith('/en/')?'/en/404':'/404';const page=await env.ASSETS.fetch(new Request(error,{method:'GET',headers:request.headers}));const errorHeaders=new Headers(page.headers);errorHeaders.delete('Location');response=new Response(request.method==='HEAD'?null:page.body,{status:404,headers:errorHeaders});
  }
  const headers=new Headers(response.headers);headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','strict-origin-when-cross-origin');
  if(headers.get('Content-Type')?.includes('text/html'))headers.set('Cache-Control','no-cache');if(response.status===404)headers.set('X-Robots-Tag','noindex');
  return new Response(request.method==='HEAD'?null:response.body,{status:response.status,headers});
 }
};
