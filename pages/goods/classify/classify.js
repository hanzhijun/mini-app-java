/**
 * @title 商品分类
 * @author han
 * @date 2018-11-09 16:18:00
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
    title: '商品类目', // 标题
    toastTxt: '系统错误，请稍后重试!', // toast文字
    imgUrl: app.globalData.imgUrl,
    isLogin: app.globalData.isLogin,
    gold: null,
    userInfo: null,

    cid: null, // 一级类目id
    scrollTop: 0, // 一级类目区滚动条位置
    list: [] // 类目数据

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    let {cid} = options;
    if (cid) {
      this.setData({
        cid
      })
    }
    this.getList()
  },

  /**
   * 获取商品类目数据
   */
  getList: function () {
    this.setData({
      loading: 1
    });
    let _this = this;
    app.myAjax('get', 'bhs-client-online/showpageCategory/categoryList', '{}', (res) => {
      if (res.code == 1) {
        this.setData({
          list: res.data,
          loading: 0
        });
        // 假如url未传cid, 默认展示第一条一级类目
        let {cid, list} = _this.data;
        if (!cid) {
          _this.setData({
            cid: list[0].id
          })
        }
      } else {
        this.setData({
          loading: 0
        })
      }
    }, (res) => {
      this.setData({
        loading: 0
      })
    });
    this.navMoveTo();
  },
  /**
   * 一级类目，滚动至可视位置
   */
  navMoveTo: function () {
    let {cid, list, scrollTop} = this.data;
    for (let i = 1; i < list.length; i++) {
      if (list[i].cid == cid) {
        scrollTop = i * 50
      }
    }
    this.setData({
      scrollTop
    })
  },
  /**
   * 切换一级类目listClick
   */
  changeNav: function (e) {
    let {cid} = e.currentTarget.dataset;
    this.setData({
      cid
    })
  },
  /**
   *  跳转商品列表页
   * @param e
   */
  listClick: function (e) {
    let {sid, sname} = e.currentTarget.dataset;
    app.openPage(`goods/goodslist/goodslist?sid=${sid}&sname=${sname}`)
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