# Knowapp

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

```bash
npm install 

npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

## Server side web page loader

The content of the webpages is fetched through a server worker, deployed on Clodflare, which acts as a server side proxy in order to avoid CORS problems.

The endpoint to call is:

```https://cors-proxy.matteo-piazza.workers.dev/proxy?url=```

And the source code:

```js
export default {
  async fetch(request) {
    const PROXY_ENDPOINT = "/proxy";

    const allowedOrigins = [
      "http://localhost:5173",
      "https://arcadejhs.github.io"
    ];

    const corsHeaders = {
      "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
      "Access-Control-Max-Age": "86400",
    };

    function getCorsHeaders(reques) {
      const origin = request.headers.get("Origin");

      if (allowedOrigins.includes(origin)) {
        return {
          ...corsHeaders,
          "Access-Control-Allow-Origin": origin
        };
      }

      return corsHeaders;
    }

    async function handleRequest(request) {
      const url = new URL(request.url);
      let requestUrl = url.searchParams.get("url");

      // Rewrite request to point to API URL. This also makes the request mutable
      // so you can add the correct Origin header to make the API server think
      // that this request is not cross-site.
      request = new Request(requestUrl, request);
      request.headers.set("Origin", new URL(requestUrl).origin);
      
      let response = await fetch(request);
      const htmlContent = await response.text();
      return htmlContent;
    }

    async function handleOptions(request) {
      if (
        request.headers.get("Origin") !== null &&
        request.headers.get("Access-Control-Request-Method") !== null &&
        request.headers.get("Access-Control-Request-Headers") !== null
      ) {
        // Handle CORS preflight requests.
        return new Response(null, {
          headers: {
            ...getCorsHeaders(request),
            "Access-Control-Allow-Headers": request.headers.get(
              "Access-Control-Request-Headers",
            ),
          },
        });
      } else {
        // Handle standard OPTIONS request.
        return new Response(null, {
          headers: {
            Allow: "GET, HEAD, POST, OPTIONS",
          },
        });
      }
    }

    const url = new URL(request.url);
    console.log(request.url);
    console.log(url.pathname);

    if (url.pathname.startsWith(PROXY_ENDPOINT)) {
      if (request.method === "OPTIONS") {
        // Handle CORS preflight requests
        return handleOptions(request);
      } else if (
        request.method === "GET" ||
        request.method === "HEAD" ||
        request.method === "POST"
      ) {
        // Handle requests to the API server
        return new Response(await handleRequest(request), {
          headers: {
            ...getCorsHeaders(request),
            "Content-Type": "text/html",
          },
        });
      } else {
        return new Response(null, {
          status: 405,
          statusText: "Method Not Allowed",
        });
      }
    } else {
      return new Response('42');
    }
  }
};
```