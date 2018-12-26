/**
 * @title 订单详情
 * @author han
 * @date 2018-10-29 13:14:00
 */
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: 0, // loading加载提示框
    loginbox: 0, // 登录弹窗
    toast: 0, // toast提示
    title: '订单详情', // 标题
    toastTxt: '系统错误，请稍后重试!', // toast文字
    imgUrl: app.globalData.imgUrl,
    isLogin: app.globalData.isLogin,
    gold: null,
    userInfo: null,

    id: -1,
    freightPrice: {}, // 邮费
    goodsList: [],
    goodsPriceTotalPrice: {}, // 商品总价
    payDetailTotalPrice: {}, // 订单总价
    payPriceTotalPrice: {},
    userOrderAddressResultVos: [], // 收货地址列表
    addrId: null, // 选中的收货地址id
    addrUserName: '菩提', // 收货人
    addrUserTel: '13681153793', // 收货人电话
    addrUserRess: '四川省成都市高新区天府大道仁和小区234号1栋10单元', // 收货详情地址
    ginfo: [],
    useGold: 1, // 是否使用金贝 deduction: this.useGold === 1 ? true : false
    useGoldNum: 0, // 使用金贝数量
    payNum: 0 // 实付金额
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  openPage: function (e) {
    let {id} = e.currentTarget.dataset;
    app.openPage('detail/detail?id=' + id)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
});