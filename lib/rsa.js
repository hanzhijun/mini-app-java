
var window2 = {
    ASN1 : null,
    Base64 : null,
    Hex : null,
    crypto : null,
    href : null
};

var KJUR = null;

if (typeof YAHOO == "undefined" || !YAHOO) {
    var YAHOO = {};
}
YAHOO.namespace = function() {
    var b = arguments,
    g = null,
    e, c, f;
    for (e = 0; e < b.length; e = e + 1) {
        f = ("" + b[e]).split(".");
        g = YAHOO;
        for (c = (f[0] == "YAHOO") ? 1 : 0; c < f.length; c = c + 1) {
            g[f[c]] = g[f[c]] || {};
            g = g[f[c]];
        }
    }
    return g;
};
YAHOO.log = function(d, a, c) {
    var b = YAHOO.widget.Logger;
    if (b && b.log) {
        return b.log(d, a, c);
    } else {
        return false;
    }
};
YAHOO.register = function(a, f, e) {
    var k = YAHOO.env.modules,
    c, j, h, g, d;
    if (!k[a]) {
        k[a] = {
            versions: [],
            builds: []
        };
    }
    c = k[a];
    j = e.version;
    h = e.build;
    g = YAHOO.env.listeners;
    c.name = a;
    c.version = j;
    c.build = h;
    c.versions.push(j);
    c.builds.push(h);
    c.mainClass = f;
    for (d = 0; d < g.length; d = d + 1) {
        g[d](c);
    }
    if (f) {
        f.VERSION = j;
        f.BUILD = h;
    } else {
        YAHOO.log("mainClass is undefined for module " + a, "warn");
    }
};
YAHOO.env = YAHOO.env || {
    modules: [],
    listeners: []
};
YAHOO.env.getVersion = function(a) {
    return YAHOO.env.modules[a] || null;
};
YAHOO.env.parseUA = function(d) {
    var e = function(i) {
        var j = 0;
        return parseFloat(i.replace(/\./g,
        function() {
            return (j++==1) ? "": ".";
        }));
    },
    g = {
        ie: 0,
        opera: 0,
        gecko: 0,
        webkit: 0,
        chrome: 0,
        mobile: null,
        air: 0,
        ipad: 0,
        iphone: 0,
        ipod: 0,
        ios: null,
        android: 0,
        webos: 0,
        caja: null,
        secure: false,
        os: null
    },
    c = d,
    f = window2 && window2.location,
    b = f && f.href,
    a;
    g.secure = b && (b.toLowerCase().indexOf("https") === 0);
    if (c) {
        if ((/windows|win32/i).test(c)) {
            g.os = "windows";
        } else {
            if ((/macintosh/i).test(c)) {
                g.os = "macintosh";
            } else {
                if ((/rhino/i).test(c)) {
                    g.os = "rhino";
                }
            }
        }
        if ((/KHTML/).test(c)) {
            g.webkit = 1;
        }
        a = c.match(/AppleWebKit\/([^\s]*)/);
        if (a && a[1]) {
            g.webkit = e(a[1]);
            if (/ Mobile\//.test(c)) {
                g.mobile = "Apple";
                a = c.match(/OS ([^\s]*)/);
                if (a && a[1]) {
                    a = e(a[1].replace("_", "."));
                }
                g.ios = a;
                g.ipad = g.ipod = g.iphone = 0;
                a = c.match(/iPad|iPod|iPhone/);
                if (a && a[0]) {
                    g[a[0].toLowerCase()] = g.ios;
                }
            } else {
                a = c.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/);
                if (a) {
                    g.mobile = a[0];
                }
                if (/webOS/.test(c)) {
                    g.mobile = "WebOS";
                    a = c.match(/webOS\/([^\s]*);/);
                    if (a && a[1]) {
                        g.webos = e(a[1]);
                    }
                }
                if (/ Android/.test(c)) {
                    g.mobile = "Android";
                    a = c.match(/Android ([^\s]*);/);
                    if (a && a[1]) {
                        g.android = e(a[1]);
                    }
                }
            }
            a = c.match(/Chrome\/([^\s]*)/);
            if (a && a[1]) {
                g.chrome = e(a[1]);
            } else {
                a = c.match(/AdobeAIR\/([^\s]*)/);
                if (a) {
                    g.air = a[0];
                }
            }
        }
        if (!g.webkit) {
            a = c.match(/Opera[\s\/]([^\s]*)/);
            if (a && a[1]) {
                g.opera = e(a[1]);
                a = c.match(/Version\/([^\s]*)/);
                if (a && a[1]) {
                    g.opera = e(a[1]);
                }
                a = c.match(/Opera Mini[^;]*/);
                if (a) {
                    g.mobile = a[0];
                }
            } else {
                a = c.match(/MSIE\s([^;]*)/);
                if (a && a[1]) {
                    g.ie = e(a[1]);
                } else {
                    a = c.match(/Gecko\/([^\s]*)/);
                    if (a) {
                        g.gecko = 1;
                        a = c.match(/rv:([^\s\)]*)/);
                        if (a && a[1]) {
                            g.gecko = e(a[1]);
                        }
                    }
                }
            }
        }
    }
    return g;
};
YAHOO.env.ua = YAHOO.env.parseUA(); (function() {
    YAHOO.namespace("util", "widget", "example");
    if ("undefined" !== typeof YAHOO_config) {
        var b = YAHOO_config.listener,
        a = YAHOO.env.listeners,
        d = true,
        c;
        if (b) {
            for (c = 0; c < a.length; c++) {
                if (a[c] == b) {
                    d = false;
                    break;
                }
            }
            if (d) {
                a.push(b);
            }
        }
    }
})();
YAHOO.lang = YAHOO.lang || {}; (function() {
    var f = YAHOO.lang,
    a = Object.prototype,
    c = "[object Array]",
    h = "[object Function]",
    g = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "/": "&#x2F;",
        "`": "&#x60;"
    },
    d = ["toString", "valueOf"],
    e = {
        isArray: function(j) {
            return a.toString.apply(j) === c;
        },
        isFunction: function(j) {
            return (typeof j === "function") || a.toString.apply(j) === h;
        },
        isNumber: function(j) {
            return typeof j === "number" && isFinite(j);
        },
        isObject: function(j) {
            return (j && (typeof j === "object" || f.isFunction(j))) || false;
        },
        isUndefined: function(j) {
            return typeof j === "undefined";
        },
        _IEEnumFix: (YAHOO.env.ua.ie) ?
        function(l, k) {
            var j, n, m;
            for (j = 0; j < d.length; j = j + 1) {
                n = d[j];
                m = k[n];
                if (f.isFunction(m) && m != a[n]) {
                    l[n] = m;
                }
            }
        }: function() {},
        extend: function(m, n, l) {
            var k = function() {},
            j;
            k.prototype = n.prototype;
            m.prototype = new k();
            m.prototype.constructor = m;
            m.superclass = n.prototype;
            if (n.prototype.constructor == a.constructor) {
                n.prototype.constructor = n;
            }
            if (l) {
                for (j in l) {
                    if (f.hasOwnProperty(l, j)) {
                        m.prototype[j] = l[j];
                    }
                }
                f._IEEnumFix(m.prototype, l);
            }
        },
        augmentObject: function(n, m) {
            var j = arguments,
            l, o, k = j[2];
            if (k && k !== true) {
                for (l = 2; l < j.length; l = l + 1) {
                    n[j[l]] = m[j[l]];
                }
            } else {
                for (o in m) {
                    if (k || !(o in n)) {
                        n[o] = m[o];
                    }
                }
                f._IEEnumFix(n, m);
            }
            return n;
        },
        augmentProto: function(m, l) {
            var j = [m.prototype, l.prototype],
            k;
            for (k = 2; k < arguments.length; k = k + 1) {
                j.push(arguments[k]);
            }
            f.augmentObject.apply(this, j);
            return m;
        },
        dump: function(j, p) {
            var l, n, r = [],
            t = "{...}",
            k = "f(){...}",
            q = ", ",
            m = " => ";
            if (!f.isObject(j)) {
                return j + "";
            } else {
                if (j instanceof Date || ("nodeType" in j && "tagName" in j)) {
                    return j;
                } else {
                    if (f.isFunction(j)) {
                        return k;
                    }
                }
            }
            p = (f.isNumber(p)) ? p: 3;
            if (f.isArray(j)) {
                r.push("[");
                for (l = 0, n = j.length; l < n; l = l + 1) {
                    if (f.isObject(j[l])) {
                        r.push((p > 0) ? f.dump(j[l], p - 1) : t);
                    } else {
                        r.push(j[l]);
                    }
                    r.push(q);
                }
                if (r.length > 1) {
                    r.pop();
                }
                r.push("]");
            } else {
                r.push("{");
                for (l in j) {
                    if (f.hasOwnProperty(j, l)) {
                        r.push(l + m);
                        if (f.isObject(j[l])) {
                            r.push((p > 0) ? f.dump(j[l], p - 1) : t);
                        } else {
                            r.push(j[l]);
                        }
                        r.push(q);
                    }
                }
                if (r.length > 1) {
                    r.pop();
                }
                r.push("}");
            }
            return r.join("");
        }
    };
    f.hasOwnProperty = (a.hasOwnProperty) ?
    function(j, k) {
        return j && j.hasOwnProperty && j.hasOwnProperty(k);
    }: function(j, k) {
        return ! f.isUndefined(j[k]) && j.constructor.prototype[k] !== j[k];
    };
    e.augmentObject(f, e, true);
    YAHOO.util.Lang = f;
    f.augment = f.augmentProto;
    YAHOO.augment = f.augmentProto;
    YAHOO.extend = f.extend;
})();
YAHOO.register("yahoo", YAHOO, {
    version: "2.9.0",
    build: "2800"
});
var CryptoJS = CryptoJS || (function(e, g) {
    var a = {};
    var b = a.lib = {};
    var j = b.Base = (function() {
        function n() {}
        return {
            extend: function(p) {
                n.prototype = this;
                var o = new n();
                if (p) {
                    o.mixIn(p)
                }
                if (!o.hasOwnProperty("init")) {
                    o.init = function() {
                        o.$super.init.apply(this, arguments)
                    }
                }
                o.init.prototype = o;
                o.$super = this;
                return o
            },
            create: function() {
                var o = this.extend();
                o.init.apply(o, arguments);
                return o
            },
            init: function() {},
            mixIn: function(p) {
                for (var o in p) {
                    if (p.hasOwnProperty(o)) {
                        this[o] = p[o]
                    }
                }
                if (p.hasOwnProperty("toString")) {
                    this.toString = p.toString
                }
            },
            clone: function() {
                return this.init.prototype.extend(this)
            }
        }
    } ());
    var l = b.WordArray = j.extend({
        init: function(o, n) {
            o = this.words = o || [];
            if (n != g) {
                this.sigBytes = n
            } else {
                this.sigBytes = o.length * 4
            }
        },
        toString: function(n) {
            return (n || h).stringify(this)
        },
        concat: function(t) {
            var q = this.words;
            var p = t.words;
            var n = this.sigBytes;
            var s = t.sigBytes;
            this.clamp();
            if (n % 4) {
                for (var r = 0; r < s; r++) {
                    var o = (p[r >>> 2] >>> (24 - (r % 4) * 8)) & 255;
                    q[(n + r) >>> 2] |= o << (24 - ((n + r) % 4) * 8)
                }
            } else {
                for (var r = 0; r < s; r += 4) {
                    q[(n + r) >>> 2] = p[r >>> 2]
                }
            }
            this.sigBytes += s;
            return this
        },
        clamp: function() {
            var o = this.words;
            var n = this.sigBytes;
            o[n >>> 2] &= 4294967295 << (32 - (n % 4) * 8);
            o.length = e.ceil(n / 4)
        },
        clone: function() {
            var n = j.clone.call(this);
            n.words = this.words.slice(0);
            return n
        },
        random: function(p) {
            var o = [];
            for (var n = 0; n < p; n += 4) {
                o.push((e.random() * 4294967296) | 0)
            }
            return new l.init(o, p)
        }
    });
    var m = a.enc = {};
    var h = m.Hex = {
        stringify: function(p) {
            var r = p.words;
            var o = p.sigBytes;
            var q = [];
            for (var n = 0; n < o; n++) {
                var s = (r[n >>> 2] >>> (24 - (n % 4) * 8)) & 255;
                q.push((s >>> 4).toString(16));
                q.push((s & 15).toString(16))
            }
            return q.join("")
        },
        parse: function(p) {
            var n = p.length;
            var q = [];
            for (var o = 0; o < n; o += 2) {
                q[o >>> 3] |= parseInt(p.substr(o, 2), 16) << (24 - (o % 8) * 4)
            }
            return new l.init(q, n / 2)
        }
    };
    var d = m.Latin1 = {
        stringify: function(q) {
            var r = q.words;
            var p = q.sigBytes;
            var n = [];
            for (var o = 0; o < p; o++) {
                var s = (r[o >>> 2] >>> (24 - (o % 4) * 8)) & 255;
                n.push(String.fromCharCode(s))
            }
            return n.join("")
        },
        parse: function(p) {
            var n = p.length;
            var q = [];
            for (var o = 0; o < n; o++) {
                q[o >>> 2] |= (p.charCodeAt(o) & 255) << (24 - (o % 4) * 8)
            }
            return new l.init(q, n)
        }
    };
    var c = m.Utf8 = {
        stringify: function(n) {
            try {
                return decodeURIComponent(escape(d.stringify(n)))
            } catch(o) {}
        },
        parse: function(n) {
            return d.parse(unescape(encodeURIComponent(n)))
        }
    };
    var i = b.BufferedBlockAlgorithm = j.extend({
        reset: function() {
            this._data = new l.init();
        },
        clone: function() {
            var n = j.clone.call(this);
            n._data = this._data.clone();
            return n
        },
        _minBufferSize: 0
    });
    b.Hasher = i.extend({
        cfg: j.extend(),
        init: function(n) {
            this.cfg = this.cfg.extend(n);
            this.reset()
        },
        reset: function() {
            i.reset.call(this);
            this._doReset()
        },
        blockSize: 512 / 32
    });
    a.algo = {};
    return a
} (Math));
(function(g) {
    var a = CryptoJS,
    f = a.lib,
    e = f.Base,
    h = f.WordArray,
    a = a.x64 = {};
    a.Word = e.extend({
        init: function(b, c) {
            this.high = b;
            this.low = c
        }
    });
    a.WordArray = e.extend({
        init: function(b, c) {
            b = this.words = b || [];
            this.sigBytes = c != g ? c: 8 * b.length
        },
        toX32: function() {
            for (var b = this.words,
            c = b.length,
            a = [], d = 0; d < c; d++) {
                var e = b[d];
                a.push(e.high);
                a.push(e.low)
            }
            return h.create(a, this.sigBytes)
        },
        clone: function() {
            for (var b = e.clone.call(this), c = b.words = this.words.slice(0), a = c.length, d = 0; d < a; d++) c[d] = c[d].clone();
            return b
        }
    })
})();

var b64map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var b64pad = "=";
function hex2b64(d) {
    var b;
    var e;
    var a = "";
    for (b = 0; b + 3 <= d.length; b += 3) {
        e = parseInt(d.substring(b, b + 3), 16);
        a += b64map.charAt(e >> 6) + b64map.charAt(e & 63)
    }
    if (b + 1 == d.length) {
        e = parseInt(d.substring(b, b + 1), 16);
        a += b64map.charAt(e << 2)
    } else {
        if (b + 2 == d.length) {
            e = parseInt(d.substring(b, b + 2), 16);
            a += b64map.charAt(e >> 2) + b64map.charAt((e & 3) << 4)
        }
    }
    if (b64pad) {
        while ((a.length & 3) > 0) {
            a += b64pad
        }
    }
    return a
}
function b64tohex(f) {
    var d = "";
    var e;
    var b = 0;
    var c;
    var a;
    for (e = 0; e < f.length; ++e) {
        if (f.charAt(e) == b64pad) {
            break
        }
        a = b64map.indexOf(f.charAt(e));
        if (a < 0) {
            continue
        }
        if (b == 0) {
            d += int2char(a >> 2);
            c = a & 3;
            b = 1
        } else {
            if (b == 1) {
                d += int2char((c << 2) | (a >> 4));
                c = a & 15;
                b = 2
            } else {
                if (b == 2) {
                    d += int2char(c);
                    d += int2char(a >> 2);
                    c = a & 3;
                    b = 3
                } else {
                    d += int2char((c << 2) | (a >> 4));
                    d += int2char(a & 15);
                    b = 0
                }
            }
        }
    }
    if (b == 1) {
        d += int2char(c << 2)
    }
    return d
}
var dbits;
function BigInteger(e, d, f) {
    if (e != null) {
        if ("number" == typeof e) {
            this.fromNumber(e, d, f)
        } else {
            if (d == null && "string" != typeof e) {
                this.fromString(e, 256)
            } else {
                this.fromString(e, d)
            }
        }
    }
}
function nbi() {
    return new BigInteger(null)
}
function am1(f, a, b, e, h, g) {
    while (--g >= 0) {
        var d = a * this[f++] + b[e] + h;
        h = Math.floor(d / 67108864);
        b[e++] = d & 67108863
    }
    return h
}
BigInteger.prototype.am = am1;
dbits = 26;
BigInteger.prototype.DB = dbits;
BigInteger.prototype.DM = ((1 << dbits) - 1);
BigInteger.prototype.DV = (1 << dbits);
var BI_FP = 52;
BigInteger.prototype.FV = Math.pow(2, BI_FP);
BigInteger.prototype.F1 = BI_FP - dbits;
BigInteger.prototype.F2 = 2 * dbits - BI_FP;
var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
var BI_RC = new Array();
var rr, vv;
rr = "0".charCodeAt(0);
for (vv = 0; vv <= 9; ++vv) {
    BI_RC[rr++] = vv
}
rr = "a".charCodeAt(0);
for (vv = 10; vv < 36; ++vv) {
    BI_RC[rr++] = vv
}
rr = "A".charCodeAt(0);
for (vv = 10; vv < 36; ++vv) {
    BI_RC[rr++] = vv
}
function int2char(a) {
    return BI_RM.charAt(a)
}
function intAt(b, a) {
    var d = BI_RC[b.charCodeAt(a)];
    return (d == null) ? -1 : d
}
function bnpCopyTo(b) {
    for (var a = this.t - 1; a >= 0; --a) {
        b[a] = this[a]
    }
    b.t = this.t;
    b.s = this.s
}
function bnpFromInt(a) {
    this.t = 1;
    this.s = (a < 0) ? -1 : 0;
    if (a > 0) {
        this[0] = a
    } else {
        if (a < -1) {
            this[0] = a + this.DV
        } else {
            this.t = 0
        }
    }
}
function nbv(a) {
    var b = nbi();
    b.fromInt(a);
    return b
}
function bnpFromString(h, c) {
    var e;
    if (c == 16) {
        e = 4
    } else {
        if (c == 8) {
            e = 3
        } else {
            if (c == 256) {
                e = 8
            } else {
                if (c == 2) {
                    e = 1
                } else {
                    if (c == 32) {
                        e = 5
                    } else {
                        if (c == 4) {
                            e = 2
                        } else {
                            this.fromRadix(h, c);
                            return
                        }
                    }
                }
            }
        }
    }
    this.t = 0;
    this.s = 0;
    var g = h.length,
    d = false,
    f = 0;
    while (--g >= 0) {
        var a = (e == 8) ? h[g] & 255 : intAt(h, g);
        if (a < 0) {
            if (h.charAt(g) == "-") {
                d = true
            }
            continue
        }
        d = false;
        if (f == 0) {
            this[this.t++] = a
        } else {
            if (f + e > this.DB) {
                this[this.t - 1] |= (a & ((1 << (this.DB - f)) - 1)) << f;
                this[this.t++] = (a >> (this.DB - f))
            } else {
                this[this.t - 1] |= a << f
            }
        }
        f += e;
        if (f >= this.DB) {
            f -= this.DB
        }
    }
    if (e == 8 && (h[0] & 128) != 0) {
        this.s = -1;
        if (f > 0) {
            this[this.t - 1] |= ((1 << (this.DB - f)) - 1) << f
        }
    }
    this.clamp();
    if (d) {
        BigInteger.ZERO.subTo(this, this)
    }
}
function bnpClamp() {
    var a = this.s & this.DM;
    while (this.t > 0 && this[this.t - 1] == a) {--this.t
    }
}
function bnToString(c) {
    if (this.s < 0) {
        return "-" + this.negate().toString(c)
    }
    var e;
    if (c == 16) {
        e = 4
    } else {
        if (c == 8) {
            e = 3
        } else {
            if (c == 2) {
                e = 1
            } else {
                if (c == 32) {
                    e = 5
                } else {
                    if (c == 4) {
                        e = 2
                    } else {
                        return this.toRadix(c)
                    }
                }
            }
        }
    }
    var g = (1 << e) - 1,
    l,
    a = false,
    h = "",
    f = this.t;
    var j = this.DB - (f * this.DB) % e;
    if (f-->0) {
        if (j < this.DB && (l = this[f] >> j) > 0) {
            a = true;
            h = int2char(l)
        }
        while (f >= 0) {
            if (j < e) {
                l = (this[f] & ((1 << j) - 1)) << (e - j);
                l |= this[--f] >> (j += this.DB - e)
            } else {
                l = (this[f] >> (j -= e)) & g;
                if (j <= 0) {
                    j += this.DB; --f
                }
            }
            if (l > 0) {
                a = true
            }
            if (a) {
                h += int2char(l)
            }
        }
    }
    return a ? h: "0"
}
function bnNegate() {
    var a = nbi();
    BigInteger.ZERO.subTo(this, a);
    return a
}
function bnAbs() {
    return (this.s < 0) ? this.negate() : this
}
function bnCompareTo(b) {
    var d = this.s - b.s;
    if (d != 0) {
        return d
    }
    var c = this.t;
    d = c - b.t;
    if (d != 0) {
        return (this.s < 0) ? -d: d
    }
    while (--c >= 0) {
        if ((d = this[c] - b[c]) != 0) {
            return d
        }
    }
    return 0
}
function nbits(a) {
    var c = 1,
    b;
    if ((b = a >>> 16) != 0) {
        a = b;
        c += 16
    }
    if ((b = a >> 8) != 0) {
        a = b;
        c += 8
    }
    if ((b = a >> 4) != 0) {
        a = b;
        c += 4
    }
    if ((b = a >> 2) != 0) {
        a = b;
        c += 2
    }
    if ((b = a >> 1) != 0) {
        a = b;
        c += 1
    }
    return c
}
function bnBitLength() {
    if (this.t <= 0) {
        return 0
    }
    return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ (this.s & this.DM))
}
function bnpDLShiftTo(c, b) {
    var a;
    for (a = this.t - 1; a >= 0; --a) {
        b[a + c] = this[a]
    }
    for (a = c - 1; a >= 0; --a) {
        b[a] = 0
    }
    b.t = this.t + c;
    b.s = this.s
}
function bnpDRShiftTo(c, b) {
    for (var a = c; a < this.t; ++a) {
        b[a - c] = this[a]
    }
    b.t = Math.max(this.t - c, 0);
    b.s = this.s
}
function bnpLShiftTo(j, e) {
    var b = j % this.DB;
    var a = this.DB - b;
    var g = (1 << a) - 1;
    var f = Math.floor(j / this.DB),
    h = (this.s << b) & this.DM,
    d;
    for (d = this.t - 1; d >= 0; --d) {
        e[d + f + 1] = (this[d] >> a) | h;
        h = (this[d] & g) << b
    }
    for (d = f - 1; d >= 0; --d) {
        e[d] = 0
    }
    e[f] = h;
    e.t = this.t + f + 1;
    e.s = this.s;
    e.clamp()
}
function bnpRShiftTo(g, d) {
    d.s = this.s;
    var e = Math.floor(g / this.DB);
    if (e >= this.t) {
        d.t = 0;
        return
    }
    var b = g % this.DB;
    var a = this.DB - b;
    var f = (1 << b) - 1;
    d[0] = this[e] >> b;
    for (var c = e + 1; c < this.t; ++c) {
        d[c - e - 1] |= (this[c] & f) << a;
        d[c - e] = this[c] >> b
    }
    if (b > 0) {
        d[this.t - e - 1] |= (this.s & f) << a
    }
    d.t = this.t - e;
    d.clamp()
}
function bnpSubTo(d, f) {
    var e = 0,
    g = 0,
    b = Math.min(d.t, this.t);
    while (e < b) {
        g += this[e] - d[e];
        f[e++] = g & this.DM;
        g >>= this.DB
    }
    if (d.t < this.t) {
        g -= d.s;
        while (e < this.t) {
            g += this[e];
            f[e++] = g & this.DM;
            g >>= this.DB
        }
        g += this.s
    } else {
        g += this.s;
        while (e < d.t) {
            g -= d[e];
            f[e++] = g & this.DM;
            g >>= this.DB
        }
        g -= d.s
    }
    f.s = (g < 0) ? -1 : 0;
    if (g < -1) {
        f[e++] = this.DV + g
    } else {
        if (g > 0) {
            f[e++] = g
        }
    }
    f.t = e;
    f.clamp()
}
function bnpMultiplyTo(c, e) {
    var b = this.abs(),
    f = c.abs();
    var d = b.t;
    e.t = d + f.t;
    while (--d >= 0) {
        e[d] = 0
    }
    for (d = 0; d < f.t; ++d) {
        e[d + b.t] = b.am(0, f[d], e, d, 0, b.t)
    }
    e.s = 0;
    e.clamp();
    if (this.s != c.s) {
        BigInteger.ZERO.subTo(e, e)
    }
}
function bnpSquareTo(d) {
    var a = this.abs();
    var b = d.t = 2 * a.t;
    while (--b >= 0) {
        d[b] = 0
    }
    for (b = 0; b < a.t - 1; ++b) {
        var e = a.am(b, a[b], d, 2 * b, 0, 1);
        if ((d[b + a.t] += a.am(b + 1, 2 * a[b], d, 2 * b + 1, e, a.t - b - 1)) >= a.DV) {
            d[b + a.t] -= a.DV;
            d[b + a.t + 1] = 1
        }
    }
    if (d.t > 0) {
        d[d.t - 1] += a.am(b, a[b], d, 2 * b, 0, 1)
    }
    d.s = 0;
    d.clamp()
}
function bnpDivRemTo(n, h, g) {
    var w = n.abs();
    if (w.t <= 0) {
        return
    }
    var k = this.abs();
    if (k.t < w.t) {
        if (h != null) {
            h.fromInt(0)
        }
        if (g != null) {
            this.copyTo(g)
        }
        return
    }
    if (g == null) {
        g = nbi()
    }
    var d = nbi(),
    a = this.s,
    l = n.s;
    var v = this.DB - nbits(w[w.t - 1]);
    if (v > 0) {
        w.lShiftTo(v, d);
        k.lShiftTo(v, g)
    } else {
        w.copyTo(d);
        k.copyTo(g)
    }
    var p = d.t;
    var b = d[p - 1];
    if (b == 0) {
        return
    }
    var o = b * (1 << this.F1) + ((p > 1) ? d[p - 2] >> this.F2: 0);
    var A = this.FV / o,
    z = (1 << this.F1) / o,
    x = 1 << this.F2;
    var u = g.t,
    s = u - p,
    f = (h == null) ? nbi() : h;
    d.dlShiftTo(s, f);
    if (g.compareTo(f) >= 0) {
        g[g.t++] = 1;
        g.subTo(f, g)
    }
    BigInteger.ONE.dlShiftTo(p, f);
    f.subTo(d, d);
    while (d.t < p) {
        d[d.t++] = 0
    }
    while (--s >= 0) {
        var c = (g[--u] == b) ? this.DM: Math.floor(g[u] * A + (g[u - 1] + x) * z);
        if ((g[u] += d.am(0, c, g, s, 0, p)) < c) {
            d.dlShiftTo(s, f);
            g.subTo(f, g);
            while (g[u] < --c) {
                g.subTo(f, g)
            }
        }
    }
    if (h != null) {
        g.drShiftTo(p, h);
        if (a != l) {
            BigInteger.ZERO.subTo(h, h)
        }
    }
    g.t = p;
    g.clamp();
    if (v > 0) {
        g.rShiftTo(v, g)
    }
    if (a < 0) {
        BigInteger.ZERO.subTo(g, g)
    }
}
function bnMod(b) {
    var c = nbi();
    this.abs().divRemTo(b, null, c);
    if (this.s < 0 && c.compareTo(BigInteger.ZERO) > 0) {
        b.subTo(c, c)
    }
    return c
}
function Classic(a) {
    this.m = a
}
function cConvert(a) {
    if (a.s < 0 || a.compareTo(this.m) >= 0) {
        return a.mod(this.m)
    } else {
        return a
    }
}
function cRevert(a) {
    return a
}
function cReduce(a) {
    a.divRemTo(this.m, null, a)
}
function cMulTo(a, c, b) {
    a.multiplyTo(c, b);
    this.reduce(b)
}
function cSqrTo(a, b) {
    a.squareTo(b);
    this.reduce(b)
}
Classic.prototype.convert = cConvert;
Classic.prototype.revert = cRevert;
Classic.prototype.reduce = cReduce;
Classic.prototype.mulTo = cMulTo;
Classic.prototype.sqrTo = cSqrTo;
function bnpInvDigit() {
    if (this.t < 1) {
        return 0
    }
    var a = this[0];
    if ((a & 1) == 0) {
        return 0
    }
    var b = a & 3;
    b = (b * (2 - (a & 15) * b)) & 15;
    b = (b * (2 - (a & 255) * b)) & 255;
    b = (b * (2 - (((a & 65535) * b) & 65535))) & 65535;
    b = (b * (2 - a * b % this.DV)) % this.DV;
    return (b > 0) ? this.DV - b: -b
}
function Montgomery(a) {
    this.m = a;
    this.mp = a.invDigit();
    this.mpl = this.mp & 32767;
    this.mph = this.mp >> 15;
    this.um = (1 << (a.DB - 15)) - 1;
    this.mt2 = 2 * a.t
}
function montConvert(a) {
    var b = nbi();
    a.abs().dlShiftTo(this.m.t, b);
    b.divRemTo(this.m, null, b);
    if (a.s < 0 && b.compareTo(BigInteger.ZERO) > 0) {
        this.m.subTo(b, b)
    }
    return b
}
function montRevert(a) {
    var b = nbi();
    a.copyTo(b);
    this.reduce(b);
    return b
}
function montReduce(a) {
    while (a.t <= this.mt2) {
        a[a.t++] = 0
    }
    for (var c = 0; c < this.m.t; ++c) {
        var b = a[c] & 32767;
        var d = (b * this.mpl + (((b * this.mph + (a[c] >> 15) * this.mpl) & this.um) << 15)) & a.DM;
        b = c + this.m.t;
        a[b] += this.m.am(0, d, a, c, 0, this.m.t);
        while (a[b] >= a.DV) {
            a[b] -= a.DV;
            a[++b]++
        }
    }
    a.clamp();
    a.drShiftTo(this.m.t, a);
    if (a.compareTo(this.m) >= 0) {
        a.subTo(this.m, a)
    }
}
function montSqrTo(a, b) {
    a.squareTo(b);
    this.reduce(b)
}
function montMulTo(a, c, b) {
    a.multiplyTo(c, b);
    this.reduce(b)
}
Montgomery.prototype.convert = montConvert;
Montgomery.prototype.revert = montRevert;
Montgomery.prototype.reduce = montReduce;
Montgomery.prototype.mulTo = montMulTo;
Montgomery.prototype.sqrTo = montSqrTo;
function bnpIsEven() {
    return ((this.t > 0) ? (this[0] & 1) : this.s) == 0
}
function bnpExp(h, j) {
    if (h > 4294967295 || h < 1) {
        return BigInteger.ONE
    }
    var f = nbi(),
    a = nbi(),
    d = j.convert(this),
    c = nbits(h) - 1;
    d.copyTo(f);
    while (--c >= 0) {
        j.sqrTo(f, a);
        if ((h & (1 << c)) > 0) {
            j.mulTo(a, d, f)
        } else {
            var b = f;
            f = a;
            a = b
        }
    }
    return j.revert(f)
}
function bnModPowInt(b, a) {
    var c;
    if (b < 256 || a.isEven()) {
        c = new Classic(a)
    } else {
        c = new Montgomery(a)
    }
    return this.exp(b, c)
}
BigInteger.prototype.copyTo = bnpCopyTo;
BigInteger.prototype.fromInt = bnpFromInt;
BigInteger.prototype.fromString = bnpFromString;
BigInteger.prototype.clamp = bnpClamp;
BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
BigInteger.prototype.drShiftTo = bnpDRShiftTo;
BigInteger.prototype.lShiftTo = bnpLShiftTo;
BigInteger.prototype.rShiftTo = bnpRShiftTo;
BigInteger.prototype.subTo = bnpSubTo;
BigInteger.prototype.multiplyTo = bnpMultiplyTo;
BigInteger.prototype.squareTo = bnpSquareTo;
BigInteger.prototype.divRemTo = bnpDivRemTo;
BigInteger.prototype.invDigit = bnpInvDigit;
BigInteger.prototype.isEven = bnpIsEven;
BigInteger.prototype.exp = bnpExp;
BigInteger.prototype.toString = bnToString;
BigInteger.prototype.negate = bnNegate;
BigInteger.prototype.abs = bnAbs;
BigInteger.prototype.compareTo = bnCompareTo;
BigInteger.prototype.bitLength = bnBitLength;
BigInteger.prototype.mod = bnMod;
BigInteger.prototype.modPowInt = bnModPowInt;
BigInteger.ZERO = nbv(0);
BigInteger.ONE = nbv(1);
function bnClone() {
    var a = nbi();
    this.copyTo(a);
    return a
}
function bnIntValue() {
    if (this.s < 0) {
        if (this.t == 1) {
            return this[0] - this.DV
        } else {
            if (this.t == 0) {
                return - 1
            }
        }
    } else {
        if (this.t == 1) {
            return this[0]
        } else {
            if (this.t == 0) {
                return 0
            }
        }
    }
    return ((this[1] & ((1 << (32 - this.DB)) - 1)) << this.DB) | this[0]
}
function bnpChunkSize(a) {
    return Math.floor(Math.LN2 * this.DB / Math.log(a))
}
function bnSigNum() {
    if (this.s < 0) {
        return - 1
    } else {
        if (this.t <= 0 || (this.t == 1 && this[0] <= 0)) {
            return 0
        } else {
            return 1
        }
    }
}
function bnpToRadix(c) {
    if (c == null) {
        c = 10
    }
    if (this.signum() == 0 || c < 2 || c > 36) {
        return "0"
    }
    var f = this.chunkSize(c);
    var e = Math.pow(c, f);
    var i = nbv(e),
    j = nbi(),
    h = nbi(),
    g = "";
    this.divRemTo(i, j, h);
    while (j.signum() > 0) {
        g = (e + h.intValue()).toString(c).substr(1) + g;
        j.divRemTo(i, j, h)
    }
    return h.intValue().toString(c) + g
}
function bnpFromRadix(m, h) {
    this.fromInt(0);
    if (h == null) {
        h = 10
    }
    var f = this.chunkSize(h);
    var g = Math.pow(h, f),
    e = false,
    a = 0,
    l = 0;
    for (var c = 0; c < m.length; ++c) {
        var k = intAt(m, c);
        if (k < 0) {
            if (m.charAt(c) == "-" && this.signum() == 0) {
                e = true
            }
            continue
        }
        l = h * l + k;
        if (++a >= f) {
            this.dMultiply(g);
            this.dAddOffset(l, 0);
            a = 0;
            l = 0
        }
    }
    if (a > 0) {
        this.dMultiply(Math.pow(h, a));
        this.dAddOffset(l, 0)
    }
    if (e) {
        BigInteger.ZERO.subTo(this, this)
    }
}
function bnpFromNumber(f, e, h) {
    if ("number" == typeof e) {
        if (f < 2) {
            this.fromInt(1)
        } else {
            this.fromNumber(f, h);
            if (!this.testBit(f - 1)) {
                this.bitwiseTo(BigInteger.ONE.shiftLeft(f - 1), op_or, this)
            }
            if (this.isEven()) {
                this.dAddOffset(1, 0)
            }
            while (!this.isProbablePrime(e)) {
                this.dAddOffset(2, 0);
                if (this.bitLength() > f) {
                    this.subTo(BigInteger.ONE.shiftLeft(f - 1), this)
                }
            }
        }
    } else {
        var d = new Array(),
        g = f & 7;
        d.length = (f >> 3) + 1;
        e.nextBytes(d);
        if (g > 0) {
            d[0] &= ((1 << g) - 1)
        } else {
            d[0] = 0
        }
        this.fromString(d, 256)
    }
}
function bnMin(b) {
    return (this.compareTo(b) < 0) ? this: b
}
function bnMax(b) {
    return (this.compareTo(b) > 0) ? this: b
}
function op_or(a, b) {
    return a | b
}
function bnAdd(b) {
    var c = nbi();
    this.addTo(b, c);
    return c
}
function bnpDMultiply(a) {
    this[this.t] = this.am(0, a - 1, this, 0, 0, this.t); ++this.t;
    this.clamp()
}
function NullExp() {}
function nSqrTo(a, b) {
    a.squareTo(b)
}
NullExp.prototype.sqrTo = nSqrTo;
function bnPow(a) {
    return this.exp(a, new NullExp())
}
function Barrett(a) {
    this.r2 = nbi();
    BigInteger.ONE.dlShiftTo(2 * a.t, this.r2);
    this.m = a
}
function barrettRevert(a) {
    return a
}
function barrettSqrTo(a, b) {
    a.squareTo(b);
    this.reduce(b)
}
function barrettMulTo(a, c, b) {
    a.multiplyTo(c, b);
    this.reduce(b)
}
Barrett.prototype.revert = barrettRevert;
Barrett.prototype.mulTo = barrettMulTo;
Barrett.prototype.sqrTo = barrettSqrTo;
BigInteger.prototype.chunkSize = bnpChunkSize;
BigInteger.prototype.toRadix = bnpToRadix;
BigInteger.prototype.fromRadix = bnpFromRadix;
BigInteger.prototype.fromNumber = bnpFromNumber;
BigInteger.prototype.dMultiply = bnpDMultiply;
BigInteger.prototype.clone = bnClone;
BigInteger.prototype.intValue = bnIntValue;
BigInteger.prototype.signum = bnSigNum;
BigInteger.prototype.min = bnMin;
BigInteger.prototype.max = bnMax;
BigInteger.prototype.add = bnAdd;
BigInteger.prototype.pow = bnPow;
function Arcfour() {
    this.i = 0;
    this.j = 0;
    this.S = new Array()
}
function ARC4init(d) {
    var c, a, b;
    for (c = 0; c < 256; ++c) {
        this.S[c] = c
    }
    a = 0;
    for (c = 0; c < 256; ++c) {
        a = (a + this.S[c] + d[c % d.length]) & 255;
        b = this.S[c];
        this.S[c] = this.S[a];
        this.S[a] = b
    }
    this.i = 0;
    this.j = 0
}
function ARC4next() {
    var a;
    this.i = (this.i + 1) & 255;
    this.j = (this.j + this.S[this.i]) & 255;
    a = this.S[this.i];
    this.S[this.i] = this.S[this.j];
    this.S[this.j] = a;
    return this.S[(a + this.S[this.i]) & 255]
}
Arcfour.prototype.init = ARC4init;
Arcfour.prototype.next = ARC4next;
function prng_newstate() {
    return new Arcfour()
}
var rng_psize = 256;
var rng_state;
var rng_pool;
var rng_pptr;
function rng_seed_int(a) {
    rng_pool[rng_pptr++] ^= a & 255;
    rng_pool[rng_pptr++] ^= (a >> 8) & 255;
    rng_pool[rng_pptr++] ^= (a >> 16) & 255;
    rng_pool[rng_pptr++] ^= (a >> 24) & 255;
    if (rng_pptr >= rng_psize) {
        rng_pptr -= rng_psize
    }
}
function rng_seed_time() {
    rng_seed_int(new Date().getTime())
}
if (rng_pool == null) {
    rng_pool = new Array();
    rng_pptr = 0;
    var t;
    while (rng_pptr < rng_psize) {
        t = Math.floor(65536 * Math.random());
        rng_pool[rng_pptr++] = t >>> 8;
        rng_pool[rng_pptr++] = t & 255
    }
    rng_pptr = 0;
    rng_seed_time()
}
function rng_get_byte() {
    if (rng_state == null) {
        rng_seed_time();
        rng_state = prng_newstate();
        rng_state.init(rng_pool);
        for (rng_pptr = 0; rng_pptr < rng_pool.length; ++rng_pptr) {
            rng_pool[rng_pptr] = 0
        }
        rng_pptr = 0
    }
    return rng_state.next()
}
function rng_get_bytes(b) {
    var a;
    for (a = 0; a < b.length; ++a) {
        b[a] = rng_get_byte()
    }
}
function SecureRandom() {}
SecureRandom.prototype.nextBytes = rng_get_bytes;
function parseBigInt(b, a) {
    return new BigInteger(b, a)
}
function pkcs1pad2(e, h) {
    if (h < e.length + 11) {
        return null
    }
    var g = new Array();
    var d = e.length - 1;
    while (d >= 0 && h > 0) {
        var f = e.charCodeAt(d--);
        if (f < 128) {
            g[--h] = f
        } else {
            if ((f > 127) && (f < 2048)) {
                g[--h] = (f & 63) | 128;
                g[--h] = (f >> 6) | 192
            } else {
                g[--h] = (f & 63) | 128;
                g[--h] = ((f >> 6) & 63) | 128;
                g[--h] = (f >> 12) | 224
            }
        }
    }
    g[--h] = 0;
    var b = new SecureRandom();
    var a = new Array();
    while (h > 2) {
        a[0] = 0;
        while (a[0] == 0) {
            b.nextBytes(a)
        }
        g[--h] = a[0]
    }
    g[--h] = 2;
    g[--h] = 0;
    return new BigInteger(g)
}
function RSAKey() {
    this.n = null;
    this.e = 0;
    this.q = null;
}
function RSASetPublic(b, a) {
    if (typeof b !== "string") {
        this.n = b;
        this.e = a
    } else {
        if (b != null && a != null && b.length > 0 && a.length > 0) {
            this.n = parseBigInt(b, 16);
            this.e = parseInt(a, 16)
        }
    }
}
function RSADoPublic(a) {
    return a.modPowInt(this.e, this.n)
}
function RSAEncrypt(d) {
    var a = pkcs1pad2(d, (this.n.bitLength() + 7) >> 3);
    if (a == null) {
        return null
    }
    var e = this.doPublic(a);
    if (e == null) {
        return null
    }
    var b = e.toString(16);
    if ((b.length & 1) == 0) {
        return b
    } else {
        return "0" + b
    }
}
RSAKey.prototype.doPublic = RSADoPublic;
RSAKey.prototype.setPublic = RSASetPublic;
RSAKey.prototype.encrypt = RSAEncrypt;
function ECFieldElementFp(b, a) {
    this.x = a;
    this.q = b
}
function ECPointFp(c, a, d) {
    this.curve = c;
}
function ECCurveFp(e, d, c) {
    this.q = e;
    this.a = this.fromBigInteger(d);
    this.b = this.fromBigInteger(c);
    this.infinity = new ECPointFp(this, null, null)
}
function curveFpFromBigInteger(a) {
    return new ECFieldElementFp(this.q, a)
}
function curveFpDecodePointHex(d) {
    switch (parseInt(d.substr(0, 2), 16)) {
    case 0:
        return this.infinity;
    case 2:
    case 3:
        return null;
    case 4:
    case 6:
    case 7:
        var a = (d.length - 2) / 2;
        var c = d.substr(2, a);
        var b = d.substr(a + 2, a);
        return new ECPointFp(this, this.fromBigInteger(new BigInteger(c, 16)), this.fromBigInteger(new BigInteger(b, 16)));
    default:
        return null
    }
}
ECCurveFp.prototype.fromBigInteger = curveFpFromBigInteger;
ECCurveFp.prototype.decodePointHex = curveFpDecodePointHex;
if (typeof KJUR == "undefined" || !KJUR) {
    KJUR = {}
}
if (typeof KJUR.asn1 == "undefined" || !KJUR.asn1) {
    KJUR.asn1 = {}
}
KJUR.asn1.DEROctetString = function(b) {
    if (b !== undefined && typeof b.obj !== "undefined") {
        var a = KJUR.asn1.ASN1Util.newObject(b.obj);
        b.hex = a.getEncodedHex()
    }
    KJUR.asn1.DEROctetString.superclass.constructor.call(this, b);
};
KJUR.asn1.DERNull = function() {
    KJUR.asn1.DERNull.superclass.constructor.call(this);
};
KJUR.asn1.DERUTF8String = function(a) {
    KJUR.asn1.DERUTF8String.superclass.constructor.call(this, a);
};
KJUR.asn1.DERNumericString = function(a) {
    KJUR.asn1.DERNumericString.superclass.constructor.call(this, a);
};
KJUR.asn1.DERPrintableString = function(a) {
    KJUR.asn1.DERPrintableString.superclass.constructor.call(this, a);
};
KJUR.asn1.DERTeletexString = function(a) {
    KJUR.asn1.DERTeletexString.superclass.constructor.call(this, a);
};
KJUR.asn1.DERIA5String = function(a) {
    KJUR.asn1.DERIA5String.superclass.constructor.call(this, a);
};
var ASN1HEX = new
function() {};
ASN1HEX.getByteLengthOfL_AtObj = function(b, c) {
    if (b.substring(c + 2, c + 3) != "8") {
        return 1
    }
    var a = parseInt(b.substring(c + 3, c + 4));
    if (a == 0) {
        return - 1
    }
    if (0 < a && a < 10) {
        return a + 1
    }
    return - 2
};
ASN1HEX.getHexOfL_AtObj = function(b, c) {
    var a = ASN1HEX.getByteLengthOfL_AtObj(b, c);
    if (a < 1) {
        return ""
    }
    return b.substring(c + 2, c + 2 + a * 2)
};
ASN1HEX.getIntOfL_AtObj = function(c, d) {
    var b = ASN1HEX.getHexOfL_AtObj(c, d);
    if (b == "") {
        return - 1
    }
    var a;
    if (parseInt(b.substring(0, 1)) < 8) {
        a = new BigInteger(b, 16)
    } else {
        a = new BigInteger(b.substring(2), 16)
    }
    return a.intValue()
};
ASN1HEX.getStartPosOfV_AtObj = function(b, c) {
    var a = ASN1HEX.getByteLengthOfL_AtObj(b, c);
    if (a < 0) {
        return a
    }
    return c + (a + 1) * 2
};
ASN1HEX.getHexOfV_AtObj = function(c, d) {
    var b = ASN1HEX.getStartPosOfV_AtObj(c, d);
    var a = ASN1HEX.getIntOfL_AtObj(c, d);
    return c.substring(b, b + a * 2)
};
ASN1HEX.getHexOfTLV_AtObj = function(c, e) {
    var b = c.substr(e, 2);
    var d = ASN1HEX.getHexOfL_AtObj(c, e);
    var a = ASN1HEX.getHexOfV_AtObj(c, e);
    return b + d + a
};
ASN1HEX.getPosOfNextSibling_AtObj = function(c, d) {
    var b = ASN1HEX.getStartPosOfV_AtObj(c, d);
    var a = ASN1HEX.getIntOfL_AtObj(c, d);
    return b + a * 2
};
ASN1HEX.getPosArrayOfChildren_AtObj = function(f, j) {
    var c = new Array();
    var i = ASN1HEX.getStartPosOfV_AtObj(f, j);
    if (f.substr(j, 2) == "03") {
        c.push(i + 2)
    } else {
        c.push(i)
    }
    var b = ASN1HEX.getIntOfL_AtObj(f, j);
    var g = i;
    var d = 0;
    while (1) {
        var e = ASN1HEX.getPosOfNextSibling_AtObj(f, g);
        if (e == null || (e - i >= (b * 2))) {
            break
        }
        if (d >= 200) {
            break
        }
        c.push(e);
        g = e;
        d++
    }
    return c
};
ASN1HEX.getDecendantIndexByNthList = function(e, d, c) {
    if (c.length == 0) {
        return d
    }
    var f = c.shift();
    var b = ASN1HEX.getPosArrayOfChildren_AtObj(e, d);
    return ASN1HEX.getDecendantIndexByNthList(e, b[f], c)
};
ASN1HEX.getDecendantHexTLVByNthList = function(d, c, b) {
    var a = ASN1HEX.getDecendantIndexByNthList(d, c, b);
    return ASN1HEX.getHexOfTLV_AtObj(d, a)
};
ASN1HEX.getVbyList = function(d, c, b, e) {
    var a = ASN1HEX.getDecendantIndexByNthList(d, c, b);
    if (e !== undefined) {
    }
    return ASN1HEX.getHexOfV_AtObj(d, a)
};
ASN1HEX.pemToHex = function(b, d) {
    if (d !== undefined) {
        b = b.replace("-----BEGIN " + d + "-----", "");
        b = b.replace("-----END " + d + "-----", "")
    } else {
        b = b.replace(/-----BEGIN [^-]+-----/, "");
        b = b.replace(/-----END [^-]+-----/, "")
    }
    var c = b.replace(/\s+/g, "");
    var a = b64tohex(c);
    return a
};
if (typeof KJUR.asn1.x509 == "undefined" || !KJUR.asn1.x509) {
    KJUR.asn1.x509 = {}
}
if (typeof KJUR.asn1.cms == "undefined" || !KJUR.asn1.cms) {
    KJUR.asn1.cms = {}
}
if (typeof KJUR.crypto == "undefined" || !KJUR.crypto) {
    KJUR.crypto = {}
}
KJUR.crypto.Util = new function() {
    this.sha1 = function(a) {
        var b = new KJUR.crypto.MessageDigest({
            alg: "sha1",
            prov: "cryptojs"
        });
        return b.digestString(a)
    };
    this.sha256 = function(a) {
        var b = new KJUR.crypto.MessageDigest({
            alg: "sha256",
            prov: "cryptojs"
        });
        return b.digestString(a)
    };
    this.sha512 = function(a) {
        var b = new KJUR.crypto.MessageDigest({
            alg: "sha512",
            prov: "cryptojs"
        });
        return b.digestString(a)
    };
};
KJUR.crypto.ECParameterDB = new function() {
        var b = {};
        var c = {};
        function a(d) {
            return new BigInteger(d, 16)
        }
        this.regist = function(A, l, o, g, m, e, j, f, k, u, d, x) {
            b[A] = {};
            var s = a(o);
            var z = a(g);
            var y = a(m);
            var t = a(e);
            var w = a(j);
            var r = new ECCurveFp(s, z, y);
            var q = r.decodePointHex("04" + f + k);
            b[A]["name"] = A;
            b[A]["keylen"] = l;
            b[A]["curve"] = r;
            b[A]["G"] = q;
            b[A]["n"] = t;
            b[A]["h"] = w;
            b[A]["oid"] = d;
            b[A]["info"] = x;
            for (var v = 0; v < u.length; v++) {
                c[u[v]] = A
            }
        }
    };
KJUR.crypto.ECParameterDB.regist("secp128r1", 128, "FFFFFFFDFFFFFFFFFFFFFFFFFFFFFFFF", "FFFFFFFDFFFFFFFFFFFFFFFFFFFFFFFC", "E87579C11079F43DD824993C2CEE5ED3", "FFFFFFFE0000000075A30D1B9038A115", "1", "161FF7528B899B2D0C28607CA52C5B86", "CF5AC8395BAFEB13C02DA292DDED7A83", [], "", "secp128r1 : SECG curve over a 128 bit prime field");
KJUR.crypto.ECParameterDB.regist("secp160k1", 160, "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFAC73", "0", "7", "0100000000000000000001B8FA16DFAB9ACA16B6B3", "1", "3B4C382CE37AA192A4019E763036F4F5DD4D7EBB", "938CF935318FDCED6BC28286531733C3F03C4FEE", [], "", "secp160k1 : SECG curve over a 160 bit prime field");
KJUR.crypto.ECParameterDB.regist("secp160r1", 160, "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF7FFFFFFF", "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF7FFFFFFC", "1C97BEFC54BD7A8B65ACF89F81D4D4ADC565FA45", "0100000000000000000001F4C8F927AED3CA752257", "1", "4A96B5688EF573284664698968C38BB913CBFC82", "23A628553168947D59DCC912042351377AC5FB32", [], "", "secp160r1 : SECG curve over a 160 bit prime field");
KJUR.crypto.ECParameterDB.regist("secp192k1", 192, "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFEE37", "0", "3", "FFFFFFFFFFFFFFFFFFFFFFFE26F2FC170F69466A74DEFD8D", "1", "DB4FF10EC057E9AE26B07D0280B7F4341DA5D1B1EAE06C7D", "9B2F2F6D9C5628A7844163D015BE86344082AA88D95E2F9D", []);
KJUR.crypto.ECParameterDB.regist("secp192r1", 192, "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFF", "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFC", "64210519E59C80E70FA7E9AB72243049FEB8DEECC146B9B1", "FFFFFFFFFFFFFFFFFFFFFFFF99DEF836146BC9B1B4D22831", "1", "188DA80EB03090F67CBF20EB43A18800F4FF0AFD82FF1012", "07192B95FFC8DA78631011ED6B24CDD573F977A11E794811", []);
KJUR.crypto.ECParameterDB.regist("secp224r1", 224, "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000000000000000000001", "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFE", "B4050A850C04B3ABF54132565044B0B7D7BFD8BA270B39432355FFB4", "FFFFFFFFFFFFFFFFFFFFFFFFFFFF16A2E0B8F03E13DD29455C5C2A3D", "1", "B70E0CBD6BB4BF7F321390B94A03C1D356C21122343280D6115C1D21", "BD376388B5F723FB4C22DFE6CD4375A05A07476444D5819985007E34", []);
KJUR.crypto.ECParameterDB.regist("secp256k1", 256, "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F", "0", "7", "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141", "1", "79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798", "483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8", []);
KJUR.crypto.ECParameterDB.regist("secp256r1", 256, "FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFF", "FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFC", "5AC635D8AA3A93E7B3EBBD55769886BC651D06B0CC53B0F63BCE3C3E27D2604B", "FFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551", "1", "6B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C296", "4FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5", ["NIST P-256", "P-256", "prime256v1"]);
KJUR.crypto.ECParameterDB.regist("secp384r1", 384, "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFF0000000000000000FFFFFFFF", "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFF0000000000000000FFFFFFFC", "B3312FA7E23EE7E4988E056BE3F82D19181D9C6EFE8141120314088F5013875AC656398D8A2ED19D2A85C8EDD3EC2AEF", "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC7634D81F4372DDF581A0DB248B0A77AECEC196ACCC52973", "1", "AA87CA22BE8B05378EB1C71EF320AD746E1D3B628BA79B9859F741E082542A385502F25DBF55296C3A545E3872760AB7", "3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5f", ["NIST P-384", "P-384"]);
KJUR.crypto.ECParameterDB.regist("secp521r1", 521, "1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF", "1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC", "051953EB9618E1C9A1F929A21A0B68540EEA2DA725B99B315F3B8B489918EF109E156193951EC7E937B1652C0BD3BB1BF073573DF883D2C34F1EF451FD46B503F00", "1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFA51868783BF2F966B7FCC0148F709A5D03BB5C9B8899C47AEBB6FB71E91386409", "1", "C6858E06B70404E9CD9E3ECB662395B4429C648139053FB521F828AF606B4D3DBAA14B5E77EFE75928FE1DC127A2FFA8DE3348B3C1856A429BF97E7E31C2E5BD66", "011839296a789a3bc0045c8a5fb42c7d1bd998f54449579b446817afbd17273e662c97ee72995ef42640c550b9013fad0761353c7086a272c24088be94769fd16650", ["NIST P-521", "P-521"]);
var KEYUTIL = function() {
    var k = function(s, x, u, q) {
        var r = CryptoJS.enc.Hex.parse(x);
        var w = CryptoJS.enc.Hex.parse(u);
        var p = CryptoJS.enc.Hex.parse(q);
        var t = {};
        t.key = w;
        t.iv = p;
        t.ciphertext = r;
        var v = s.decrypt(t, w, {
            iv: p
        });
        return CryptoJS.enc.Hex.stringify(v)
    };
    var f = function(p, r, q) {
        return g(CryptoJS.DES, p, r, q)
    };
    var g = function(t, y, v, q) {
        var s = CryptoJS.enc.Hex.parse(y);
        var x = CryptoJS.enc.Hex.parse(v);
        var p = CryptoJS.enc.Hex.parse(q);
        var w = t.encrypt(s, x, {
            iv: p
        });
        var r = CryptoJS.enc.Hex.parse(w.toString());
        var u = CryptoJS.enc.Base64.stringify(r);
        return u
    };
    var m = function(p) {
        var r = CryptoJS.lib.WordArray.random(p);
        var q = CryptoJS.enc.Hex.stringify(r);
        return q
    };
    var n = function(v) {
        var w = {};
        var q = v.match(new RegExp("DEK-Info: ([^,]+),([0-9A-Fa-f]+)", "m"));
        if (q) {
            w.cipher = q[1];
            w.ivsalt = q[2]
        }
        var p = v.match(new RegExp("-----BEGIN ([A-Z]+) PRIVATE KEY-----"));
        if (p) {
            w.type = p[1]
        }
        var u = -1;
        var x = 0;
        if (v.indexOf("\r\n\r\n") != -1) {
            u = v.indexOf("\r\n\r\n");
            x = 2
        }
        if (v.indexOf("\n\n") != -1) {
            u = v.indexOf("\n\n");
            x = 1
        }
        var t = v.indexOf("-----END");
        if (u != -1 && t != -1) {
            var r = v.substring(u + x * 2, t - x);
            r = r.replace(/\s+/g, "");
            w.data = r
        }
        return w
    };
    return {
        version: "1.0.0",
        getKeyFromPublicPKCS8PEM: function(q) {
            var r = ASN1HEX.pemToHex(q, "PUBLIC KEY");
            var p = this.getKeyFromPublicPKCS8Hex(r);
            return p
        },
        getKeyFromPublicPKCS8Hex: function(q) {
            var p;
            var r = ASN1HEX.getVbyList(q, 0, [0, 0], "06");
            if (r === "2a864886f70d010101") {
                p = new RSAKey()
            } else {
                if (r === "2a8648ce380401") {
                    p = new KJUR.crypto.DSA()
                } else {
                    if (r === "2a8648ce3d0201") {
                        p = new KJUR.crypto.ECDSA()
                    } else {
                        throw "unsupported PKCS#8 public key hex"
                    }
                }
            }
            p.readPKCS8PubKeyHex(q);
            return p
        }
    }
} ();
KEYUTIL.getKey = function(i) {
    if (i.indexOf("-END PUBLIC KEY-") != -1) {
        return KEYUTIL.getKeyFromPublicPKCS8PEM(i)
    }
    if (i.indexOf("-END RSA PRIVATE KEY-") != -1 && i.indexOf("4,ENCRYPTED") == -1) {
        var k = ASN1HEX.pemToHex(i, "RSA PRIVATE KEY");
        return KEYUTIL.getKey(k, null, "pkcs5prv")
    }
};
RSAKey.prototype.readPKCS5PubKeyHex = function(b) {
    var a = ASN1HEX.getPosArrayOfChildren_AtObj(b, 0);
    var d = ASN1HEX.getHexOfV_AtObj(b, a[0]);
    var c = ASN1HEX.getHexOfV_AtObj(b, a[1]);
    this.setPublic(d, c)
};
RSAKey.prototype.readPKCS8PubKeyHex = function(b) {
    var a = ASN1HEX.getDecendantHexTLVByNthList(b, 0, [1, 0]);
    this.readPKCS5PubKeyHex(a)
};
var _RE_HEXDECONLY = new RegExp("");
_RE_HEXDECONLY.compile("[^0-9a-f]", "gi");
RSAKey.SALT_LEN_HLEN = -1;
RSAKey.SALT_LEN_MAX = -2;
RSAKey.SALT_LEN_RECOVER = -2;
module.exports = {
    RSAKey: RSAKey,
    KEYUTIL: KEYUTIL,
    hex2b64: hex2b64,
    b64tohex: b64tohex
};