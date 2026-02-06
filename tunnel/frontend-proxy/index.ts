/**
 * Cloudflare Worker: Stable Tunnel Proxy with WebSocket Support and API Routing
 * Frontend Worker for SaasCoiffure - Routes /api requests to Django backend
 */
export default {
    async fetch(request: Request, env: { TUNNEL_URL: string; DJANGO_TUNNEL_URL?: string }): Promise<Response> {
        try {
            const targetBase = env.TUNNEL_URL;
            if (!targetBase) {
                return new Response('Missing TUNNEL_URL secret', { status: 500 });
            }

            const incomingUrl = new URL(request.url);
            
            // Route /api, /media, and /static requests directly to Django tunnel
            if (incomingUrl.pathname.startsWith('/api') || 
                incomingUrl.pathname.startsWith('/media') || 
                incomingUrl.pathname.startsWith('/static')) {
                // Use DJANGO_TUNNEL_URL if set, otherwise use same as TUNNEL_URL's backend
                const djangoBase = env.DJANGO_TUNNEL_URL || targetBase.replace(':8080', ':8000').replace('localhost:8080', 'localhost:8000');
                const backendUrl = new URL(incomingUrl.pathname + incomingUrl.search, djangoBase);
                
                const headers = new Headers(request.headers);
                headers.delete('host');
                headers.set('X-Forwarded-Proto', 'https');
                headers.set('X-Forwarded-Host', incomingUrl.host);
                
                const cfIp = request.headers.get('CF-Connecting-IP') || request.headers.get('x-real-ip') || '';
                if (cfIp) headers.set('X-Forwarded-For', cfIp);
                
                const method = request.method.toUpperCase();
                const hasBody = !(method === 'GET' || method === 'HEAD');
                const bufferedBody = hasBody ? await request.arrayBuffer() : undefined;
                
                const response = await fetch(backendUrl.toString(), {
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

            // WebSocket support for Vite HMR
            if (request.headers.get('Upgrade') === 'websocket') {
                const wsUrl = new URL(incomingUrl.pathname + incomingUrl.search, targetBase);
                return await fetch(wsUrl.toString(), request);
            }

            // Regular frontend requests
            const targetUrl = new URL(incomingUrl.pathname + incomingUrl.search, targetBase);

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
