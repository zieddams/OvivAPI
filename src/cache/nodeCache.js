const NodeCache = require("node-cache");
let Cache = (() => {
    this.ovivCache = new NodeCache(
        /*{
                checkperiod: 5
                stdTtl: 120
            }*/
    );

    this.ovivCache.on("set", (key, value) => {
        console.log(`i see you .. putting ${key}`)
    });

    this.ovivCache.on("del", (key, value) => {
        console.log(`i see you .. deleting  ${key}`)
    });

    this.ovivCache.on("expired", (key, value) => {
        console.log(`this key "${key}" was expired`)
    });
    this.ovivCache.addUsername = (newValue) => {
        if (!this.ovivCache.has("username")) {
            this.ovivCache.set("username", [newValue]);
        } else {
            let usernames = this.ovivCache.get("username")
            usernames.push(newValue)
            this.ovivCache.del("username")
            this.ovivCache.set("username", usernames)
        }
    }
    this.ovivCache.doneUsername = (value) => {
        const usernames = this.ovivCache.get("username")
        usernameArray = usernames.filter(username => username !== value)
        this.ovivCache.del("username")
        this.ovivCache.set("username", usernameArray)
    }
    this.ovivCache.existUsername = (value) => {
        const usernames = this.ovivCache.get("username")
        return usernames.includes(value)
    }

    return this;
})();

module.exports = Cache;