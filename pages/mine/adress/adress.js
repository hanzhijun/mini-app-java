// pages/mine/adress/adress.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: 0, // loading加载提示框
    loginbox: 0, // 登录弹窗
    toast: 0, // toast提示
    title: '地址列表', // 标题
    toastTxt: '系统错误，请稍后重试!', // toast文字
    imgUrl: app.globalData.imgUrl,
    isLogin: app.globalData.isLogin,
    gold: null,
    userInfo: null,

    adressList: [],
    history_page: '',   // order: 去支付页面跳转过来的，修改地址
    type: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  onShow: function () {
    this.init()
  },
  init: function () {
    this.setData({
      adressList: []
    });
    this.getAdressList()
  },
  /**
   * 获取地址列表
   */
  getAdressList: function () {
    let _this = this;
    app.myAjax2('get', 'bhs-client-online/address', '{}', (res) => {

      if (res.code == 1) {
        _this.setData({
          adressList: res.data,
          loading: 0
        })
      } else {
        _this.setData({
          loading: 0
        })
      }
    }, (res) => {
      _this.setData({
        loading: 0
      })
    })
  },

  addReciver: function () {

    let {history_page} = this.data;
    app.openPage(`mine/adress/addReciver/addReciver?history_page=${history_page}`);

  },

  //  跳转修改
  updateAdress: function (e) {

    var {id, data} = e.currentTarget.dataset;
    // var updateData = tempData[uid];
    wx.setStorageSync('updateReciver', data);
    console.log(JSON.stringify(data));
    app.openPage('mine/adress/addReciver/addReciver?uid=' + id);

  },

  dele: function (e) {

    let _this = this;
    let {id} = e.currentTarget.dataset;
    app.myAjax2('delete', 'bhs-client-online/address/' + id, '{}', (res) => {

      if (res.code == 1) {
        _this.setData({
          loading: 0
        });
        let {adressList, newAdressList = []} = _this.data;
        for (let i = 0; i < adressList.length; i++) {
          if (adressList[i].id != id) {
            newAdressList.push(adressList[i])
          }
        }
        _this.setData({
          adressList: newAdressList
        });
        app.showToast(_this, '删除成功');
      } else {
        _this.setData({
          loading: 0
        })
      }
    }, (res) => {
      _this.setData({
        loading: 0
      })
    })

  }

});