//app.js
const RSA = require('lib/rsa.js');
const Util = require('utils/util.js');
const QQMapWX = require('./lib/qqmap-wx-jssdk.min.js');
const sha1CryptoJS = require('./lib/sha1.js');

App({
  onLaunch() {

    let _this = this;
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.info(res);
      }
    });
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              _this.globalData.userInfo = res.userInfo;

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              } else {
                console.log('no')
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
    });

    _this.getUserCapital();
  },
  /**
   * 获取用户余额，金贝数
   */
  getUserCapital: function () {
    let _this = this;
    _this.myAjax('get', 'bhs-client-online/userCapital/detail', '{}', (res) => {
      if (res.code == 1) {
        let {balance, gold, silver, copper} = res.data;
        _this.globalData.balance = balance;
        _this.globalData.gold = gold;
        _this.globalData.silver = silver;
        _this.globalData.copper = copper;
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
    vision: 'V3.0.0',
    host: 'http://39.108.96.150:5200/', // api接口域名前缀
    //host: 'http://192.168.100.231:5200/', // api接口域名前缀
    imgUrl: 'https://img.duishangbao.cn/', // 图片阿里云前缀
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
        'B-Author': 'app=1000&sid=' + sid + '&nonce=' + nonce + '&timespan=' + Date.parse(new Date()) + '&device=16&uid=' + uid + '& sig=' + sign,
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
          _this.getEncryptKey();
          _this.getEncryptData(res.code);
          _this.myAjax('post', 'bhs-client-online/ucenter/wx/appLogin', {
            'encryptKey': _this.globalData.encryptKey,
            'encryptData': _this.globalData.encryptData
          }, (res) => {
            console.log('成功' + JSON.stringify(res));
            let {session, sid, uid, openId, unionId} = res.data;
            wx.setStorageSync('session', session);
            wx.setStorageSync('sid', sid);
            wx.setStorageSync('uid', uid);
            wx.setStorageSync('openId', openId);
            wx.setStorageSync('unionId', unionId);
            _this.globalData.isLogin = 1;
            that.setData({
              loginbox: 0
            });
            that.userInfoReadyCallback(res)
          }, (res) => {
            console.log('失败' + JSON.stringify(res))
          })
        } else {
          console.info('登录发生错误' + res)
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
        url: '/' + url
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
    console.log(this.globalData.encryptKey)
  },
  /**
   * 加密数据
   * @param jsCode
   */
  getEncryptData: function (jsCode) {
    var obj = 'jsCode=' + jsCode + '&content=' + JSON.stringify(this.globalData.userInfo) + '&app=1000&device=32&nonce=' + this.getAesKey(8) + '&timespan=' + Date.parse(new Date());
    this.globalData.encryptData = Util.Encrypt(obj, this.globalData.aesKey);
    console.log(1)
  },
  /**
   * 生成签名
   * @returns {*}
   */
  getSign (message, key) {
    return sha1CryptoJS.enc.Hex.stringify(sha1CryptoJS.HmacSHA1(message, key))
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
    let notClear = ['session', 'sid', 'uid'];
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
  data: {
    classify: [
      {
        "cid": 3,
        "c_name": "美妆",
        "parent_id": 0,
        "level": 1,
        "logo": "upload/goods/category_logo/",
        "data": [
          {
            "s_cid": 11,
            "s_c_name": "护肤品",
            "s_parent_id": 3,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/09766e1777389cd7ebc13eec905e0e5f.jpeg"
          },
          {
            "s_cid": 90,
            "s_c_name": "彩妆",
            "s_parent_id": 3,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/4ee5df6a82265cdc9067bd85d66a44b0.jpeg"
          },
          {
            "s_cid": 92,
            "s_c_name": "口红",
            "s_parent_id": 3,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/9343a2285f3fd55f053fcd05164eb26d.jpeg"
          },
          {
            "s_cid": 97,
            "s_c_name": "面膜",
            "s_parent_id": 3,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/af66c5572596dcb16f1d1ad235e2d5c3.jpeg"
          },
          {
            "s_cid": 99,
            "s_c_name": "男士护肤",
            "s_parent_id": 3,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/90c007a99aeb3b14037e6d7ce62a9779.jpeg"
          },
          {
            "s_cid": 100,
            "s_c_name": "脱毛膏",
            "s_parent_id": 3,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/d96f8da4a0a3457659a9974975f222bf.jpeg"
          },
          {
            "s_cid": 101,
            "s_c_name": "洗护用品",
            "s_parent_id": 3,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/a3076c982092f6933bf655261a5911a7.jpeg"
          },
          {
            "s_cid": 102,
            "s_c_name": "香水",
            "s_parent_id": 3,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/5d81a86ace3d93a4347ad84e24072462.jpeg"
          },
          {
            "s_cid": 103,
            "s_c_name": "眼霜",
            "s_parent_id": 3,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/91e690cf471806ab1b508639954cf1b8.jpeg"
          }
        ]
      }, {
        "cid": 4,
        "c_name": "家电",
        "parent_id": 0,
        "level": 1,
        "logo": "upload/goods/category_logo/",
        "data": [
          {
            "s_cid": 105,
            "s_c_name": "按摩椅",
            "s_parent_id": 4,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/04f28d206fea762716d430dc1a73a0a2.jpeg"
          },
          {
            "s_cid": 106,
            "s_c_name": "冰箱",
            "s_parent_id": 4,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/e9866260bdbca2e0e024175584c23f94.jpeg"
          },
          {
            "s_cid": 108,
            "s_c_name": "抽油烟机",
            "s_parent_id": 4,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/8f6007d42ab64eb8a90f5f6759d7a899.jpeg"
          },
          {
            "s_cid": 109,
            "s_c_name": "电饼铛",
            "s_parent_id": 4,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/22f1c3ced0699ebda58402cd8719fd17.jpeg"
          },
          {
            "s_cid": 111,
            "s_c_name": "电吹风",
            "s_parent_id": 4,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/cdf74f8248cd373e5f9f107da31d05cd.jpeg"
          },
          {
            "s_cid": 116,
            "s_c_name": "电磁炉",
            "s_parent_id": 4,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/43449a54992381b8a174f062ddf2fef6.jpeg"
          },
          {
            "s_cid": 121,
            "s_c_name": "电炖锅",
            "s_parent_id": 4,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/a12a8a023aecb36289ec3af8534a7f8f.jpeg"
          },
          {
            "s_cid": 124,
            "s_c_name": "电饭煲",
            "s_parent_id": 4,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/49e893fb3e8ab84d1dc3e12940e1ba52.jpeg"
          },
          {
            "s_cid": 126,
            "s_c_name": "电风扇",
            "s_parent_id": 4,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/707378579f19046e40624cf2030a6d90.jpeg"
          },
          {
            "s_cid": 127,
            "s_c_name": "电热锅",
            "s_parent_id": 4,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/dbdde25572145bc0384433fcf64b2f1e.jpeg"
          },
          {
            "s_cid": 128,
            "s_c_name": "电视机",
            "s_parent_id": 4,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/69f7e89d823e4d3fdfddb7d781f495a7.jpeg"
          },
          {
            "s_cid": 129,
            "s_c_name": "电蚊拍",
            "s_parent_id": 4,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/a852273f6a681d49d0e074c8b90f4748.jpeg"
          },
          {
            "s_cid": 130,
            "s_c_name": "豆浆机",
            "s_parent_id": 4,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/bdef7854e0c161804e974d6c002c513f.jpeg"
          },
          {
            "s_cid": 132,
            "s_c_name": "家电配件",
            "s_parent_id": 4,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/712b796147df238d7bf3280bb634dc8c.jpeg"
          },
          {
            "s_cid": 134,
            "s_c_name": "家用电器",
            "s_parent_id": 4,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/d83eb5831813ff4756ce3fcd2450eb15.jpeg"
          },
          {
            "s_cid": 137,
            "s_c_name": "净化器",
            "s_parent_id": 4,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/a54e2cae6babe51590e90f3110243e9d.jpeg"
          },
          {
            "s_cid": 141,
            "s_c_name": "净水器",
            "s_parent_id": 4,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/dcdd88cbe0d316df359475dc8f479dd3.jpeg"
          },
          {
            "s_cid": 145,
            "s_c_name": "空调",
            "s_parent_id": 4,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/832c1a75d3c08a5a695dc0433012bd95.jpeg"
          },
          {
            "s_cid": 148,
            "s_c_name": "灭蚊灯",
            "s_parent_id": 4,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/1374132c5f4d9834aaaa0ef8431fb057.jpeg"
          },
          {
            "s_cid": 149,
            "s_c_name": "热水器",
            "s_parent_id": 4,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/38abb3efdb747fe85c895e77c9612df3.jpeg"
          },
          {
            "s_cid": 150,
            "s_c_name": "台灯",
            "s_parent_id": 4,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/8db2e8e3bcaa71bd0f1ea7d7ae722ac6.jpeg"
          },
          {
            "s_cid": 151,
            "s_c_name": "洗衣机",
            "s_parent_id": 4,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/414c79dfd93b0c7ce9ac5a83e11dfaf6.jpeg"
          },
          {
            "s_cid": 152,
            "s_c_name": "饮水机",
            "s_parent_id": 4,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/c58f3334d84a7fac65b7e4dcbca9c273.jpeg"
          },
          {
            "s_cid": 153,
            "s_c_name": "熨斗机",
            "s_parent_id": 4,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/85247355a467020660afd6104b6053cb.jpeg"
          },
          {
            "s_cid": 154,
            "s_c_name": "榨汁机",
            "s_parent_id": 4,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/bebf292a13222b9a7777c53c58023320.jpeg"
          },
          {
            "s_cid": 215,
            "s_c_name": "电水壶",
            "s_parent_id": 4,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/ae43bb55501df98b6ed29f28c22eabdd.png"
          }
        ]
      },
      {
        "cid": 7,
        "c_name": "箱包",
        "parent_id": 0,
        "level": 1,
        "logo": "upload/goods/category_logo/",
        "data": [
          {
            "s_cid": 110,
            "s_c_name": "单肩包",
            "s_parent_id": 7,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/929fa17d907b278fe3e9436fb8d39919.jpeg"
          },
          {
            "s_cid": 131,
            "s_c_name": "手提包",
            "s_parent_id": 7,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/31bb9a07ff980ac9b0f7291eb35f6ce8.jpeg"
          },
          {
            "s_cid": 135,
            "s_c_name": "双肩包",
            "s_parent_id": 7,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/f0a005bbdde216dbdef51d05eceb374d.jpeg"
          },
          {
            "s_cid": 138,
            "s_c_name": "旅行包",
            "s_parent_id": 7,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/422b36d53fcf453bff35dabcb4550613.jpeg"
          },
          {
            "s_cid": 140,
            "s_c_name": "钱包",
            "s_parent_id": 7,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/219bf02010a4514edffae6da741a46ea.jpeg"
          },
          {
            "s_cid": 143,
            "s_c_name": "女包",
            "s_parent_id": 7,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/8cbf1520578ffd80c7e0efd769841903.jpeg"
          },
          {
            "s_cid": 144,
            "s_c_name": "男包",
            "s_parent_id": 7,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/81896fc3b892d140dc85db10fb9b1059.jpeg"
          },
          {
            "s_cid": 147,
            "s_c_name": "旅行箱",
            "s_parent_id": 7,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/c37a6a89be21d380a72b598adb0b4c0c.jpeg"
          }
        ]
      },
      {
        "cid": 10,
        "c_name": "鞋类",
        "parent_id": 0,
        "level": 1,
        "logo": "upload/goods/category_logo/",
        "data": [
          {
            "s_cid": 214,
            "s_c_name": "女鞋",
            "s_parent_id": 10,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/bf0553a5a5c3eee9f4ed3934db70f682.png"
          },
          {
            "s_cid": 123,
            "s_c_name": "球鞋",
            "s_parent_id": 10,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/282ca61e56b04ba479dccc5dbf902379.jpeg"
          },
          {
            "s_cid": 119,
            "s_c_name": "情侣鞋",
            "s_parent_id": 10,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/90baa70a95b38f51b80ef5aacc8974fe.jpeg"
          },
          {
            "s_cid": 115,
            "s_c_name": "拖鞋",
            "s_parent_id": 10,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/61465caabd685992b769ad3b8414b2f2.jpeg"
          },
          {
            "s_cid": 113,
            "s_c_name": "童鞋",
            "s_parent_id": 10,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/052f43f17a2c9b41d708bfff42a24740.jpeg"
          },
          {
            "s_cid": 107,
            "s_c_name": "男鞋",
            "s_parent_id": 10,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/b361eb143e8f132a0262699973986223.jpeg"
          }
        ]
      },
      {
        "cid": 14,
        "c_name": "手机数码",
        "parent_id": 0,
        "level": 1,
        "logo": "upload/goods/category_logo/",
        "data": [
          {
            "s_cid": 155,
            "s_c_name": "手机数码",
            "s_parent_id": 14,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/3176abfa3c49b243c0ed71263add775f.png"
          },
          {
            "s_cid": 156,
            "s_c_name": "手机",
            "s_parent_id": 14,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/ac02401cb47c1d388bc8cc6ef07ff71b.jpeg"
          },
          {
            "s_cid": 157,
            "s_c_name": "相机",
            "s_parent_id": 14,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/76845e4c87bbafd582be790c24f5fe48.jpeg"
          },
          {
            "s_cid": 158,
            "s_c_name": "耳机",
            "s_parent_id": 14,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/f7a4b4a85f15746bd38a6bd72a026ebc.jpeg"
          },
          {
            "s_cid": 159,
            "s_c_name": "移动电源",
            "s_parent_id": 14,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/73898ef6a2611f6ce3198a342de566b8.jpeg"
          },
          {
            "s_cid": 160,
            "s_c_name": "投影仪",
            "s_parent_id": 14,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/8328eb52ae3bb428787b561872d391ff.jpeg"
          },
          {
            "s_cid": 161,
            "s_c_name": "智能设备",
            "s_parent_id": 14,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/702a1014dd22e6ae5f8f4dc377f8f4ce.jpeg"
          },
          {
            "s_cid": 162,
            "s_c_name": "数码配件",
            "s_parent_id": 14,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/a99a96646a030fe90ed2d778235868fe.jpeg"
          },
          {
            "s_cid": 163,
            "s_c_name": "笔记本电脑",
            "s_parent_id": 14,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/95919154cb311690fea727dc495a4d7e.jpeg"
          },
          {
            "s_cid": 164,
            "s_c_name": "音响",
            "s_parent_id": 14,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/919312b6d8e5c354f62e2a253d1abbc2.jpeg"
          },
          {
            "s_cid": 211,
            "s_c_name": "无人机",
            "s_parent_id": 14,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/74fab8d28f5d1c5c2dccf56dce7c5b35.jpeg"
          }
        ]
      },
      {
        "cid": 15,
        "c_name": "户外运动",
        "parent_id": 0,
        "level": 1,
        "logo": "upload/goods/category_logo/",
        "data": [
          {
            "s_cid": 170,
            "s_c_name": "护膝",
            "s_parent_id": 15,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/3eab883f0940b3aa10587a658c6eff7a.jpeg"
          },
          {
            "s_cid": 171,
            "s_c_name": "溜冰鞋",
            "s_parent_id": 15,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/c7329638b80e55e2599c5a7c8f45a83c.jpeg"
          },
          {
            "s_cid": 172,
            "s_c_name": "旅行配件",
            "s_parent_id": 15,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/9cb7cd969766027d923022ef4fb6e958.jpeg"
          },
          {
            "s_cid": 173,
            "s_c_name": "渔具",
            "s_parent_id": 15,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/bc239b5732919781531afea7a1163c92.jpeg"
          },
          {
            "s_cid": 174,
            "s_c_name": "帐篷",
            "s_parent_id": 15,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/9cc346acabad9934c8a68e369a01778c.jpeg"
          }
        ]
      },
      {
        "cid": 16,
        "c_name": "珠宝",
        "parent_id": 0,
        "level": 1,
        "logo": "upload/goods/category_logo/",
        "data": [
          {
            "s_cid": 40,
            "s_c_name": "玉石",
            "s_parent_id": 16,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/910c888ebc0bd30e69d8c3ca64feb4f6.jpeg"
          },
          {
            "s_cid": 41,
            "s_c_name": "金银",
            "s_parent_id": 16,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/4ebfa19868966ca941d8e6c09685c485.jpeg"
          },
          {
            "s_cid": 43,
            "s_c_name": "文玩",
            "s_parent_id": 16,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/8f091bf13132685c2dc85c154a824902.jpeg"
          },
          {
            "s_cid": 44,
            "s_c_name": "水晶",
            "s_parent_id": 16,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/1ff25454690af050ddc06dff7a3abd82.jpeg"
          },
          {
            "s_cid": 45,
            "s_c_name": "珍珠",
            "s_parent_id": 16,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/0bee92f42618c1660f51e685d732052a.jpeg"
          },
          {
            "s_cid": 213,
            "s_c_name": "钻石",
            "s_parent_id": 16,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/fb6b98fdd686cda178bb2b3dc8438557.png"
          }
        ]
      },
      {
        "cid": 17,
        "c_name": "酒类",
        "parent_id": 0,
        "level": 1,
        "logo": "upload/goods/category_logo/",
        "data": [
          {
            "s_cid": 34,
            "s_c_name": "白酒",
            "s_parent_id": 17,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/a69e6392681e9d35d0571b85c296727c.jpeg"
          },
          {
            "s_cid": 35,
            "s_c_name": "葡萄酒",
            "s_parent_id": 17,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/cd17ea488b91c00c4e7f9c8d7e8f569b.jpeg"
          },
          {
            "s_cid": 36,
            "s_c_name": "洋酒",
            "s_parent_id": 17,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/2477a581492a661c6c7c1a0b0c6e67fb.jpeg"
          },
          {
            "s_cid": 37,
            "s_c_name": "黄酒",
            "s_parent_id": 17,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/d8054f62d256cf59d5a89684c0440192.jpeg"
          },
          {
            "s_cid": 38,
            "s_c_name": "保健酒",
            "s_parent_id": 17,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/5feeec4846cd7758393d6c9dbfd4bbd3.jpeg"
          },
          {
            "s_cid": 39,
            "s_c_name": "啤酒",
            "s_parent_id": 17,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/aa14040c3d03a347b4a0acef525ae099.jpeg"
          },
          {
            "s_cid": 175,
            "s_c_name": "配制酒",
            "s_parent_id": 17,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/8e336a636c41b375764a3bc5c795fe77.jpeg"
          }
        ]
      },
      {
        "cid": 18,
        "c_name": " 女装",
        "parent_id": 0,
        "level": 1,
        "logo": "upload/goods/category_logo/",
        "data": [
          {
            "s_cid": 46,
            "s_c_name": "气质连衣裙",
            "s_parent_id": 18,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/16c16cbbf67cb2a3a3b08dfc7c67de99.jpeg"
          },
          {
            "s_cid": 47,
            "s_c_name": "卫衣",
            "s_parent_id": 18,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/83a81d7f3dc09fe849aca3331b85dc82.jpeg"
          },
          {
            "s_cid": 48,
            "s_c_name": "时髦外套",
            "s_parent_id": 18,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/db3e834ae312f62e9975a6b2afb6b549.jpeg"
          },
          {
            "s_cid": 49,
            "s_c_name": "毛针织衫",
            "s_parent_id": 18,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/968159e69c9dd261f463710cbd718584.jpeg"
          },
          {
            "s_cid": 50,
            "s_c_name": "休闲裤",
            "s_parent_id": 18,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/8847a9af7e8167640f65c861ac5cc50a.jpeg"
          },
          {
            "s_cid": 51,
            "s_c_name": "牛仔裤",
            "s_parent_id": 18,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/0ca834c90462d44d259f8e56c76fddf0.jpeg"
          },
          {
            "s_cid": 52,
            "s_c_name": "衬衫",
            "s_parent_id": 18,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/7e6c0af72e800c050723bfce01ed2334.jpeg"
          },
          {
            "s_cid": 53,
            "s_c_name": "T恤",
            "s_parent_id": 18,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/17ff8e94706b097b22f2cea966d83bb5.jpeg"
          },
          {
            "s_cid": 54,
            "s_c_name": "小西装",
            "s_parent_id": 18,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/275da730c6eccf08dabb58eefb0d11c3.jpeg"
          },
          {
            "s_cid": 55,
            "s_c_name": "风衣",
            "s_parent_id": 18,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/ba487bb6f9aeeb79cc210eae063b0f93.jpeg"
          },
          {
            "s_cid": 57,
            "s_c_name": "孕妇装",
            "s_parent_id": 18,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/fa46ffbc6f058fa9f021ac3b7948baa6.jpeg"
          },
          {
            "s_cid": 58,
            "s_c_name": "打底裤",
            "s_parent_id": 18,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/abcdb082c63ded25d79ba2a6813e9305.jpeg"
          },
          {
            "s_cid": 59,
            "s_c_name": "皮裤",
            "s_parent_id": 18,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/5754f17ac1b6656769b3180593e78cbd.jpeg"
          },
          {
            "s_cid": 60,
            "s_c_name": "女士短裤",
            "s_parent_id": 18,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/e1c970fc4dda6e2c74ed5908f20c9c45.jpeg"
          },
          {
            "s_cid": 61,
            "s_c_name": "雪纺衫",
            "s_parent_id": 18,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/481989fc97d1193a3cf2c4fe935022e6.jpeg"
          },
          {
            "s_cid": 62,
            "s_c_name": "防晒衣",
            "s_parent_id": 18,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/d7a8c7dcbae581fbb18249234aa24e5e.jpeg"
          },
          {
            "s_cid": 63,
            "s_c_name": "打底衫",
            "s_parent_id": 18,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/5a1552cd2dc3f644f460e0f6b0ae0888.jpeg"
          },
          {
            "s_cid": 71,
            "s_c_name": "半身裙",
            "s_parent_id": 18,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/1ca42386311aa58ac8d67badc35b3488.jpeg"
          }
        ]
      },
      {
        "cid": 19,
        "c_name": " 男装",
        "parent_id": 0,
        "level": 1,
        "logo": "upload/goods/category_logo/",
        "data": [
          {
            "s_cid": 64,
            "s_c_name": "男士外套",
            "s_parent_id": 19,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/57a95d6033aea638ca6893206a29bcc0.jpeg"
          },
          {
            "s_cid": 65,
            "s_c_name": "风衣",
            "s_parent_id": 19,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/cb087654d6abf90738698a8170ec038e.jpeg"
          },
          {
            "s_cid": 66,
            "s_c_name": "西服",
            "s_parent_id": 19,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/f9f3e636fb30f4c70f83bbe00c52e273.jpeg"
          },
          {
            "s_cid": 67,
            "s_c_name": "卫衣",
            "s_parent_id": 19,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/2155bd4c65544b04b275209a7bfcb503.jpeg"
          },
          {
            "s_cid": 68,
            "s_c_name": "针织衫",
            "s_parent_id": 19,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/a7a6ed649386b666ab5f6387199352da.jpeg"
          },
          {
            "s_cid": 69,
            "s_c_name": "毛衣",
            "s_parent_id": 19,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/e5d106747a80b1f1b0da54408edb257f.jpeg"
          },
          {
            "s_cid": 70,
            "s_c_name": "衬衫",
            "s_parent_id": 19,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/ed7763966246fe0071ed66722eede489.jpeg"
          },
          {
            "s_cid": 72,
            "s_c_name": "T恤",
            "s_parent_id": 19,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/8a988de43f8d78bc54329046874cb39c.png"
          },
          {
            "s_cid": 73,
            "s_c_name": "牛仔裤",
            "s_parent_id": 19,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/ba63663bfaadc23565d61a67d50d1189.jpeg"
          },
          {
            "s_cid": 74,
            "s_c_name": "休闲裤",
            "s_parent_id": 19,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/ace86fe561b7cabb26c8b59432ed58b4.jpeg"
          },
          {
            "s_cid": 75,
            "s_c_name": "polo衫",
            "s_parent_id": 19,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/ccde9bd55e198563b2dc481c4a1fe29b.jpeg"
          },
          {
            "s_cid": 76,
            "s_c_name": "男士短裤",
            "s_parent_id": 19,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/35265fb2f8e690d8e4fd186ec6169c31.jpeg"
          }
        ]
      },
      {
        "cid": 20,
        "c_name": "套装",
        "parent_id": 0,
        "level": 1,
        "logo": "upload/goods/category_logo/",
        "data": [
          {
            "s_cid": 77,
            "s_c_name": "情侣装",
            "s_parent_id": 20,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/a44e761e7dd752bca6f86fba626bf958.jpeg"
          },
          {
            "s_cid": 78,
            "s_c_name": "运动套装",
            "s_parent_id": 20,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/c496f8ad1d5d613a4dbc31e38c8197bd.jpeg"
          },
          {
            "s_cid": 79,
            "s_c_name": "男士套装",
            "s_parent_id": 20,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/bc13814246fc82b4e10017e55bbdb547.jpeg"
          },
          {
            "s_cid": 80,
            "s_c_name": "女士套装",
            "s_parent_id": 20,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/1004156e5e8c1d6ef1a289b37626ef40.jpeg"
          },
          {
            "s_cid": 81,
            "s_c_name": "亲子装",
            "s_parent_id": 20,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/cd7c75b8445bd8a6188fe5672391f4f3.jpeg"
          },
          {
            "s_cid": 82,
            "s_c_name": "儿童套装",
            "s_parent_id": 20,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/14e609295dab28af399eb066d599f8a4.jpeg"
          }
        ]
      },
      {
        "cid": 21,
        "c_name": "家居",
        "parent_id": 0,
        "level": 1,
        "logo": "upload/goods/category_logo/",
        "data": [
          {
            "s_cid": 133,
            "s_c_name": "厨具",
            "s_parent_id": 21,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/28256a1db430e27225246f2ecd78d980.jpeg"
          },
          {
            "s_cid": 136,
            "s_c_name": "家纺",
            "s_parent_id": 21,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/9dcc12a70f05c5636a620fb5ab0ee44e.jpeg"
          },
          {
            "s_cid": 139,
            "s_c_name": "家具",
            "s_parent_id": 21,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/21cbf9dae360f392ca59e2b23f1e12db.jpeg"
          },
          {
            "s_cid": 142,
            "s_c_name": "灯具",
            "s_parent_id": 21,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/b83f1c619c6220c9bbf24d830f5220b5.jpeg"
          },
          {
            "s_cid": 146,
            "s_c_name": "厨房卫浴",
            "s_parent_id": 21,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/e4df9a4424b668eb7693b633f484c625.jpeg"
          },
          {
            "s_cid": 165,
            "s_c_name": "家装软饰",
            "s_parent_id": 21,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/aa97b5b40bba348fc960601c894c8c0a.jpeg"
          },
          {
            "s_cid": 166,
            "s_c_name": "家装主材",
            "s_parent_id": 21,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/86c7a5f3782b523ab4c60d6e6e0bca87.jpeg"
          },
          {
            "s_cid": 167,
            "s_c_name": "五金电工",
            "s_parent_id": 21,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/0168df811cfd627333247152a70250f1.jpeg"
          },
          {
            "s_cid": 168,
            "s_c_name": "生活用品",
            "s_parent_id": 21,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/eb7a6167526bd7deca7320e5031d5a9d.jpeg"
          },
          {
            "s_cid": 169,
            "s_c_name": "工艺品",
            "s_parent_id": 21,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/309de88ace72c351aa5438e8a6d42c53.jpeg"
          }
        ]
      },
      {
        "cid": 22,
        "c_name": " 童装",
        "parent_id": 0,
        "level": 1,
        "logo": "upload/goods/category_logo/",
        "data": [
          {
            "s_cid": 83,
            "s_c_name": "男童",
            "s_parent_id": 22,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/6f2e5a39517eccace5e2107d9858675d.jpeg"
          },
          {
            "s_cid": 84,
            "s_c_name": "女童",
            "s_parent_id": 22,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/5070e1fd136c46903fab73d06d0fdeaf.jpeg"
          },
          {
            "s_cid": 85,
            "s_c_name": "童袜",
            "s_parent_id": 22,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/d1ba237b5a1693b380002f17561d3b21.jpeg"
          }
        ]
      },
      {
        "cid": 23,
        "c_name": "内衣",
        "parent_id": 0,
        "level": 1,
        "logo": "upload/goods/category_logo/",
        "data": [
          {
            "s_cid": 86,
            "s_c_name": "男士内裤",
            "s_parent_id": 23,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/f128b7bb19c98e8fa396c6520ab5588e.jpeg"
          },
          {
            "s_cid": 87,
            "s_c_name": "女士内裤",
            "s_parent_id": 23,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/a6839eca1cc23ef0a182fae8bb709e16.jpeg"
          },
          {
            "s_cid": 88,
            "s_c_name": "吊带",
            "s_parent_id": 23,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/db7f184231b0b98b0b39502d9e59a423.jpeg"
          },
          {
            "s_cid": 89,
            "s_c_name": "背心",
            "s_parent_id": 23,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/515e6ad21fdd57ec1c207447af3340a6.jpeg"
          },
          {
            "s_cid": 91,
            "s_c_name": "文胸",
            "s_parent_id": 23,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/b3a3e6345caac3501ee6e86a547072e8.jpeg"
          },
          {
            "s_cid": 93,
            "s_c_name": "睡衣",
            "s_parent_id": 23,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/71dd6a45a40eb0a97780318bc7b07470.jpeg"
          },
          {
            "s_cid": 98,
            "s_c_name": "女袜",
            "s_parent_id": 23,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/c20101af621c9da1a3c0081fd877a717.jpeg"
          }
        ]
      },
      {
        "cid": 24,
        "c_name": "配饰",
        "parent_id": 0,
        "level": 1,
        "logo": "upload/goods/category_logo/",
        "data": [
          {
            "s_cid": 104,
            "s_c_name": "皮带",
            "s_parent_id": 24,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/f6fb3a4fc06be471488e6e3f0d705a25.jpeg"
          },
          {
            "s_cid": 112,
            "s_c_name": "围巾",
            "s_parent_id": 24,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/3ddf47d6315dd707f13c887c2a95fdff.jpeg"
          },
          {
            "s_cid": 117,
            "s_c_name": "耳环",
            "s_parent_id": 24,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/0d62604e8d1c5613b17a58f42210d653.jpeg"
          },
          {
            "s_cid": 118,
            "s_c_name": "戒指",
            "s_parent_id": 24,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/136037ca7e8cd68c6719a1a1d46c7399.jpeg"
          },
          {
            "s_cid": 120,
            "s_c_name": "项链",
            "s_parent_id": 24,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/3503c26a4cc3930f2e89320786957515.jpeg"
          },
          {
            "s_cid": 122,
            "s_c_name": "手链",
            "s_parent_id": 24,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/e0aa455181ba833d5292fb5904cf7b32.jpeg"
          },
          {
            "s_cid": 125,
            "s_c_name": "帽子",
            "s_parent_id": 24,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/f1c66896f37a3466c38027aa761a6dea.jpeg"
          }
        ]
      },
      {
        "cid": 25,
        "c_name": "腕表眼镜",
        "parent_id": 0,
        "level": 1,
        "logo": "upload/goods/category_logo/",
        "data": [
          {
            "s_cid": 177,
            "s_c_name": "眼镜",
            "s_parent_id": 25,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/924f52d5550a879093c3aa08258cd9f8.jpeg"
          }
        ]
      },
      {
        "cid": 26,
        "c_name": "母婴",
        "parent_id": 0,
        "level": 1,
        "logo": "upload/goods/category_logo/",
        "data": [
          {
            "s_cid": 178,
            "s_c_name": "产后护理",
            "s_parent_id": 26,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/77694479812a0a5c2732114e90cfcebf.jpeg"
          },
          {
            "s_cid": 179,
            "s_c_name": "妈咪护理",
            "s_parent_id": 26,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/13c4c40b541fb9405f1108a2a94c9203.jpeg"
          },
          {
            "s_cid": 180,
            "s_c_name": "奶粉",
            "s_parent_id": 26,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/4a3cc75e084ad31d99164d56ad2a59c4.jpeg"
          },
          {
            "s_cid": 181,
            "s_c_name": "婴儿哺乳",
            "s_parent_id": 26,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/6cdde2b6ce3a48c38581b0d870f0bab0.jpeg"
          },
          {
            "s_cid": 182,
            "s_c_name": "婴儿服饰",
            "s_parent_id": 26,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/d40465cbf8949867af20de88a3c2af25.jpeg"
          },
          {
            "s_cid": 183,
            "s_c_name": "婴儿起居",
            "s_parent_id": 26,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/a86f886192d5421e25651644d7c83437.jpeg"
          },
          {
            "s_cid": 184,
            "s_c_name": "婴儿洗护",
            "s_parent_id": 26,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/e1543b7b7dc3c2773cbc67812696436a.jpeg"
          },
          {
            "s_cid": 185,
            "s_c_name": "智力开发",
            "s_parent_id": 26,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/50a1442e235df37916e9f996407d7b11.jpeg"
          }
        ]
      },
      {
        "cid": 27,
        "c_name": "食品",
        "parent_id": 0,
        "level": 1,
        "logo": "upload/goods/category_logo/",
        "data": [
          {
            "s_cid": 188,
            "s_c_name": "休闲食品",
            "s_parent_id": 27,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/97639666034c0dae6bcce79332ee82e7.jpeg"
          },
          {
            "s_cid": 189,
            "s_c_name": "进口食品",
            "s_parent_id": 27,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/512fd3488f8ecc5bb1708bbd60df9535.jpeg"
          },
          {
            "s_cid": 190,
            "s_c_name": "地方特产",
            "s_parent_id": 27,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/fe45ae691848a1e051bc9da2496a8700.jpeg"
          },
          {
            "s_cid": 191,
            "s_c_name": "茗茶",
            "s_parent_id": 27,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/87e2da3e47beb452206cc878c06cb595.jpeg"
          },
          {
            "s_cid": 192,
            "s_c_name": "粮油速食",
            "s_parent_id": 27,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/f5b355631f3bfa131a73236d24e2495e.jpeg"
          },
          {
            "s_cid": 195,
            "s_c_name": "保健食品",
            "s_parent_id": 27,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/8acadad6672fb8f146b4633101c5bf24.jpeg"
          }
        ]
      },
      {
        "cid": 28,
        "c_name": "汽车用品",
        "parent_id": 0,
        "level": 1,
        "logo": "upload/goods/category_logo/",
        "data": [
          {
            "s_cid": 193,
            "s_c_name": "汽车装饰",
            "s_parent_id": 28,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/bc9e6bf7df11cf8e0bbed71c4b004e6f.jpeg"
          },
          {
            "s_cid": 196,
            "s_c_name": "车载电器",
            "s_parent_id": 28,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/4b483304c02438a15cef2a3c680c8f84.jpeg"
          },
          {
            "s_cid": 197,
            "s_c_name": "维修保养",
            "s_parent_id": 28,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/c8240b15752857bd19fca001583f76bf.jpeg"
          },
          {
            "s_cid": 198,
            "s_c_name": "车载配件",
            "s_parent_id": 28,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/702279a39d5f5954eb6cf0ae86933c54.jpeg"
          }
        ]
      },
      {
        "cid": 29,
        "c_name": "文具办公",
        "parent_id": 0,
        "level": 1,
        "logo": "upload/goods/category_logo/",
        "data": [
          {
            "s_cid": 201,
            "s_c_name": "学生文具",
            "s_parent_id": 29,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/5b9440c119a689f9417c3b7a0e305ab8.jpeg"
          },
          {
            "s_cid": 203,
            "s_c_name": "书写工具",
            "s_parent_id": 29,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/563c4439914f438818ee24ad7204821d.jpeg"
          },
          {
            "s_cid": 206,
            "s_c_name": "文件管理",
            "s_parent_id": 29,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/a52cc87de1d0186be5a21982f4d410ea.jpeg"
          },
          {
            "s_cid": 207,
            "s_c_name": "办公设备",
            "s_parent_id": 29,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/4434168013bf9b8cd7bd7380adcd66c8.jpeg"
          },
          {
            "s_cid": 208,
            "s_c_name": "办公用纸",
            "s_parent_id": 29,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/3bfb2db1d4033bf5dbb66581dd055fa6.jpeg"
          },
          {
            "s_cid": 209,
            "s_c_name": "打印耗材",
            "s_parent_id": 29,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/03dad3a717c971433bb901aeb162e2f8.jpeg"
          },
          {
            "s_cid": 210,
            "s_c_name": "体育用品",
            "s_parent_id": 29,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/a6c8129137b93ad88b7d1fd23d5fdd45.jpeg"
          }
        ]
      },
      {
        "cid": 30,
        "c_name": "健身器材",
        "parent_id": 0,
        "level": 1,
        "logo": "upload/goods/category_logo/",
        "data": [
          {
            "s_cid": 200,
            "s_c_name": "按摩仪",
            "s_parent_id": 30,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/933189bdae2e1aac51c7e1a377f069f3.jpeg"
          },
          {
            "s_cid": 202,
            "s_c_name": "健腹器",
            "s_parent_id": 30,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/4e1c41c8b3a648bc1fc6383f931b1dd9.jpeg"
          },
          {
            "s_cid": 204,
            "s_c_name": "跑步机",
            "s_parent_id": 30,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/69aa2c9023fcb864951c65e00ad283f4.jpeg"
          },
          {
            "s_cid": 205,
            "s_c_name": "踏步机",
            "s_parent_id": 30,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/ca153d37fc73be57b894b595136c488c.jpeg"
          }
        ]
      },
      {
        "cid": 31,
        "c_name": " 生鲜",
        "parent_id": 0,
        "level": 1,
        "logo": "upload/goods/category_logo/",
        "data": [
          {
            "s_cid": 194,
            "s_c_name": "水果",
            "s_parent_id": 31,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/1f890835a1e6f0c869d74e8b91cd8df1.jpeg"
          },
          {
            "s_cid": 199,
            "s_c_name": "蔬菜",
            "s_parent_id": 31,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/d3947c22375a86cd9107245a3b240e26.jpeg"
          }
        ]
      },
      {
        "cid": 32,
        "c_name": "宠物用品",
        "parent_id": 0,
        "level": 1,
        "logo": "upload/goods/category_logo/",
        "data": [
          {
            "s_cid": 187,
            "s_c_name": "宠物日用品",
            "s_parent_id": 32,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/f5690a2e5f45991fe8d51042a30c4522.jpeg"
          }
        ]
      },
      {
        "cid": 33,
        "c_name": "工艺饰品",
        "parent_id": 0,
        "level": 1,
        "logo": "upload/goods/category_logo/",
        "data": [
          {
            "s_cid": 186,
            "s_c_name": "摆件",
            "s_parent_id": 33,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/cc6ff4b9d4c58633f2feb356b074fa72.jpeg"
          }
        ]
      },
      {
        "cid": 234,
        "c_name": "类目名称",
        "parent_id": 0,
        "level": 1,
        "logo": "upload/goods/category_logo/",
        "data": []
      },
      {
        "cid": 236,
        "c_name": "测试类目三",
        "parent_id": 0,
        "level": 1,
        "logo": "upload/goods/category_logo/",
        "data": [
          {
            "s_cid": 239,
            "s_c_name": "测试类目二test2",
            "s_parent_id": 236,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/"
          },
          {
            "s_cid": 240,
            "s_c_name": "测试类目二test3",
            "s_parent_id": 236,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/528fa3b65168481a304bf2516f517166.jpeg"
          }
        ]
      },
      {
        "cid": 238,
        "c_name": "测试类目四",
        "parent_id": 0,
        "level": 1,
        "logo": "upload/goods/category_logo/",
        "data": []
      },
      {
        "cid": 216,
        "c_name": "test",
        "parent_id": 0,
        "level": 1,
        "logo": "upload/goods/category_logo/",
        "data": [
          {
            "s_cid": 217,
            "s_c_name": "test1",
            "s_parent_id": 216,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/a4ee1fb619a5be232a9c5080b1508a30.png"
          }
        ]
      },
      {
        "cid": 235,
        "c_name": "测试类目二",
        "parent_id": 0,
        "level": 1,
        "logo": "upload/goods/category_logo/",
        "data": [
          {
            "s_cid": 237,
            "s_c_name": "测试类目二-test1",
            "s_parent_id": 235,
            "s_level": 2,
            "s_logo": "upload/goods/category_logo/1/69a972fe13250e59025b93ae85dc838d.jpeg"
          }
        ]
      }
    ],
    goodsList: [
      {
        id: 10539,
        business_id: 5,
        goodsName: "A.by BOM 超能婴儿 基因再生桃花美颜面膜 5片",
        goods_desc: "",
        imgs_url: "upload/goods/imgs/16/dd971fce22d24d8a3cb6bf9e79582b98.jpeg",
        image: "https://img.duishangbao.cn/upload/goods/list/5/468c791a07f5afaa68f8f4ec6b3c7aee.jpeg",
        price: "6400",
        backGold: 6,
        business_name: "成都家仆科技有限公司"
      },
      {
        id: 10544,
        business_id: 5,
        goodsName: "SHANGPREE 香蒲丽海洋水光眼膜贴60片",
        goods_desc: "",
        imgs_url: "upload/goods/imgs/16/7660344e4cd34c0a7b5cf283eef46299.jpeg",
        image: "https://img.duishangbao.cn/upload/goods/list/5/9195163ce01bd3a2cf1800ab45f05b3d.jpeg",
        price: "11300",
        backGold: 11,
        business_name: "成都家仆科技有限公司"
      },
      {
        id: 10555,
        business_id: 5,
        goodsName: "韩国A. by Bom超能婴儿神仙叶植物补水面膜紫色补水舒缓",
        goods_desc: "",
        imgs_url: "upload/goods/imgs/16/8a696f647a6d8a8468ab6d7eed5201f9.jpeg",
        image: "https://img.duishangbao.cn/upload/goods/list/5/dd8e2f16eaeadea137ef124a5e4d34b0.jpeg",
        price: "5000",
        backGold: 5,
        business_name: "成都家仆科技有限公司"
      },
      {
        id: 10559,
        business_id: 5,
        goodsName: "韩国AHC面膜玻尿酸精华液B5透明质酸面膜红色淡斑第三代 5片",
        goods_desc: "",
        imgs_url: "upload/goods/imgs/16/ebe9216850c2f67aef350a06f1ddde24.jpeg",
        image: "https://img.duishangbao.cn/upload/goods/list/5/0a9fdf0416fc17bde89a2d352618d2d4.jpeg",
        price: "9600",
        backGold: 10,
        business_name: "成都家仆科技有限公司"
      },
      {
        id: 10633,
        business_id: 5,
        goodsName: "泰国UAU蚕丝面膜黑白10片装细腻滋润超薄祛痘印35g*10",
        goods_desc: "",
        imgs_url: "upload/goods/imgs/16/c2b4d02ea2fa68a4b5c76f75587ef7d4.jpeg",
        image: "https://img.duishangbao.cn/upload/goods/list/5/b68cfcc76d46c8a54f7b71ba86ee0e0d.jpeg",
        price: "53900",
        backGold: 0,
        business_name: "成都家仆科技有限公司"
      },
      {
        id: 10846,
        business_id: 199,
        goodsName: "AHC眼霜 保湿抗皱改善眼袋黑眼膜 5片装",
        goods_desc: "",
        imgs_url: "upload/goods/imgs/16/c5367a6d3132867dc851770e49e3eba9.jpeg",
        image: "https://img.duishangbao.cn/upload/goods/list/5/a48557fbc202201fa8e961c094320fe5.jpeg",
        price: "6800",
        backGold: 7,
        business_name: "深圳市南山区靓肤宝化妆品商行"
      },
      {
        id: 10922,
        business_id: 199,
        goodsName: "JM solution 珍珠面膜+防晒喷雾防晒霜SPF50+套装",
        goods_desc: "",
        imgs_url: "upload/goods/imgs/16/4e5ace4d0a61fbe5190a63f1bc2e2770.jpeg",
        image: "https://img.duishangbao.cn/upload/goods/list/5/7f180ad14ab4d20635af41b92bd79e4e.jpeg",
        price: "15000",
        backGold: 15,
        business_name: "深圳市南山区靓肤宝化妆品商行"
      },
      {
        id: 10956,
        business_id: 199,
        goodsName: "JM solution防晒喷雾SPF50++韩国JM水光蜂蜜面膜贴蜂胶水润滋养透莹清透面膜",
        goods_desc: "",
        imgs_url: "upload/goods/imgs/16/e73068486438168e182d3ee3bac86e4f.jpeg",
        image: "https://img.duishangbao.cn/upload/goods/list/5/fb93f674760a93a75884e0b0c3ac3827.jpeg",
        price: "14900",
        backGold: 15,
        business_name: "深圳市南山区靓肤宝化妆品商行"
      },
      {
        id: 11087,
        business_id: 199,
        goodsName: "Spa Treatment 超浓密免洗泡沫面膜",
        goods_desc: "",
        imgs_url: "upload/goods/imgs/17/f1ded766b430880004dec53aedde3ac4.jpeg",
        image: "https://img.duishangbao.cn/upload/goods/list/5/fdbd88697a117f6d7c362e520eb9ef7b.jpeg",
        price: "37700",
        backGold: 39,
        business_name: "深圳市南山区靓肤宝化妆品商行"
      },
      {
        id: 11141,
        business_id: 198,
        goodsName: "科颜氏高保湿面膜",
        goods_desc: "",
        imgs_url: "upload/goods/imgs/17/7feb1f8e634885f09f0513dfd5f234b0.jpeg",
        image: "https://img.duishangbao.cn/upload/goods/list/5/8ef2bfc5ac56d6cbea1a8bcf093381dd.jpeg",
        price: "22700",
        backGold: 23,
        business_name: "广州杨森科技生物有限公司"
      },
      {
        id: 11164,
        business_id: 198,
        goodsName: "A.by bom超能婴儿神仙叶人参植物面膜 人参精华粉色",
        goods_desc: "",
        imgs_url: "upload/goods/imgs/17/9bcd360b3babda63d214155d4f014904.jpeg",
        image: "https://img.duishangbao.cn/upload/goods/list/5/20916066d135feb0a1121315c407ba8f.jpeg",
        price: "4300",
        backGold: 4,
        business_name: "广州杨森科技生物有限公司"
      },
      {
        id: 11169,
        business_id: 198,
        goodsName: "A.by bom超能婴儿神仙叶人参植物面膜 植物补水紫色",
        goods_desc: "",
        imgs_url: "upload/goods/imgs/17/85658922aa85090fd17a602989ff42e0.jpeg",
        image: "https://img.duishangbao.cn/upload/goods/list/5/979c50368b28d2a761d9cc190899fd8e.jpeg",
        price: "4300",
        backGold: 4,
        business_name: "广州杨森科技生物有限公司"
      }
    ],
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
    nearbyList: [
      {
        "name": "红四门秘制老火锅（高升桥店）",
        "expense_avg": "58",
        "address": "武侯区高升桥路24号附16号",
        "s": 0,
        "desc_info": [
          "精选好店"
        ],
        "logo": "https://img.duishangbao.cn/upload/business/logo/2/8af7b9a06eff4f6e3942df1221bae25e.jpeg",
        "business_offline_id": 1974
      },
      {
        "name": "重庆小龙坎",
        "expense_avg": "60",
        "address": "武侯区广福桥路721号",
        "s": 0.1,
        "desc_info": [
          "精选好店"
        ],
        "logo": "https://img.duishangbao.cn/upload/business/logo/2/2bf4593d9bb6c2fbbae44e1b3c26da34.jpeg",
        "business_offline_id": 1431
      },
      {
        "name": "御茶（广福桥店）",
        "expense_avg": "11",
        "address": "成都市武侯区广福桥街-30号附13号",
        "s": 0.2,
        "desc_info": [
          "精选好店"
        ],
        "logo": "https://img.duishangbao.cn/upload/business/logo/2/73e9b50e247aa2592a6bb866d6145f79.jpeg",
        "business_offline_id": 2142
      },
      {
        "name": "川西坝子红码头（双楠店）",
        "expense_avg": "80",
        "address": "武侯区高升桥路26号",
        "s": 0.3,
        "desc_info": [
          "精选好店"
        ],
        "logo": "https://img.duishangbao.cn/upload/business/logo/2/022b1bc4c6c61a4d070ff3eec1c5fd2a.jpeg",
        "business_offline_id": 2211
      },
      {
        "name": "拈一筷子",
        "expense_avg": "80",
        "address": "成都市武侯区拈一筷子(碧云路店)",
        "s": 0.4,
        "desc_info": [
          "精选好店"
        ],
        "logo": "https://img.duishangbao.cn/upload/business/logo/2/4c3ed9f0b44f13536f53532b879c8a0d.jpeg",
        "business_offline_id": 1462
      },
      {
        "name": "家宴山珍菌汤馆",
        "expense_avg": "20",
        "address": "成都市武侯区家宴山珍",
        "s": 0.5,
        "desc_info": [
          "精选好店"
        ],
        "logo": "https://img.duishangbao.cn/upload/business/logo/2/75ae234fe710923a51aea478b88bb3ea.jpeg",
        "business_offline_id": 2023
      },
      {
        "name": "龍堂肴老火锅（高升桥店）",
        "expense_avg": "68",
        "address": "武侯区广福桥西街1号附53号",
        "s": 0.5,
        "desc_info": [
          "精选好店"
        ],
        "logo": "https://img.duishangbao.cn/upload/business/logo/2/776d6cfc3d5dfc5bc7fba4efe899c043.jpeg",
        "business_offline_id": 1641
      },
      {
        "name": "ZW祛痘祛斑国际连锁(南门总店）",
        "expense_avg": "66",
        "address": "成都市武侯区痘奇迹祛痘祛斑皮肤管理中心",
        "s": 0.5,
        "desc_info": [
          "精选好店"
        ],
        "logo": "https://img.duishangbao.cn/upload/business/logo/2/a781ed5f0a5fd2291fc9559b96e8105c.jpeg",
        "business_offline_id": 1767
      },
      {
        "name": "御茶（莱蒙都会店）",
        "expense_avg": "11",
        "address": "四川省成都市武侯区二环路南四段51号",
        "s": 0.6,
        "desc_info": [
          "精选好店"
        ],
        "logo": "https://img.duishangbao.cn/upload/business/logo/2/25d4636ba1eafadf91f426e1abd953ac.jpeg",
        "business_offline_id": 2192
      },
      {
        "name": "草屋烧烤(双楠广福店)",
        "expense_avg": "40",
        "address": "武侯区广福桥西街1号附43号丼亦九宫格火锅旁",
        "s": 0.6,
        "desc_info": [
          "精选好店"
        ],
        "logo": "https://img.duishangbao.cn/upload/business/logo/1/d6dbc16d90cd6a6496636c9fa92a7584.jpeg",
        "business_offline_id": 1060
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
    adressList: [
      {
        "receiver_id": 46,
        "receiver_name": "菩提二",
        "receiver_phone": "13691190746",
        "receiver_address": "北京市北京市市辖区角门13号院6-14-101北京市北京市市辖区角门13号院6-14-101",
        "default_a": 1,
        "label": 1,
        "detail_address": "角门13号院6-14-101北京市北京市市辖区角门13号院6-14-101",
        "province_id": 110000,
        "city_id": 110000,
        "county_id": 110100
      },
      {
        "receiver_id": 45,
        "receiver_name": "菩提",
        "receiver_phone": "13681153793",
        "receiver_address": "四川省成都市武侯区大石西路",
        "default_a": 0,
        "label": 1,
        "detail_address": "大石西路",
        "province_id": 510000,
        "city_id": 510100,
        "county_id": 510107
      },
      {
        "receiver_id": 47,
        "receiver_name": "菩提二",
        "receiver_phone": "13691190746",
        "receiver_address": "北京市北京市市辖区角门13号院6-14-101",
        "default_a": 0,
        "label": 1,
        "detail_address": "角门13号院6-14-101",
        "province_id": 110000,
        "city_id": 110000,
        "county_id": 110100
      },
      {
        "receiver_id": 48,
        "receiver_name": "菩提二",
        "receiver_phone": "13691190746",
        "receiver_address": "北京市北京市丰台区角门13号院6-14-101",
        "default_a": 0,
        "label": 1,
        "detail_address": "角门13号院6-14-101",
        "province_id": 110000,
        "city_id": 110000,
        "county_id": 110106
      },
      {
        "receiver_id": 49,
        "receiver_name": "菩提三",
        "receiver_phone": "13691190274",
        "receiver_address": "天津市天津市东丽区家和市场南",
        "default_a": 0,
        "label": 3,
        "detail_address": "家和市场南",
        "province_id": 120000,
        "city_id": 120000,
        "county_id": 120110
      },
      {
        "receiver_id": 50,
        "receiver_name": "菩提四",
        "receiver_phone": "13691190275",
        "receiver_address": "天津市天津市东丽区家和市场南123",
        "default_a": 0,
        "label": 3,
        "detail_address": "家和市场南123",
        "province_id": 120000,
        "city_id": 120000,
        "county_id": 120110
      },
      {
        "receiver_id": 51,
        "receiver_name": "菩提五",
        "receiver_phone": "13691190276",
        "receiver_address": "天津市天津市东丽区家和市场南123456",
        "default_a": 0,
        "label": 3,
        "detail_address": "家和市场南123456",
        "province_id": 120000,
        "city_id": 120000,
        "county_id": 120110
      },
      {
        "receiver_id": 52,
        "receiver_name": "菩提六",
        "receiver_phone": "13691190277",
        "receiver_address": "天津市天津市东丽区家和市场南123456789",
        "default_a": 0,
        "label": 3,
        "detail_address": "家和市场南123456789",
        "province_id": 120000,
        "city_id": 120000,
        "county_id": 120110
      },
      {
        "receiver_id": 53,
        "receiver_name": "菩提七",
        "receiver_phone": "13691190278",
        "receiver_address": "天津市天津市东丽区家和市场南1234567890",
        "default_a": 0,
        "label": 3,
        "detail_address": "家和市场南1234567890",
        "province_id": 120000,
        "city_id": 120000,
        "county_id": 120110
      },
      {
        "receiver_id": 54,
        "receiver_name": "菩提八",
        "receiver_phone": "13691190279",
        "receiver_address": "天津市天津市东丽区家和市场南12345678901",
        "default_a": 0,
        "label": 2,
        "detail_address": "家和市场南12345678901",
        "province_id": 120000,
        "city_id": 120000,
        "county_id": 120110
      },
      {
        "receiver_id": 55,
        "receiver_name": "菩提九",
        "receiver_phone": "13691190280",
        "receiver_address": "天津市天津市东丽区家和市场南123456789012",
        "default_a": 0,
        "label": 2,
        "detail_address": "家和市场南123456789012",
        "province_id": 120000,
        "city_id": 120000,
        "county_id": 120110
      },
      {
        "receiver_id": 56,
        "receiver_name": "菩提十",
        "receiver_phone": "13691190280",
        "receiver_address": "天津市天津市东丽区家和市场南123456789012",
        "default_a": 0,
        "label": 2,
        "detail_address": "家和市场南123456789012",
        "province_id": 120000,
        "city_id": 120000,
        "county_id": 120110
      }
    ],
    city: {},
    qqmapsdk: ''
  }
});