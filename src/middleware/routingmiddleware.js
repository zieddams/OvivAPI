const get_ip = require('ipware')().get_ip;
const geoip = require('geoip-country');
const lookup = require('country-code-lookup')

module.exports.setLocation = (req, res, next) => {
    ip = get_ip(req);
    geo = geoip.lookup(ip.clientIp);

    if (geo) {
            req.ip = ip.clientIp,
            req.country_code = geo.country
            req.country = lookup.byIso(geo.country).country
            //console.log(` IP : ${ip.clientIp} . Country code : ${geo.country} . Country ! ${req.country.country}`)
    }
    next();
}