// pages/mine/mine.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: 0, // loading加载提示框
    loginbox: 0, // 登录弹窗
    toast: 0, // toast提示
    title: '我的', // 标题
    toastTxt: '系统错误，请稍后重试!', // toast文字
    imgUrl: app.globalData.imgUrl,
    isLogin: app.globalData.isLogin,
    gold: null,
    userInfo: null
  },

  onLoad: function () {
  },

  onShow: function () {
    this.init();
  },

  init: function () {
    console.log('我的初始化');
    if (!wx.getStorageSync('session')) {
      this.setData({
        loginbox: 1,
        isLogin: 0
      })
    } else {
      this.setData({
        loginbox: 0,
        isLogin: 1
      });
      app.getUserCapital(this)
    }
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo
      })
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.init();
    wx.stopPullDownRefresh();
  },
  /**
   * 用户手动触发登录
   * @param e
   */
  getUserInfo: function (e) {
    wx.setStorageSync('userInfo', e.detail.userInfo);
    this.setData({
      userInfo: e.detail.userInfo
    });
    app.toLogin(this);
  },
  /**
   * 登录成功后回执
   */
  userInfoReadyCallback: function () {
    let _this = this;
    setTimeout(function () {
      _this.init()
    }, 600)
  }
});