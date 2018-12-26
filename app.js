//app.js
const RSA = require('lib/rsa.js');
const Util = require('utils/util.js');
const QQMapWX = require('./lib/qqmap-wx-jssdk.min.js');
const sha1CryptoJS = require('./lib/sha1.js');

App({
  onLaunch() {

    let _this = this;
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: function (res) {
              // 可以将 res 发送给后台解码出 unionId
              wx.setStorageSync('userInfo', res.userInfo);
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (_this.userInfoReadyCallback) {
                _this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    });
    wx.request({
      url: `https://api.duishangbao.cn/city.js`,
      success: function (res) {
        _this.data.city = res.data;
      }
    })
  },
  userInfoReadyCallback: function (res) {
    console.info(res);
  },
  onShow: function () {
    if (!this.data.qqmapsdk) {
      this.data.qqmapsdk = new QQMapWX({
        key: this.globalData.qqsdk_key
      })
    }
  },
  globalData: {
    vision: '3.0.0',
    host: 'http://39.108.96.150:5020/', // api接口域名前缀
    hostCenter: 'http://39.108.96.150:5020/',
    hostLogin: 'http://39.108.96.150:8088/',
    // host: 'http://192.168.100.231:5020/', // api接口域名前缀
    imgUrl: 'http://bhs-java-test.oss-cn-beijing.aliyuncs.com/', // 图片阿里云前缀
    // imgUrl: 'https://img.duishangbao.cn/', // 图片阿里云前缀
    width: wx.getSystemInfoSync().windowWidth, // 设备宽度
    qqsdk_key: 'HZFBZ-QLUCF-BYVJZ-N5Y6J-ELEZO-4CFPQ', // 腾讯sdk

    balance: 0, // 余额
    gold: 0,    // 金贝
    silver: 0,  // 银贝
    copper: 0,  // 铜贝

    code: null,
    aesKey: null,
    encryptKey: null,
    encryptData: null,

    isLogin: null,
    userInfo: null,
    hasUserInfo: null,
    publicKey: `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCIDan2Y6LFs0Sq5Tv9ZDvIbpZ8
PE82ian+7Dv5T0fnYftd1csfMzt3ytemb7NCj7/F2NXmAj7jw1OPV/UEFo7ZcLAv
347CuyyhBGWrowJqfQmhKYc/Or+3dA5yZGFTjLMXjhriqgy/TVyvOb+bMUoM/WNO
RTsYOVZjZ+MqaGWlRwIDAQAB
-----END PUBLIC KEY-----`,
    privateKey: `-----BEGIN PRIVATE KEY-----
MIICdQIBADANBgkqhkiG9w0BAQEFAASCAl8wggJbAgEAAoGBAIgNqfZjosWzRKrl
O/1kO8hulnw8TzaJqf7sO/lPR+dh+13Vyx8zO3fK16Zvs0KPv8XY1eYCPuPDU49X
9QQWjtlwsC/fjsK7LKEEZaujAmp9CaEphz86v7d0DnJkYVOMsxeOGuKqDL9NXK85
v5sxSgz9Y05FOxg5VmNn4ypoZaVHAgMBAAECgYANv8vAUZtefVpgJuBkICAGhl6A
2ZtruIfMclUxQbjTgkxj1Do9wfCtj3sxn7Iu9NX9iYc8QlfWrqOgJdRmAF2ZJ++F
ufkH+0lTRCg72F8t8d70tG1OsN+XK5KBp6KqZNp4WeGSD4GjqgdCleYUVQmmEcRw
AXZyLFWWryO4ejJW6QJBAMyuOIThIx2KdblIJi1TbPPXHZMktL9W6khp3j7g61s5
zJWjnPv1W6zZwWudy+MKJREyG74RGvM6X8mKAMKefmMCQQCqKnzhveXzx5BkOHZm
dAgzxxMXhlRIh+pi0D99lG2fkDTPCGDjj3B5AsUY5nfeHhSNDA95MVj3uuDDjj+R
LtDNAkAC+4rxTMKRPKJIh+eeg3ez+e+BZGiJ3T9evMQzUF29n5L+nzq7ZTDnzOiH
o+4DqfMuU/eZhnBJGRGqQyuNqneXAkBRxMDlqN7K2eakgg1DBha66rpd34q4n7cd
bHxV1/Elb6IwqhIEx3SAcbhMUtLexQ2TCWyWDAR4ZjCDR+N73EcxAkAD8UbwMKXs
I+1VPMVAUA7yGlqyr/gjGFhSaXWWErDZHWN/srHWEHdpxLyQwiMBOxG+32KjB86C
7o6CJhfEBkdN
-----END PRIVATE KEY-----`,
    orderId: ''
  },
  /**
   * 公共异步 一级接口 to 微信授权登录
   * @param type 类型： post,get,put,delete
   * @param url 接口地址
   * @param data 参数
   * @param res 成功
   * @param reg 失败
   */
  myAjaxLogin (type, url, data, res, reg) {
    let message = 'timespan=' + Date.parse(new Date()) + '&nonce=' + this.getAesKey(8) + '&xClientId=' + this.getAesKey(8) + '&app=1000';
    let key = '1000' + this.getAesKey(16);
    let sign = this.getSign(message, key);
    wx.request({
      url: this.globalData.hostLogin + url,
      data: data,
      header: {
        'content-type': 'application/json',
        'B-User-Agent': '1000/1.0;android/6.2;mi/YA77;cn;10003',
        'X-Client-Id': '8888',
        'B-Replay': 'nonce=' + this.getAesKey(8) + '&timespan=' + Date.parse(new Date()) + '&sig=' + sign,
        'sig': this.getAesKey(8) + Date.parse(new Date()) + 'AAAAA'
      },
      method: type,
      success(data) {
        console.info(data);
        res && res(data.data)
      },
      fail(data) {
        reg && reg(data.data)
      }
    })

  },
  /**
   * 公共异步 一级接口 (不需登录)
   * @param type 类型： post,get,put,delete
   * @param url 接口地址
   * @param data 参数
   * @param res 成功
   * @param reg 失败
   */
  myAjax (type, url, data, res, reg) {

    let message = 'timespan=' + Date.parse(new Date()) + '&nonce=' + this.getAesKey(8) + '&xClientId=' + this.getAesKey(8) + '&app=1000';
    let key = '1000' + this.getAesKey(16);
    let sign = this.getSign(message, key);
    wx.request({
      url: this.globalData.host + url,
      data: data,
      header: {
        'content-type': 'application/json',
        'B-User-Agent': '1000/1.0;android/6.2;mi/YA77;cn;10003',
        'X-Client-Id': '8888',
        'B-Replay': 'nonce=' + this.getAesKey(8) + '&timespan=' + Date.parse(new Date()) + '&sig=' + sign,
        'sig': this.getAesKey(8) + Date.parse(new Date()) + 'AAAAA'
      },
      method: type,
      success(data) {
        res && res(data.data)
      },
      fail(data) {
        reg && reg(data.data)
      }
    })

  },
  /**
   * 公共异步 二级接口 (必须登录)
   * @param type 类型： post,get,put,delete
   * @param url 接口地址
   * @param data 参数
   * @param res 成功
   * @param reg 失败
   */
  myAjax2 (type, url, data, res, reg) {
    let nonce = this.getAesKey(8);
    let sid = wx.getStorageSync('sid');
    let uid = wx.getStorageSync('uid');
    let message = 'app=1000&sid=' + sid + '&nonce=' + nonce + '&timespan=' + Date.parse(new Date()) + '&device=16&uid=' + uid;
    let sign = this.getSign(message, wx.getStorageSync('session-login'));

    wx.request({
      url: this.globalData.host + url,
      data: data,
      header: {
        'content-type': 'application/json',
        'B-User-Agent': '1000/1.0;android/6.2;mi/YA77;cn;10003',
        'X-Client-Id': '8888',
        'B-Replay': 'nonce=' + nonce + '&timespan=' + Date.parse(new Date()) + '&sig=' + sign,
        'B-Author': 'app=1000&sid=' + sid + '&nonce=' + nonce + '&timespan=' + Date.parse(new Date()) + '&device=16&uid=' + uid + '&sig=' + sign,
        'sig': sign
      },
      method: type,
      success(data) {
        res && res(data.data)
      },
      fail(data) {
        reg && reg(data.data)
      }
    })
  },

  /**
   * 登录
   * @param that
   */
  toLogin(that) {
    let _this = this;
    wx.login({
      success: function (res) {
        if (res.code) {
          wx.getUserInfo({
            success: function (reg) {
              console.info(reg);
              _this.getEncryptKey();
              _this.getEncryptData(res.code, reg.encryptedData, reg.iv, JSON.stringify(reg.userInfo));
              _this.myAjaxLogin('post', 'ucenter/wx/appLogin', {
                'encryptKey': _this.globalData.encryptKey,
                'encryptData': _this.globalData.encryptData
              }, (res) => {
                let {session, sid, uid, openId, unionId} = res.data;
                wx.setStorageSync('session', session);
                wx.setStorageSync('sid', sid);
                wx.setStorageSync('uid', uid);
                wx.setStorageSync('openId', openId);
                wx.setStorageSync('unionId', unionId);
                let s = _this.deAesData(session)
                wx.setStorageSync('session-login', s)
                _this.globalData.isLogin = 1;
                that.setData({
                  loginbox: 0
                });
                _this.goToLogin();
                that.userInfoReadyCallback(res)
              })
            }
          })
        }
      }
    });
  },
  /**
   * 跳转地址
   * @param url
   * @param close 跳转方式
   *  _self 关闭当前页面，跳转到应用内的某个页面
   *  _tab 跳转到tabBar页面，并关闭其他所有非tabBar页面
   *  其他 保留当前页面，跳转到应用内的某个页面
   * @returns {*}
   */
  openPage: function (url, close) {
    if (!url) return;
    if (close == '_tab') {
      wx.switchTab({
        url: '/pages/' + url
      })
    } else if (close == '_self') {
      wx.redirectTo({
        url: '/pages/' + url
      })
    } else {
      wx.navigateTo({
        url: '/pages/' + url
      })
    }
  },
  /**
   * 新版跳转页面设置
   * @jump_type 1.不跳转  2.h5  3.商品  4.区域  5.pgc页面  6.商品分类  7.运营位模板
   *
   * 10001首页、10002附近、10003A模板、10004B模板、10005C模板、10006D模板、10007E模板、10008F模板
   */
  openPageTo: function (jump_data, jump_type) {
    var app = getApp();

    if (jump_type == 2) {
      wx.navigateTo({url: '/pages/web-view/web-view?url=' + decodeURIComponent(jump_data)});
    } else if (jump_type == 3) {
      app.openPage('goods/goodsdetail/goodsdetail?gid=' + jump_data);
    } else if (jump_type == 4) {
      app.openPage(jump_data);
    } else if (jump_type == 5) {
      wx.setStorageSync('pgcTemplateId', jump_data);
      wx.navigateTo({url: '/pages/web-view/web-view?url=' + decodeURIComponent('https://www.bei-huasuan.cn/template-web/html/template.html?id=' + jump_data)});
    } else if (jump_type == 6) {
      app.openPage('goods/classify/classify?cid=' + jump_data + '&type=0');
    } else if (jump_type == 7) {
      let operation_pages_id = jump_data.split('_')[0];
      let operation_pages_type = jump_data.split('_')[1];

      let temp = ['templateOne', 'templateTwo', 'templateThree', 'templateFour', 'templateFive', 'templateSix'];
      let type = [10003, 10004, 10005, 10006, 10007, 10008];
      for (var i = 0; i < type.length; i++) {
        if (operation_pages_type == type[i]) {
          var text = temp[i];
          app.openPage('newIndex/' + text + '/' + text + '?id=' + operation_pages_id);
          break;
        }
      }
    } else if (jump_type == 8) {
      app.openPage('index/classify/classify?goods_category_id=' + jump_data);
    }
  },
  /**
   * 生成密钥
   * @param len
   * @returns {string}
   */
  getAesKey(len) {
    len = len || 32;
    let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    let maxPos = $chars.length;
    let keyStr = '';
    for (var i = 0; i < len; i++) {
      keyStr += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return keyStr;
  },
  /**
   * 格式化时间
   * @param date
   * @returns {string}
   */
  formatTime(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  },
  /**
   * toast提示弹窗
   * @param that
   * @param text 提示文案
   * @param time 弹窗展示时间 秒
   */
  showToast(that, text, time){
    let _this = that;
    _this.setData({
      toast: 1,
      toastTxt: text
    });
    setTimeout(function () {
      _this.setData({
        toast: 0,
        toastTxt: ''
      });
    }, !time ? 3000 : time * 1000)
  },
  /**
   * 生成密钥
   */
  getEncryptKey: function () {
    let aesKey = this.getAesKey(16);
    let encrypt_rsa = new RSA.RSAKey();
    encrypt_rsa = RSA.KEYUTIL.getKey(this.globalData.publicKey);
    let encryptKey = encrypt_rsa.encrypt(aesKey);
    this.globalData.aesKey = aesKey;
    this.globalData.encryptKey = RSA.hex2b64(encryptKey);
  },
  /**
   * 加密数据
   * @param jsCode
   */
  getEncryptData: function (jsCode, encryptedData, iv, userInfo) {
    let obj = 'jsCode=' + jsCode + '&encryptedData=' + encryptedData + '&iv=' + iv + '&content=' + userInfo + '&app=1000&device=32&nonce=' + this.getAesKey(8) + '&timespan=' + Date.parse(new Date());
    console.log(obj);
    this.globalData.encryptData = Util.Encrypt(obj, this.globalData.aesKey);
  },
  /**
   * 生成签名
   * @returns {*}
   */
  getSign (message, key) {
    return sha1CryptoJS.enc.Hex.stringify(sha1CryptoJS.HmacSHA1(message, key))
  },
  /**
   * AES加密数据
   * @param word
   * @param key
   * @returns {*}
   */
  aesData (word, key) {
    return Util.Encrypt(word, key)
  },
  /**
   * AES解密数据
   * @param word
   * @returns {*}
   */
  deAesData (word) {
    return Util.Decrypt(word, this.globalData.aesKey)
  },
  /**
   * 本地存储   {key:value}
   */
  setStorageSync: function (json) {
    for (let key in json) {
      wx.setStorageSync(key, json[key]);
    }
  },
  /**
   * 清空本地存储数据 不包括 session
   */
  clearStorageSync: function () {
    let {keys} = wx.getStorageInfoSync();
    let notClear = ['session', 'session-login', 'sid', 'uid', 'unionId', 'openId', 'searchWord', 'userInfo'];
    for (let s of keys) {
      if (notClear.indexOf(s) > -1) continue;
      wx.removeStorageSync(s);
    }
  },
  getlocation(fn) {
    wx.getLocation({
      type: 'wgs84',
      altitude: true,
      success: function (res) {
        fn && fn(res);
      }
    })
  },
  /**
   * 获取中文地址(解析过后的)
   * @param fn
   */
  getaddress(fn) {
    let {qqmapsdk} = this.data;
    qqmapsdk.reverseGeocoder({
      success: (res) => {
        fn && fn(res.result);
      }
    })
  },
  /**
   * 计算两点之前距离
   * @param arr
   * @param res
   * @returns {*}
   */
  addressLimit(arr, res) {
    if (!arr || !res) return 0;
    let [lo1, la1] = arr;
    let la2 = res.latitude;
    let lo2 = res.longitude;
    var La1 = la1 * Math.PI / 180.0;
    var La2 = la2 * Math.PI / 180.0;
    var La3 = La1 - La2;
    var Lb3 = lo1 * Math.PI / 180.0 - lo2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
    s = s * 6378.137;//地球半径
    s = Math.round(s * 10000) / 10000;
    return s.toFixed(2);
  },
  /**
   * code编码
   * @param text
   */
  enCode (text) {
    return escape(encodeURIComponent(text))
  },
  /**
   * code解码
   * @param text
   * @returns {string}
   */
  unCode (text) {
    return decodeURIComponent(unescape(text))
  },
  /**
   * 新增搜索词条的缓存处理
   * @param word
   */
  addSearchWord (word) {
    let arr = [];
    if(wx.getStorageSync('searchWord') != '') {
      arr = JSON.parse(wx.getStorageSync('searchWord'));
    }
    if (arr != "" && arr.indexOf(word) != -1) {
      let index = arr.indexOf(word);
      arr.splice(index, 1);
    }
    arr.unshift(word);
    if (arr.length > 10) {
      arr.length = 10
    }
    wx.setStorageSync('searchWord', JSON.stringify(arr))
  },
  /**
   * 微信授权回来后触发后台登录验证
   */
  goToLogin () {
    let sid = wx.getStorageSync('sid');
    let uid = wx.getStorageSync('uid');
    let message = 'app=1000&sid=' + sid + '&nonce=' + this.getAesKey(8) + '&timespan=' + Date.parse(new Date()) + '&device=16&uid=' + uid;
    let sign = this.getSign(message, wx.getStorageSync('session-login'));
    let obj = {
      app: 1000,
      appProject: 10003,
      clientId: this.getAesKey(4),
      device: 16,
      nonce: this.getAesKey(8),
      sid,
      uid,
      sig: sign,
      timespan: new Date().getTime()
    };
    let _this = this;
    this.myAjax('post', 'bhs-client-online/login', obj, function (res) {
      if (res.data.code * 1 === 1) {
        _this.showToast('登录成功');
        _this.setData({
          loginbox: 0,
          loading: 0
        });
        setTimeout(function () {
          _this.goPage()
        }, 3000)
      } else {
        // console.log('成功')
      }
    }, function (reg) {
      // console.log('失败')
    })
  },
  /**
   * 获取用户余额，金贝数
   */
  getUserCapital: function (that, fn) {
    this.myAjax2('get', 'bhs-client-online/userCapital/detail', '{}', (res) => {
      if (res.code == 1) {
        that.setData({
          gold: res.data.gold
        });
        fn && fn()
      }
    })
  },
  data: {
    nearbyBannerList: [
      {
        "title": "",
        "title_sub": "",
        "img": "https://img.duishangbao.cn/upload/operation/content/img/1/7a587ff5671dc9f2f62b37221832c8bc.jpeg",
        "jump_type": 2,
        "jump_data": "https://www.bei-huasuan.cn/activity-web/html/activity-page14.html"
      },
      {
        "title": "",
        "title_sub": "",
        "img": "https://img.duishangbao.cn/upload/operation/content/img/1/b019ab88476ea18b0bbd5c6d9dd33d00.jpeg",
        "jump_type": 2,
        "jump_data": "https://www.bei-huasuan.cn/activity-web/html/activity-page20.html"
      },
      {
        "title": "",
        "title_sub": "",
        "img": "https://img.duishangbao.cn/upload/operation/content/img/1/9575f4a9701d53f2905975fd4ccd31a5.jpeg",
        "jump_type": 2,
        "jump_data": "https://www.bei-huasuan.cn/activity-web/html/activity-page15.html"
      }
    ],
    nearbyNavList: [
      {
        "title": "丽人",
        "title_sub": "",
        "img": "https://img.duishangbao.cn/upload/operation/content/img/1/fadf1eff1ee7af1b4c1b91675ec652f1.png",
        "jump_type": 8,
        "jump_data": "14"
      },
      {
        "title": "美食",
        "title_sub": "",
        "img": "https://img.duishangbao.cn/upload/operation/content/img/1/6f5ff31d0cab5f0a887d1d92727acdfd.png",
        "jump_type": 8,
        "jump_data": "1"
      },
      {
        "title": "娱乐",
        "title_sub": "",
        "img": "https://img.duishangbao.cn/upload/operation/content/img/1/ec530d90ab94c5e04da5279bd7731b30.png",
        "jump_type": 8,
        "jump_data": "13"
      },
      {
        "title": "健身",
        "title_sub": "",
        "img": "https://img.duishangbao.cn/upload/operation/content/img/1/002e6e2bf74587ea3f617324d205be7d.png",
        "jump_type": 8,
        "jump_data": "20"
      },
      {
        "title": "更多",
        "title_sub": "",
        "img": "https://img.duishangbao.cn/upload/operation/content/img/1/876fb746e94be9a0a1cc79d4cb6012ca.png",
        "jump_type": 8,
        "jump_data": "12"
      }
    ],
    businessNavList: [
      {
        "business_category_id": 1,
        "isSelect": 0,
        "name": "美食",
        "parent_id": 0,
        "sort": 1,
        "status": 1,
        "create_at": 1529907918,
        "settop_at": null,
        "child": [
          {
            "business_category_id": 3,
            "isSelect": 1,
            "name": "火锅",
            "parent_id": 1,
            "sort": 1,
            "status": 1,
            "create_at": 1529907952,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 4,
            "isSelect": 0,
            "name": "串串",
            "parent_id": 1,
            "sort": 2,
            "status": 1,
            "create_at": 1529907963,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 108,
            "isSelect": 0,
            "name": "川菜",
            "parent_id": 1,
            "sort": 3,
            "status": 1,
            "create_at": 1533548678,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 109,
            "isSelect": 0,
            "name": "小吃快餐",
            "parent_id": 1,
            "sort": 4,
            "status": 1,
            "create_at": 1533550060,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 121,
            "isSelect": 0,
            "name": "日料",
            "parent_id": 1,
            "sort": 5,
            "status": 1,
            "create_at": 1536117850,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 117,
            "isSelect": 0,
            "name": "面包甜点",
            "parent_id": 1,
            "sort": 6,
            "status": 1,
            "create_at": 1536116144,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 95,
            "isSelect": 0,
            "name": "烧烤",
            "parent_id": 1,
            "sort": 7,
            "status": 1,
            "create_at": 1533105616,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 110,
            "isSelect": 0,
            "name": "烤鱼",
            "parent_id": 1,
            "sort": 8,
            "status": 1,
            "create_at": 1533634396,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 118,
            "isSelect": 0,
            "name": "小龙虾",
            "parent_id": 1,
            "sort": 9,
            "status": 1,
            "create_at": 1536116887,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 107,
            "isSelect": 0,
            "name": "西餐",
            "parent_id": 1,
            "sort": 9,
            "status": 1,
            "create_at": 1533545912,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 106,
            "isSelect": 0,
            "name": "海鲜",
            "parent_id": 1,
            "sort": 10,
            "status": 1,
            "create_at": 1533544840,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 143,
            "isSelect": 0,
            "name": "干锅",
            "parent_id": 1,
            "sort": 11,
            "status": 1,
            "create_at": 1540868010,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 2,
            "isSelect": 0,
            "name": "中餐",
            "parent_id": 1,
            "sort": 11,
            "status": 1,
            "create_at": 1529907937,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 114,
            "isSelect": 0,
            "name": "韩国料理",
            "parent_id": 1,
            "sort": 12,
            "status": 1,
            "create_at": 1535963611,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 122,
            "isSelect": 0,
            "name": "自助餐",
            "parent_id": 1,
            "sort": 25,
            "status": 1,
            "create_at": 1536127766,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 145,
            "isSelect": 0,
            "name": "其他美食",
            "parent_id": 1,
            "sort": 99,
            "status": 1,
            "create_at": 1540870088,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 144,
            "isSelect": 0,
            "name": "汤锅",
            "parent_id": 1,
            "sort": 99,
            "status": 1,
            "create_at": 1540868239,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 131,
            "isSelect": 0,
            "name": "北京菜",
            "parent_id": 1,
            "sort": 99,
            "status": 1,
            "create_at": 1538985023,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 130,
            "isSelect": 0,
            "name": "地方特色菜",
            "parent_id": 1,
            "sort": 99,
            "status": 1,
            "create_at": 1538984951,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 129,
            "isSelect": 0,
            "name": "东北菜",
            "parent_id": 1,
            "sort": 99,
            "status": 1,
            "create_at": 1538125352,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 128,
            "isSelect": 0,
            "name": "新疆菜",
            "parent_id": 1,
            "sort": 99,
            "status": 1,
            "create_at": 1537340562,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 124,
            "isSelect": 0,
            "name": "私房菜",
            "parent_id": 1,
            "sort": 99,
            "status": 1,
            "create_at": 1536199320,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 123,
            "isSelect": 0,
            "name": "素菜",
            "parent_id": 1,
            "sort": 99,
            "status": 1,
            "create_at": 1536199303,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 120,
            "isSelect": 0,
            "name": "咖啡厅",
            "parent_id": 1,
            "sort": 99,
            "status": 1,
            "create_at": 1536117453,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 116,
            "isSelect": 0,
            "name": "粤菜",
            "parent_id": 1,
            "sort": 99,
            "status": 1,
            "create_at": 1536028363,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 98,
            "isSelect": 0,
            "name": "东南亚菜",
            "parent_id": 1,
            "sort": 99,
            "status": 1,
            "create_at": 1533118633,
            "settop_at": null,
            "child": []
          }
        ]
      },
      {
        "business_category_id": 14,
        "isSelect": 0,
        "name": "丽人",
        "parent_id": 0,
        "sort": 2,
        "status": 1,
        "create_at": 1531905781,
        "settop_at": null,
        "child": [
          {
            "business_category_id": 15,
            "isSelect": 1,
            "name": "美发",
            "parent_id": 14,
            "sort": 1,
            "status": 1,
            "create_at": 1531905793,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 24,
            "isSelect": 0,
            "name": "美容/SPA",
            "parent_id": 14,
            "sort": 2,
            "status": 1,
            "create_at": 1532309830,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 18,
            "isSelect": 0,
            "name": "美甲美睫",
            "parent_id": 14,
            "sort": 3,
            "status": 1,
            "create_at": 1531990678,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 30,
            "isSelect": 0,
            "name": "祛痘",
            "parent_id": 14,
            "sort": 4,
            "status": 1,
            "create_at": 1532309885,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 27,
            "isSelect": 0,
            "name": "舞蹈",
            "parent_id": 14,
            "sort": 5,
            "status": 1,
            "create_at": 1532309854,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 125,
            "isSelect": 0,
            "name": "韩式半永久",
            "parent_id": 14,
            "sort": 99,
            "status": 1,
            "create_at": 1536222069,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 100,
            "isSelect": 0,
            "name": "产后恢复",
            "parent_id": 14,
            "sort": 99,
            "status": 1,
            "create_at": 1533260213,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 57,
            "isSelect": 0,
            "name": "纹身",
            "parent_id": 14,
            "sort": 99,
            "status": 1,
            "create_at": 1532333906,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 31,
            "isSelect": 0,
            "name": "美妆",
            "parent_id": 14,
            "sort": 99,
            "status": 1,
            "create_at": 1532309898,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 29,
            "isSelect": 0,
            "name": "瑜伽",
            "parent_id": 14,
            "sort": 99,
            "status": 1,
            "create_at": 1532309875,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 28,
            "isSelect": 0,
            "name": "瘦身纤体",
            "parent_id": 14,
            "sort": 99,
            "status": 1,
            "create_at": 1532309862,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 26,
            "isSelect": 0,
            "name": "医学美容",
            "parent_id": 14,
            "sort": 99,
            "status": 1,
            "create_at": 1532309847,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 25,
            "isSelect": 0,
            "name": "礼仪培训",
            "parent_id": 14,
            "sort": 99,
            "status": 1,
            "create_at": 1532309839,
            "settop_at": null,
            "child": []
          }
        ]
      },
      {
        "business_category_id": 13,
        "isSelect": 0,
        "name": "休闲娱乐",
        "parent_id": 0,
        "sort": 3,
        "status": 1,
        "create_at": 1531898304,
        "settop_at": null,
        "child": [
          {
            "business_category_id": 68,
            "isSelect": 1,
            "name": "足浴按摩",
            "parent_id": 13,
            "sort": 1,
            "status": 1,
            "create_at": 1532414070,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 105,
            "isSelect": 0,
            "name": "击剑馆",
            "parent_id": 13,
            "sort": 2,
            "status": 1,
            "create_at": 1533544277,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 82,
            "isSelect": 0,
            "name": "酒吧",
            "parent_id": 13,
            "sort": 3,
            "status": 1,
            "create_at": 1532509412,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 75,
            "isSelect": 0,
            "name": "私人影吧",
            "parent_id": 13,
            "sort": 4,
            "status": 1,
            "create_at": 1532502195,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 142,
            "isSelect": 0,
            "name": "轰趴馆",
            "parent_id": 13,
            "sort": 5,
            "status": 1,
            "create_at": 1540447417,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 64,
            "isSelect": 0,
            "name": "桌游",
            "parent_id": 13,
            "sort": 6,
            "status": 1,
            "create_at": 1532402900,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 60,
            "isSelect": 0,
            "name": "密室逃脱",
            "parent_id": 13,
            "sort": 7,
            "status": 1,
            "create_at": 1532337391,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 127,
            "isSelect": 0,
            "name": "茶馆",
            "parent_id": 13,
            "sort": 11,
            "status": 1,
            "create_at": 1537241415,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 101,
            "isSelect": 0,
            "name": "棋牌室",
            "parent_id": 13,
            "sort": 44,
            "status": 1,
            "create_at": 1533261237,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 119,
            "isSelect": 0,
            "name": "KTV",
            "parent_id": 13,
            "sort": 99,
            "status": 1,
            "create_at": 1536117302,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 62,
            "isSelect": 0,
            "name": "咖啡厅",
            "parent_id": 13,
            "sort": 99,
            "status": 1,
            "create_at": 1532339770,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 52,
            "isSelect": 0,
            "name": "娱乐",
            "parent_id": 13,
            "sort": 99,
            "status": 1,
            "create_at": 1532326444,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 50,
            "isSelect": 0,
            "name": "足疗洗浴",
            "parent_id": 13,
            "sort": 99,
            "status": 1,
            "create_at": 1532325705,
            "settop_at": null,
            "child": []
          }
        ]
      },
      {
        "business_category_id": 20,
        "isSelect": 0,
        "name": "运动健身",
        "parent_id": 0,
        "sort": 4,
        "status": 1,
        "create_at": 1532309621,
        "settop_at": null,
        "child": [
          {
            "business_category_id": 61,
            "isSelect": 1,
            "name": "健身中心",
            "parent_id": 20,
            "sort": 1,
            "status": 1,
            "create_at": 1532338633,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 76,
            "isSelect": 0,
            "name": "武术场馆",
            "parent_id": 20,
            "sort": 2,
            "status": 1,
            "create_at": 1532502267,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 47,
            "isSelect": 0,
            "name": "射箭馆",
            "parent_id": 20,
            "sort": 3,
            "status": 1,
            "create_at": 1532316777,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 55,
            "isSelect": 0,
            "name": "游泳馆",
            "parent_id": 20,
            "sort": 99,
            "status": 1,
            "create_at": 1532328512,
            "settop_at": null,
            "child": []
          }
        ]
      },
      {
        "business_category_id": 19,
        "isSelect": 0,
        "name": "学习培训",
        "parent_id": 0,
        "sort": 5,
        "status": 1,
        "create_at": 1532309605,
        "settop_at": null,
        "child": [
          {
            "business_category_id": 48,
            "isSelect": 1,
            "name": "外语培训",
            "parent_id": 19,
            "sort": 1,
            "status": 1,
            "create_at": 1532325010,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 80,
            "isSelect": 0,
            "name": "美术培训",
            "parent_id": 19,
            "sort": 2,
            "status": 1,
            "create_at": 1532508347,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 22,
            "isSelect": 0,
            "name": "音乐培训",
            "parent_id": 19,
            "sort": 3,
            "status": 1,
            "create_at": 1532309698,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 71,
            "isSelect": 0,
            "name": "其他培训",
            "parent_id": 19,
            "sort": 4,
            "status": 1,
            "create_at": 1532501281,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 90,
            "isSelect": 0,
            "name": "升学辅导",
            "parent_id": 19,
            "sort": 99,
            "status": 1,
            "create_at": 1532510992,
            "settop_at": null,
            "child": []
          }
        ]
      },
      {
        "business_category_id": 16,
        "isSelect": 0,
        "name": "生活服务",
        "parent_id": 0,
        "sort": 6,
        "status": 1,
        "create_at": 1531980587,
        "settop_at": null,
        "child": [
          {
            "business_category_id": 53,
            "isSelect": 1,
            "name": "洗涤护理",
            "parent_id": 16,
            "sort": 1,
            "status": 1,
            "create_at": 1532326749,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 72,
            "isSelect": 0,
            "name": "家政服务",
            "parent_id": 16,
            "sort": 2,
            "status": 1,
            "create_at": 1532501363,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 17,
            "isSelect": 0,
            "name": "快照摄影",
            "parent_id": 16,
            "sort": 3,
            "status": 1,
            "create_at": 1531980620,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 51,
            "isSelect": 0,
            "name": "鲜花店",
            "parent_id": 16,
            "sort": 4,
            "status": 1,
            "create_at": 1532326154,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 89,
            "isSelect": 0,
            "name": "租房",
            "parent_id": 16,
            "sort": 8,
            "status": 1,
            "create_at": 1532510579,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 85,
            "isSelect": 0,
            "name": "票务",
            "parent_id": 16,
            "sort": 11,
            "status": 1,
            "create_at": 1532510150,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 83,
            "isSelect": 0,
            "name": "商务会所",
            "parent_id": 16,
            "sort": 11,
            "status": 1,
            "create_at": 1532509721,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 81,
            "isSelect": 0,
            "name": "电子维修",
            "parent_id": 16,
            "sort": 11,
            "status": 1,
            "create_at": 1532509361,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 88,
            "isSelect": 0,
            "name": "文案策划",
            "parent_id": 16,
            "sort": 66,
            "status": 1,
            "create_at": 1532510469,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 94,
            "isSelect": 0,
            "name": "其他服务",
            "parent_id": 16,
            "sort": 99,
            "status": 1,
            "create_at": 1533024172,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 92,
            "isSelect": 0,
            "name": "手工DIY",
            "parent_id": 16,
            "sort": 99,
            "status": 1,
            "create_at": 1533007271,
            "settop_at": null,
            "child": []
          }
        ]
      },
      {
        "business_category_id": 23,
        "isSelect": 0,
        "name": "亲子",
        "parent_id": 0,
        "sort": 7,
        "status": 1,
        "create_at": 1532309737,
        "settop_at": null,
        "child": [
          {
            "business_category_id": 91,
            "isSelect": 1,
            "name": "幼儿教育",
            "parent_id": 23,
            "sort": 1,
            "status": 1,
            "create_at": 1532511290,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 46,
            "isSelect": 0,
            "name": "早教中心",
            "parent_id": 23,
            "sort": 2,
            "status": 1,
            "create_at": 1532316552,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 49,
            "isSelect": 0,
            "name": "亲子游乐",
            "parent_id": 23,
            "sort": 3,
            "status": 1,
            "create_at": 1532325086,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 113,
            "isSelect": 0,
            "name": "婴儿护理",
            "parent_id": 23,
            "sort": 4,
            "status": 1,
            "create_at": 1534907443,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 102,
            "isSelect": 0,
            "name": "儿童摄影",
            "parent_id": 23,
            "sort": 5,
            "status": 1,
            "create_at": 1533284376,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 78,
            "isSelect": 0,
            "name": "母婴",
            "parent_id": 23,
            "sort": 6,
            "status": 1,
            "create_at": 1532505537,
            "settop_at": null,
            "child": []
          }
        ]
      },
      {
        "business_category_id": 21,
        "isSelect": 0,
        "name": "医疗健康",
        "parent_id": 0,
        "sort": 8,
        "status": 1,
        "create_at": 1532309626,
        "settop_at": null,
        "child": [
          {
            "business_category_id": 58,
            "isSelect": 1,
            "name": "口腔齿科",
            "parent_id": 21,
            "sort": 1,
            "status": 1,
            "create_at": 1532334048,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 65,
            "isSelect": 0,
            "name": "眼科",
            "parent_id": 21,
            "sort": 2,
            "status": 1,
            "create_at": 1532402943,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 112,
            "isSelect": 0,
            "name": "中医",
            "parent_id": 21,
            "sort": 5,
            "status": 1,
            "create_at": 1534906382,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 63,
            "isSelect": 0,
            "name": "保健",
            "parent_id": 21,
            "sort": 99,
            "status": 1,
            "create_at": 1532399000,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 56,
            "isSelect": 0,
            "name": "视力",
            "parent_id": 21,
            "sort": 99,
            "status": 1,
            "create_at": 1532332130,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 44,
            "isSelect": 0,
            "name": "医疗健康",
            "parent_id": 21,
            "sort": 99,
            "status": 1,
            "create_at": 1532315435,
            "settop_at": null,
            "child": []
          }
        ]
      },
      {
        "business_category_id": 42,
        "isSelect": 0,
        "name": "爱宠",
        "parent_id": 0,
        "sort": 9,
        "status": 1,
        "create_at": 1532311150,
        "settop_at": null,
        "child": [
          {
            "business_category_id": 59,
            "isSelect": 1,
            "name": "宠物店/宠物医院",
            "parent_id": 42,
            "sort": 1,
            "status": 1,
            "create_at": 1532336832,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 43,
            "isSelect": 0,
            "name": "宠物美容",
            "parent_id": 42,
            "sort": 99,
            "status": 1,
            "create_at": 1532311156,
            "settop_at": null,
            "child": []
          }
        ]
      },
      {
        "business_category_id": 69,
        "isSelect": 0,
        "name": "结婚",
        "parent_id": 0,
        "sort": 10,
        "status": 1,
        "create_at": 1532500175,
        "settop_at": null,
        "child": [
          {
            "business_category_id": 79,
            "isSelect": 1,
            "name": "婚纱摄影",
            "parent_id": 69,
            "sort": 1,
            "status": 1,
            "create_at": 1532506942,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 97,
            "isSelect": 0,
            "name": "西装定制",
            "parent_id": 69,
            "sort": 2,
            "status": 1,
            "create_at": 1533106151,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 70,
            "isSelect": 0,
            "name": "婚礼服务",
            "parent_id": 69,
            "sort": 3,
            "status": 1,
            "create_at": 1532500193,
            "settop_at": null,
            "child": []
          }
        ]
      },
      {
        "business_category_id": 12,
        "isSelect": 0,
        "name": "电影",
        "parent_id": 0,
        "sort": 11,
        "status": 1,
        "create_at": 1529923045,
        "settop_at": null,
        "child": [
          {
            "business_category_id": 32,
            "isSelect": 1,
            "name": "私人影吧",
            "parent_id": 12,
            "sort": 99,
            "status": 1,
            "create_at": 1532310139,
            "settop_at": null,
            "child": []
          }
        ]
      },
      {
        "business_category_id": 37,
        "isSelect": 0,
        "name": "爱车",
        "parent_id": 0,
        "sort": 12,
        "status": 1,
        "create_at": 1532311108,
        "settop_at": null,
        "child": [
          {
            "business_category_id": 41,
            "isSelect": 1,
            "name": "租车",
            "parent_id": 37,
            "sort": 99,
            "status": 1,
            "create_at": 1532311136,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 40,
            "isSelect": 0,
            "name": "汽车服务",
            "parent_id": 37,
            "sort": 99,
            "status": 1,
            "create_at": 1532311130,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 39,
            "isSelect": 0,
            "name": "维修保养",
            "parent_id": 37,
            "sort": 99,
            "status": 1,
            "create_at": 1532311123,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 38,
            "isSelect": 0,
            "name": "汽车配饰",
            "parent_id": 37,
            "sort": 99,
            "status": 1,
            "create_at": 1532311115,
            "settop_at": null,
            "child": []
          }
        ]
      },
      {
        "business_category_id": 86,
        "isSelect": 0,
        "name": "消费购物",
        "parent_id": 0,
        "sort": 14,
        "status": 1,
        "create_at": 1532510437,
        "settop_at": null,
        "child": [
          {
            "business_category_id": 87,
            "isSelect": 1,
            "name": "眼镜店",
            "parent_id": 86,
            "sort": 1,
            "status": 1,
            "create_at": 1532510452,
            "settop_at": null,
            "child": []
          }
        ]
      },
      {
        "business_category_id": 73,
        "isSelect": 0,
        "name": "家装",
        "parent_id": 0,
        "sort": 14,
        "status": 1,
        "create_at": 1532501965,
        "settop_at": null,
        "child": [
          {
            "business_category_id": 74,
            "isSelect": 1,
            "name": "家居家纺",
            "parent_id": 73,
            "sort": 1,
            "status": 1,
            "create_at": 1532501978,
            "settop_at": null,
            "child": []
          },
          {
            "business_category_id": 84,
            "isSelect": 0,
            "name": "装修设计",
            "parent_id": 73,
            "sort": 5,
            "status": 1,
            "create_at": 1532510121,
            "settop_at": null,
            "child": []
          }
        ]
      }
    ],
    businessList: [
      {
        "type": 1,
        "name": "菲琳美业(广都上街店)",
        "business_offline_id": 2444,
        "logo": "https://img.duishangbao.cn/upload/business/logo/2/a2e4eb04336e6d230c26a9ad513d4715.jpeg",
        "province": 510000,
        "city": 510100,
        "county": 510107,
        "address": "成都市双流区华阳街道广都上街24号",
        "longitude_latitude": "104.087479,30.499793",
        "insert_package_status": 1,
        "km": "16.44"
      },
      {
        "type": 1,
        "name": "P&D仙女美发馆",
        "business_offline_id": 2206,
        "logo": "https://img.duishangbao.cn/upload/business/logo/2/cf88c59153cfce1e6be32eb2fb602eae.jpeg",
        "province": 510000,
        "city": 510100,
        "county": 510107,
        "address": "高新区天府二街蜀都中心一期3栋1917（汉庭酒店大厅左侧高区电梯）",
        "longitude_latitude": "104.072188,30.558279",
        "insert_package_status": 1,
        "km": "9.77"
      },
      {
        "type": 1,
        "name": "LY私人订制",
        "business_offline_id": 916,
        "logo": "https://img.duishangbao.cn/upload/business/logo/1/7f62833ae902a819344fe19e1fc0ebba.jpeg",
        "province": 510000,
        "city": 510100,
        "county": 510104,
        "address": "成都市双流县锦华路一段-道路85号",
        "longitude_latitude": "104.105849,30.618227",
        "insert_package_status": 1,
        "km": "6.59"
      },
      {
        "type": 1,
        "name": "银座美业",
        "business_offline_id": 885,
        "logo": "https://img.duishangbao.cn/upload/business/logo/2/30db1c62ade68677e84dc04dde0f8bba.jpeg",
        "province": 510000,
        "city": 510100,
        "county": 510122,
        "address": "成都市双流区锦华路三段166号3栋2层8号",
        "longitude_latitude": "104.10313,30.599623",
        "insert_package_status": 1,
        "km": "7.47"
      },
      {
        "type": 1,
        "name": "BVLGARI",
        "business_offline_id": 831,
        "logo": "https://img.duishangbao.cn/upload/business/logo/1/4edec5479834cec9568dd02ca832f810.jpeg",
        "province": 510000,
        "city": 510100,
        "county": 510107,
        "address": "成都市武侯区董家湾南街124号附近",
        "longitude_latitude": "104.034599,30.630261",
        "insert_package_status": 1,
        "km": "1.58"
      },
      {
        "type": 1,
        "name": "lNNER BELLA韩国皮肤管理",
        "business_offline_id": 775,
        "logo": "https://img.duishangbao.cn/upload/business/logo/1/65a169feaf1d2c46727f76a360acedb2.jpeg",
        "province": 510000,
        "city": 510100,
        "county": 510105,
        "address": "成都市青羊区北东街1号3栋1单元1楼25号",
        "longitude_latitude": "104.084308,30.677619",
        "insert_package_status": 1,
        "km": "5.56"
      },
      {
        "type": 1,
        "name": "醒目 Fashion Show",
        "business_offline_id": 729,
        "logo": "https://img.duishangbao.cn/upload/business/logo/1/038f7ff1f94ffb6a18127879c4c50640.jpeg",
        "province": 510000,
        "city": 510100,
        "county": 510108,
        "address": "成都市成华区双成三路-道路16号附29号技术优选(凌云府小区门口旁边)",
        "longitude_latitude": "104.125386,30.652809",
        "insert_package_status": 1,
        "km": "7.96"
      },
      {
        "type": 1,
        "name": "格林尚雅",
        "business_offline_id": 592,
        "logo": "https://img.duishangbao.cn/upload/business/logo/1/c323c34c4b923a1174fef9c19650cc1d.jpeg",
        "province": 510000,
        "city": 510100,
        "county": 510122,
        "address": "成都市双流区朝阳路296附2号附近",
        "longitude_latitude": "104.102491,30.566646",
        "insert_package_status": 1,
        "km": "10.17"
      },
      {
        "type": 1,
        "name": "曼蒂造型（锦辰佳苑店）",
        "business_offline_id": 589,
        "logo": "https://img.duishangbao.cn/upload/business/logo/1/1ba9ac14a4606bce642a8510ea7f4e59.jpeg",
        "province": 510000,
        "city": 510100,
        "county": 510122,
        "address": " 成都市双流县其他 双流区双流区应龙北三路39号",
        "longitude_latitude": "104.102881,30.551278",
        "insert_package_status": 1,
        "km": "11.65"
      },
      {
        "type": 1,
        "name": "曼蒂造型（新下街店）",
        "business_offline_id": 588,
        "logo": "https://img.duishangbao.cn/upload/business/logo/1/c410c988e8546d9940b5db162445c586.jpeg",
        "province": 510000,
        "city": 510100,
        "county": 510122,
        "address": "成都市双流县其他高新区中和新下街189号 ",
        "longitude_latitude": "104.095322,30.55418",
        "insert_package_status": 1,
        "km": "11.02"
      },
      {
        "type": 1,
        "name": "张先生家(天合分店)",
        "business_offline_id": 513,
        "logo": "https://img.duishangbao.cn/upload/business/logo/2/585c91f713884e4380e91a3e7378399c.jpeg",
        "province": 510000,
        "city": 510100,
        "county": 510107,
        "address": "成都市武侯区天合凯旋南城B座825",
        "longitude_latitude": "104.05377,30.563175",
        "insert_package_status": 1,
        "km": "8.88"
      },
      {
        "type": 1,
        "name": "佐野日系造型",
        "business_offline_id": 501,
        "logo": "https://img.duishangbao.cn/upload/business/logo/2/3515088a1cb6dd151db712abaa2b6519.jpeg",
        "province": 510000,
        "city": 510100,
        "county": 510107,
        "address": "高新区汇锦城C座1624",
        "longitude_latitude": "104.060489,30.562579",
        "insert_package_status": 1,
        "km": "9.04"
      },
      {
        "type": 1,
        "name": "快乐发语理发店（建设南街店）",
        "business_offline_id": 352,
        "logo": "https://img.duishangbao.cn/upload/business/logo/1/0a2fd9de5a2818c77fbccd65d0d09165.jpeg",
        "province": 510000,
        "city": 510100,
        "county": 510108,
        "address": "成都市成华区快乐发语(建设路店)建设南街15号附7号",
        "longitude_latitude": "104.112952,30.674833",
        "insert_package_status": 1,
        "km": "7.60"
      },
      {
        "type": 1,
        "name": "快乐发语理发店",
        "business_offline_id": 348,
        "logo": "https://img.duishangbao.cn/upload/business/logo/1/951857d9bc0238cbcbf044afbf57b213.jpeg",
        "province": 510000,
        "city": 510100,
        "county": 510114,
        "address": "成都市新都区花都大道-道路807号",
        "longitude_latitude": "104.077055,30.766831",
        "insert_package_status": 1,
        "km": "14.23"
      },
      {
        "type": 1,
        "name": "怡瑞造型(朝阳路三店)",
        "business_offline_id": 176,
        "logo": "https://img.duishangbao.cn/upload/business/logo/1/a6e873c869dc9f40b553e9967b3b4828.jpeg",
        "province": 510000,
        "city": 510100,
        "county": 510122,
        "address": "成都市双流区香榭国际-二期",
        "longitude_latitude": "104.101528,30.556957",
        "insert_package_status": 1,
        "km": "11.04"
      },
      {
        "type": 1,
        "name": "组合精剪",
        "business_offline_id": 141,
        "logo": "https://img.duishangbao.cn/upload/business/logo/1/cfef71d232869b5936fe4dc57d8a6ed7.jpeg",
        "province": 510000,
        "city": 510100,
        "county": 510122,
        "address": "成都市双流县观东一街-513",
        "longitude_latitude": "104.088246,30.537329",
        "insert_package_status": 1,
        "km": "12.47"
      },
      {
        "type": 1,
        "name": "C度Design专注设计&美发沙龙",
        "business_offline_id": 124,
        "logo": "https://img.duishangbao.cn/upload/business/logo/1/09004b4bb022ce1d8068155a3f95b19d.jpeg",
        "province": 510000,
        "city": 510100,
        "county": 510107,
        "address": "武侯区锦绣路44号附14号C度Design理发店内(ATTktv对面",
        "longitude_latitude": "104.082657,30.631219",
        "insert_package_status": 1,
        "km": "3.99"
      },
      {
        "type": 1,
        "name": "SEN·STYLE森造型(绿地之窗店)",
        "business_offline_id": 93,
        "logo": "https://img.duishangbao.cn/upload/business/logo/2/8538affdd0cd28a0bce7215b5f5cd0a1.jpeg",
        "province": 510000,
        "city": 510100,
        "county": 510107,
        "address": " 成都市武侯区 天府二街368号绿地之窗2栋(卡莫咖啡对面二楼) ",
        "longitude_latitude": "104.066229,30.558298",
        "insert_package_status": 1,
        "km": "9.62"
      },
      {
        "type": 1,
        "name": "I·SE·SALON(中德英伦城邦店)",
        "business_offline_id": 91,
        "logo": "https://img.duishangbao.cn/upload/business/logo/1/7742dd605943821fcc35fbbde2d76473.jpeg",
        "province": 510000,
        "city": 510100,
        "county": 510122,
        "address": "成都市双流县雅和南二路218",
        "longitude_latitude": "104.082652,30.509355",
        "insert_package_status": 1,
        "km": "15.29"
      },
      {
        "type": 1,
        "name": "LAINEY YOUNG剪发染发烫发（高新鹭洲里店）",
        "business_offline_id": 2,
        "logo": "https://img.duishangbao.cn/upload/business/logo/1/f0966e3e4760c55535c65933fbd97983.jpeg",
        "province": 510000,
        "city": 510100,
        "county": 510107,
        "address": "成都市武侯区如释瑜伽鹭洲里馆6层",
        "longitude_latitude": "104.047342,30.55656",
        "insert_package_status": 1,
        "km": "9.57"
      }
    ],
    homeBannerList: ['https://img.duishangbao.cn/upload/business/master/4/10a1cd7c60b1398038970e83fd385350.jpeg', 'https://img.duishangbao.cn/upload/business/master/4/9b9dde9af3594ea950d358e82391f80d.jpeg'],
    homePackageList: [
      {
        "package_id": 2924,
        "package_name": "6-8人餐",
        "package_type": 1,
        "package_tag": "",
        "package_desc": "<p><span style=\"font-size: small;\">套餐内容<br>荤菜 <br>水晶鸭肠 18 1 份&nbsp;<br>精品千层肚 28 1 份 &nbsp;<br>胶原肥牛 23 1 份 &nbsp;<br>水晶牛肉 25 1 份 &nbsp;<br>广味香肠 11 1 份&nbsp;<br>巴沙鱼片 18 1 份&nbsp;<br>玫瑰圆子 18 1 份 &nbsp;<br>耗儿鱼 19 1 份<br>红门肥肠 18 1 份 &nbsp;<br>梅林午餐肉 16 1 份&nbsp;<br>一品虾饺 13 1 份<br>鹌鹑蛋 11 1 份 11 <br>素菜 <br>手工黑豆腐 10 1 份&nbsp;<br>海带芽 8 1 份 8 <br>碗碗鲜鸭血 7 1 份&nbsp;<br>鲜藕片 7 1 份&nbsp;<br>功夫土豆片 7 1 份<br>番茄 6 1 份&nbsp;<br>豆芽 3 1 份&nbsp;<br>小吃 <br>现炸酥肉 16 1 份 &nbsp;<br>锅底 3 选 1 <br>牛油红锅 49 1 份 &nbsp;<br>番茄鸳鸯 49 1 份<br>红白鸳鸯锅 49 1 份&nbsp;<br>油碟 <br>香油碟 5 8 份 40 <br>  价值：371&nbsp;<br>免费提供餐巾纸<br>商户于2018-8-2开始接待消费者，请各位会员届时到店进行消费，祝用餐愉快<br>购买须知<br>有效期 2018.8.2 至 2019.11.1（周末、法定节假日通用） <br>使用时间 11:00-15:00,21:00-次日02:00 <br>使用规则 团购用户不可同时享受商家其他优惠酒水饮料等问题，请致电商家咨询，以商家反馈为准如部分菜品因时令或其他不可抗因素导致无法提供，店内会用等价菜品替换，具体事宜请与店内协商，不可使用包间，无需预约，消费高峰时可能需要等位，每桌最多使用1张券每张券建议6至8人使用，提供免费WiFi停车位收费标准：咨询商户，仅限堂食，不提供餐前外带，餐毕未吃完可打包，打包费详情咨询商家 <br>图文详情</span><br></p>",
        "price": "26800",
        "business_id": 1974,
        "business_name": "红四门秘制老火锅（高升桥店）",
        "unable_time": null,
        "enable_time": "周一至周日",
        "first_category_id": 1,
        "first_category_name": "美食",
        "second_category_id": 3,
        "second_category_name": "火锅",
        "list_img": "https://img.duishangbao.cn/upload/package/list/2/bf7c55393f87ca08dab29ae88a90ea24.jpeg",
        "status": 1,
        "num": 1000,
        "expire_time": 1572537599,
        "use_time": 1572537599,
        "create_at": "2018-10-19 17:03:11",
        "sale": 0,
        "gold_price": 268
      },
      {
        "package_id": 2923,
        "package_name": "4人餐",
        "package_type": 1,
        "package_tag": "",
        "package_desc": "<p><span style=\"font-size: small;\">套餐内容<br>荤菜 <br>水晶鸭肠 18 1 份 &nbsp;<br>精品千层肚 28 1 份 &nbsp;<br>胶原肥牛 23 1 份<br>巴沙鱼片 18 1 份&nbsp;<br>梅林午餐肉 16 1 份&nbsp;<br>一品虾饺 13 1 份&nbsp;<br>素菜 <br>手工黑豆腐 10 1 份<br>碗碗鲜鸭血 7 1 份&nbsp;<br>鲜藕片 7 1 份 7 <br>功夫土豆片 7 1 份&nbsp;<br>豆芽 3 1 份 3 <br>锅底 3 选 1 <br>牛油红锅 49 1 份&nbsp;<br>番茄鸳鸯 49 1 份 &nbsp;<br>红白鸳鸯锅 49 1 份 &nbsp;<br>油碟 <br>香油碟 5 4 份 20 <br>  价值：251&nbsp;<br>免费提供餐巾纸<br>商户于2018-8-2开始接待消费者，请各位会员届时到店进行消费，祝用餐愉快<br>购买须知<br>有效期 2018.8.2 至 2019.11.1（周末、法定节假日通用） <br>使用时间 11:00-15:00,21:00-次日02:00 <br>使用规则 团购用户不可同时享受商家其他优惠酒水饮料等问题，请致电商家咨询，以商家反馈为准如部分菜品因时令或其他不可抗因素导致无法提供，店内会用等价菜品替换，具体事宜请与店内协商，不可使用包间，无需预约，消费高峰时可能需要等位，每桌最多使用1张美团券每张美团券建议4人使用，提供免费WiFi停车位收费标准：咨询商户，仅限堂食，不提供餐前外带，餐毕未吃完可打包，打包费详情咨询商家&nbsp;</span><br></p>",
        "price": "17900",
        "business_id": 1974,
        "business_name": "红四门秘制老火锅（高升桥店）",
        "unable_time": null,
        "enable_time": "周一至周日",
        "first_category_id": 1,
        "first_category_name": "美食",
        "second_category_id": 3,
        "second_category_name": "火锅",
        "list_img": "https://img.duishangbao.cn/upload/package/list/2/83c198376f0d649e0c8ff41e47742ba7.jpeg",
        "status": 1,
        "num": 1000,
        "expire_time": 1572537599,
        "use_time": 1572537599,
        "create_at": "2018-10-19 17:01:18",
        "sale": 0,
        "gold_price": 179
      },
      {
        "package_id": 2922,
        "package_name": "精致2人餐",
        "package_type": 1,
        "package_tag": "",
        "package_desc": "<p><span style=\"font-size: small;\">套餐内容<br>荤菜 <br>水晶鸭肠 18 1 份&nbsp;<br>精品千层肚 28 1 份<br>胶原肥牛 23 1 份 &nbsp;<br>一品虾饺 13 1 份 &nbsp;<br>素菜 <br>碗碗鲜鸭血 7 1 份<br>鲜藕片 7 1 份&nbsp;<br>功夫土豆片 7 1 份&nbsp;<br>锅底 3 选 1 <br>牛油红锅 49 1 份 &nbsp;<br>番茄鸳鸯 49 1 份&nbsp;<br>红白鸳鸯锅 49 1 份&nbsp;<br>油碟 <br>香油碟 5 2 份 10 <br>  价值：162&nbsp;<br>免费提供餐巾纸<br>商户于2018-8-2开始接待消费者，请各位会员届时到店进行消费，祝用餐愉快<br>购买须知<br>有效期 2018.8.2 至 2019.11.1（周末、法定节假日通用） <br>使用时间 11:00-15:00,21:00-次日02:00 <br>使用规则 团购用户不可同时享受商家其他优惠酒水饮料等问题，请致电商家咨询，以商家反馈为准如部分菜品因时令或其他不可抗因素导致无法提供，店内会用等价菜品替换，具体事宜请与店内协商，不可使用包间，无需预约，消费高峰时可能需要等位，每桌最多使用1张券每张券建议2人使用，提供免费WiFi停车位收费标准：咨询商户，仅限堂食，不提供餐前外带，餐毕未吃完可打包，打包费详情咨询商家&nbsp;</span><br></p>",
        "price": "10900",
        "business_id": 1974,
        "business_name": "红四门秘制老火锅（高升桥店）",
        "unable_time": null,
        "enable_time": "周一至周日",
        "first_category_id": 1,
        "first_category_name": "美食",
        "second_category_id": 3,
        "second_category_name": "火锅",
        "list_img": "https://img.duishangbao.cn/upload/package/list/2/0d89cdb4169cb351cd3aaed0ff673298.jpeg",
        "status": 1,
        "num": 1000,
        "expire_time": 1572537599,
        "use_time": 1572537599,
        "create_at": "2018-10-19 16:58:55",
        "sale": 0,
        "gold_price": 109
      }
    ],
    homeCouponList: [
      {
        "package_name": "68代100代金卷",
        "silver_price": "0",
        "price": "6800",
        "package_id": 2925,
        "enable_time": "周一至周日",
        "num": 1000,
        "sale_num": 0,
        "gold_price": 68
      }
    ],
    city: {},
    qqmapsdk: ''
  }
});