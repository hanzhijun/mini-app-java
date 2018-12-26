//index.js
//获取应用实例
const app = getApp();

const RSA = require('../../lib/rsa.js');
const Util = require('../../utils/util.js');

Page({
  data: {
    loading: 0, // loading加载提示框
    loginbox: 0, // 登录弹窗
    toast: 0, // toast提示
    title: '首页', // 标题
    toastTxt: '你真的很不错哟！', // toast文字
    imgUrl: app.globalData.imgUrl,
    imageList: [],
    menuList: [],
    userInfo: {},
    hasUserInfo: false
  },

  onLoad: function () {
    /*        if (app.globalData.userInfo) {
     this.setData({
     userInfo: app.globalData.userInfo,
     hasUserInfo: true
     });
     } else if (this.data.canIUse) {
     // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
     // 所以此处加入 callback 以防止这种情况
     app.userInfoReadyCallback = res => {
     this.setData({
     userInfo: res.userInfo,
     hasUserInfo: true
     });
     }
     } else {
     // 在没有 open-type=getUserInfo 版本的兼容处理
     wx.getUserInfo({
     success: res => {
     app.globalData.userInfo = res.userInfo;
     this.setData({
     userInfo: res.userInfo,
     hasUserInfo: true
     });
     }
     })
     }*/
    this.getData();
    wx.setStorageSync('aesKey', 'rDPrNmQzrXQxBZZ2');
    wx.setStorageSync('unionId', 'ouA1Y0oLXxWH1b7YeU7BPSSHaB70');
    wx.setStorageSync('openId', 'ouA1Y0oLXxWH1b7YeU7BPSSHaB70');
    wx.setStorageSync('sid', '9465a0c0fcfb4fbfb6b2d6af1f2e31de');
    wx.setStorageSync('uid', '516964814301212672');
    wx.setStorageSync('session', 'iHNrt0aOLjX5rCIK+eYkVonwuhYgk2jec7GEYFPHvpN8TV76+BC0V5K7M8d7crqm');
    wx.setStorageSync('session-login', 'd9eb1410f1f744adafa6e8d4b102e271');

    let testSign = app.getSign('ASDFG', '456789')
    console.log(testSign)
  },
  getData() {
    this.setData({
      loading: 1
    });
    let _this = this;
    app.myAjax('post', 'bhs-client-online/showpageConfig/showpageList', {}, (res) => {

      if (res.code == 1) {
        console.info(res.data);
        let {imageList, menuList} = res.data;
        _this.setData({
          imageList,
          menuList
        })
      }

      _this.setData({
        loading: 0
      })
    }, () => {
      _this.setData({
        loading: 0
      })
    })
  },
  /**
   * 用户手动触发登录
   * @param e
   */
  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo;
    app.globalData.hasUserInfo = true;
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    });
    app.toLogin(this);
  },
  /**
   * 登录成功后回执
   * @param res
   */
  userInfoReadyCallback: function (res) {
    console.log('登录后index页回执' + JSON.stringify(res));
  },
  /**
   * 关闭登录弹窗
   */
  loginBoxClose() {
    this.setData({
      loginbox: 0
    });
  },
  /**
   * toast弹窗触发
   */
  showToast() {
    app.showToast(this, '提示语弹窗', 6)
  },
  /**
   * 调试用加密
   */
  jiami() {
    app.getEncryptKey();
    app.getEncryptData('JHGD5DFKJH');
  },
  /**
   * 调试用登录
   */
  toLogin() {
    this.setData({
      loginbox: 1
    })
  },
  /**
   * 跳转类目
   */
  bannerJump() {
    app.openPage('goods/classify/classify')
  },
  /**
   * 跳转搜索
   */
  searchJump() {
    app.openPage('goods/search/search')
  }
});
