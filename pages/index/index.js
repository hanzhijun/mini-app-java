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
    title: '贝划算，开始划算生活', // 标题
    toastTxt: '系统错误，请稍后重试!', // toast文字
    imgUrl: app.globalData.imgUrl,
    isLogin: app.globalData.isLogin,
    gold: null,
    userInfo: null,

    imageList: [], // banner图列表
    menuList: [], // 分类图标列表
    recommendList: [] // 推荐商品列表
  },

  onLoad: function () {
    this.showpageList();
    this.clientListByCodes();
  },
  /**
   * 获取banner、nav列表
   */
  showpageList() {

    this.setData({
      loading: 1
    });
    let _this = this;
    app.myAjax('post', 'bhs-client-online/showpageConfig/showpageList', {}, (res) => {
      if (res.code == 1) {
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
   * 获取商品推荐列表
   */
  clientListByCodes() {
    this.setData({
      loading: 1
    });
    let _this = this;
    app.myAjax('post', 'bhs-client-online/showpageContent/clientListByCodes', {}, (res) => {
      if (res.code == 1) {
        if (!res.data) return;
        let {data} = res;
        let {recommendList} = _this.data;
        for (let i = 0; i < data.length; i++) {
          recommendList.push(data[i])
        }
        _this.setData({
          recommendList
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

    this.setData({
      goodsInfo: '',
      pkList: []
    });
    this.onShow();

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
   * @param res
   */
  userInfoReadyCallback: function (res) {
    console.log('登录后index页回执' + JSON.stringify(res));
  }
});
