const app = getApp();

Page({
  data: {
    loading: 0, // loading加载提示框
    loginbox: 0, // 登录弹窗
    toast: 0, // toast提示
    title: '我的订单', // 标题
    toastTxt: '系统错误，请稍后重试!', // toast文字
    imgUrl: app.globalData.imgUrl,
    isLogin: app.globalData.isLogin,
    gold: null,
    userInfo: null,

    status: 21, // 订单状态: 0待付款，2待发货，3待收货，4已完成，21所有订单，22售后
    orderList: [],
    pageNumber: 1, // 当前页
    pageSize: 15, // 每页条数
    pages: 1, // 页总数
    count: -1 // 总条数

  },

  onLoad: function (options) {
    let {status} = options;
    this.setData({
      status
    });
    this.getOrderList(status);
  },
  // 获取数据
  getOrderList: function () {
    let {pageNumber, status} = this.data;
    let obj = {
      status
    };
    this.setData({
      loading: 1
    });
    let _this = this;
    app.myAjax2('post', 'bhs-client-online/order/list?pageNumber=' + pageNumber, obj, function (res) {
      if (res.data.code * 1 === 1) {
        let {count, pageNumber, pageSize, pages, data} = res.data;
        let {orderList} = _this.data;
        _this.count = res.data.data.count * 1
        _this.pageNumber = res.data.data.pageNumber * 1
        _this.pageSize = res.data.data.pageSize * 1
        _this.pages = res.data.data.pages * 1
        for (let i = 0; i < data.length; i++) {
          orderList.push(data[i])
        }
        _this.setData({
          count,
          pageNumber,
          pageSize,
          pages,
          orderList
        })
      }
      _this.setData({
        loading: 0
      });
    }, function () {
      _this.setData({
        loading: 0
      })
    })
  },
  /**
   * 标签切换
   * @param status
   */
  changeNav (status) {
    if (status === this.status) return
    this.status = status
    this.pageNumber = 1
    this.pageSize = 15
    this.pages = 1
    this.count = 0
    this.orderList = []
    this.getOrderList()
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

    let {nums, page, order_list} = this.data;
    if (Object.keys(order_list).length >= nums) return;
    this.data.page += 1;
    //this.initData();

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

    this.setData({
      order_list: {},
      page: 1,
      order_info: {},
      orders: [],
      ids: [],
      goods_ids: [],
      spec_id: []
    });
    //this.initData();
    wx.stopPullDownRefresh();

  }
});
