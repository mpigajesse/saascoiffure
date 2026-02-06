/**
 * Cloudflare Worker: Backend Tunnel Proxy for Dashboard
 * Serves the React frontend (dashboard) and routes /api to Django
 */
export default {
    async fetch(request: Request, env: { TUNNEL_URL: string; FRONTEND_TUNNEL_URL?: string }): Promise<Response> {
        try {
            const djangoBase = env.TUNNEL_URL;
            const frontendBase = env.FRONTEND_TUNNEL_URL;
            
            if (!djangoBase) {
                return new Response('Missing TUNNEL_URL secret (Django)', { status: 500 });
            }

            const incomingUrl = new URL(request.url);
            
            // Redirect root to login page (dashboard)
            if (incomingUrl.pathname === '/' || incomingUrl.pathname === '') {
                return Response.redirect(new URL('/login', request.url).toString(), 302);
            }
            
            // Route /api, /media, /static, and /admin requests to Django
            if (incomingUrl.pathname.startsWith('/api') || 
                incomingUrl.pathname.startsWith('/media') || 
                incomingUrl.pathname.startsWith('/static') ||
                incomingUrl.pathname.startsWith('/admin')) {
                const targetUrl = new URL(incomingUrl.pathname + incomingUrl.search, djangoBase);
                
                const headers = new Headers(request.headers);
                headers.delete('host');
                headers.set('X-Forwarded-Proto', 'https');
                headers.set('X-Forwarded-Host', incomingUrl.host);
                
                const cfIp = request.headers.get('CF-Connecting-IP') || request.headers.get('x-real-ip') || '';
                if (cfIp) headers.set('X-Forwarded-For', cfIp);
                
                headers.set('Accept-Encoding', 'identity');
                
                const method = request.method.toUpperCase();
                const hasBody = !(method === 'GET' || method === 'HEAD');
                const bufferedBody = hasBody ? await request.arrayBuffer() : undefined;
                
                const response = await fetch(targetUrl.toString(), {
                    method,
                    headers,
                    body: bufferedBody,
                    redirect: 'manual',
                });
                
                // Add CORS headers for API responses
                const responseHeaders = new Headers(response.headers);
                responseHeaders.set('Access-Control-Allow-Origin', '*');
                responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
                responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Salon-Id');
                
                if (request.method === 'OPTIONS') {
                    return new Response(null, { status: 204, headers: responseHeaders });
                }
                
                return new Response(response.body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: responseHeaders,
                });
            }
            
            // For non-API routes, serve the React frontend
            if (!frontendBase) {
                return new Response('Missing FRONTEND_TUNNEL_URL secret. Backend tunnel needs frontend tunnel URL to serve the dashboard.', { status: 500 });
            }

            // WebSocket support for Vite HMR
            if (request.headers.get('Upgrade') === 'websocket') {
                const wsUrl = new URL(incomingUrl.pathname + incomingUrl.search, frontendBase);
                return await fetch(wsUrl.toString(), request);
            }

            // Regular frontend requests (dashboard pages)
            const targetUrl = new URL(incomingUrl.pathname + incomingUrl.search, frontendBase);

            const headers = new Headers(request.headers);
            headers.delete('host');
            headers.set('X-Forwarded-Proto', 'https');
            headers.set('X-Forwarded-Host', incomingUrl.host);

            const cfIp = request.headers.get('CF-Connecting-IP') || request.headers.get('x-real-ip') || '';
            if (cfIp) headers.set('X-Forwarded-For', cfIp);

            headers.set('Accept-Encoding', 'identity');

            const method = request.method.toUpperCase();
            const hasBody = !(method === 'GET' || method === 'HEAD');
            const bufferedBody = hasBody ? await request.arrayBuffer() : undefined;

            const response = await fetch(targetUrl.toString(), {
                method,
                headers,
                body: bufferedBody,
                redirect: 'manual',
            });

            return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: new Headers(response.headers),
            });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            return new Response('Proxy error: ' + msg, { status: 502 });
        }
    },
};
