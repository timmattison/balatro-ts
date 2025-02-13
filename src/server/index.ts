import path from 'path';

const indexPath = path.join(import.meta.dir, '..', 'client', 'index.html');

Bun.serve({
	port: 3000,
	static: {
		"/index.html": new Response(await Bun.file(indexPath).bytes(), {
			headers: {
			  "Content-Type": "text/html",
			},
		  }),
		  "/": Response.redirect("/index.html"),
	},
	fetch(req) {
	  const url = new URL(req.url);
	  if (url.pathname === "/blog") {
		return new Response("Blog!");
	  }
	  return new Response("404!");
	},
  });

  export {};