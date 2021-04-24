const NodeCache = require("node-cache");
let Cache = (() => {
    this.ovivCache = new NodeCache({ checkperiod: 5 });

    this.ovivCache.on("set", (key, value) => {
        console.log(`i see you .. putting ${key}`)
    });

    this.ovivCache.on("del", (key, value) => {
        console.log(`i see you .. deleting  ${key}`)
    });

    this.ovivCache.on("expired", (key, value) => {
        console.log(`this key "${key}" was expired`)
    });

    return this;
})();

module.exports = Cache;