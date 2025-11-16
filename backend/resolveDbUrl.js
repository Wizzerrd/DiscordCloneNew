import { buildDatabaseURL } from "./lib/buildDatabaseURL.js";

const url = await buildDatabaseURL();
console.log(url);