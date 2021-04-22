const get_ip = require('ipware')().get_ip;
const geoip = require('geoip-country');

module.exports.setLocation = (req, res, next) => {
    ip = get_ip(req);
    geo = geoip.lookup(ip.clientIp);
    if (geo) {
        req.ip = ip.clientIp,
        req.country = geo.country
    }

    next();
}