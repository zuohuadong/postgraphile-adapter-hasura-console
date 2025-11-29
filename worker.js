export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 检查是否访问 ads.txt
    if (url.pathname === '/ads.txt') {
      return new Response('google.com, pub-3319999205844901, DIRECT, f08c47fec0942fa0', {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      });
    }
    
    // 访问根路由时跳转到 www 子域名
    if (url.pathname === '/') {
      const wwwUrl = `${url.protocol}//docs.${url.hostname}${url.pathname}${url.search}`;
      return Response.redirect(wwwUrl, 301);
    }
    
    // 其他路径返回 404
    return new Response('Not Found', { status: 404 });
  },
};
