/**
 * @title 附近
 * @author han
 * @date 2018-11-10 12:37:00
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
    title: '附近', // 标题
    toastTxt: '系统错误，请稍后重试!', // toast文字
    imgUrl: app.globalData.imgUrl,
    isLogin: app.globalData.isLogin,
    gold: null,
    userInfo: null,

    address: '',
    lat: '',
    lng: '',
    bannerList: app.data.nearbyBannerList,
    navList: app.data.nearbyNavList,
    list: [],

    pageNumber: 1, // 当前页
    pageSize: 15, // 每页记录条数
    pages: 1, // 总页数
    count: 0 // 总记录条数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getAddress()
  },

  /**
   * 获取地理位置
   */
  getAddress: function () {

    var _this = this;
    app.getaddress((res) => {
      let address_json = res.address_component;
      let lat = res.location.lat;
      let lng = res.location.lng;
      _this.setData({
        address: `${address_json.city}${address_json.district}`,
        lat,
        lng
      });
      _this.getList()
    })

  },

  /**
   * 获取商品类目数据
   */
  getList: function () {
    let {lat, lng} = this.data;
    this.setData({
      loading: 1
    });
    let _this = this;
    app.myAjax('get', 'bhs-client-online/business/offline/near?latitude=' + lat + '&longitude=' + lng, '{}', function (res) {
      if (res.code * 1 === 1) {
        let {list} = _this.data;
        let {data, pageNumber, pages, count} = res.data;
        for (let i = 0; i < data.length; i++) {
          let obj = data[i];
          obj.distance = Math.round(obj.distance * 10)/10;
          list.push(obj)
        }
        _this.setData({
          list,
          pageNumber: pageNumber * 1,
          pages: pages * 1,
          count: count * 1
        })
      }
      _this.setData({
        loading: 0
      })
    })

  },
  /**
   * 跳转商家详情
   */
  openPageTo: function (e) {
    let {id} = e.currentTarget.dataset;
    app.openPage('business/businesshome/businesshome?id=' + id)
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let {pageNumber, pages} = this.data;
    if (pageNumber >= pages) return;
    this.getList()
  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // console.log('点击页面内部按钮触发')
    }
    return {
      title: '贝划算，开始划算生活!',
      path: '',
      imageUrl: '',
      success: function () {
        // 目前版本小程序已经获取不到回执
        console.log('分享成功')
      },
      fail: function () {
        // 目前版本小程序已经获取不到回执
        console.log('分享失败')
      }
    }
  }

});