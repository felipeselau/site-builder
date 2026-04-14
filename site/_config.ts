import lume from "https://cdn.jsdelivr.net/gh/lumeland/lume@v2.3.0/mod.ts";
import liquid from "https://cdn.jsdelivr.net/gh/lumeland/lume@v2.3.0/plugins/liquid.ts";

const site = lume();

site.use(liquid());
site.data("home", "home.json");

export default site;