const  get_ip = require('ipware')().get_ip;
const geoip = require('geoip-country');

module.exports.setLocation = (req,res,next) => {
    ip  = get_ip(req);
    geo = geoip.lookup(ip.clientIp);
    req.client.ip = ip.clientIp;
    req.client.country =geo.country;
    next();
}