import lume from "https://cdn.jsdelivr.net/gh/lumeland/lume@v2.3.0/mod.ts";
import liquid from "https://cdn.jsdelivr.net/gh/lumeland/lume@v2.3.0/plugins/liquid.ts";
import homeData from "./_data/home.ts";

const site = lume();

site.use(liquid());
site.data("home", homeData);

export default site;