/**
 * @title 商品搜索
 * @author han
 * @date 2018-12-9 15:18:00
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
    title: '商品搜索', // 标题
    toastTxt: '系统错误，请稍后重试!', // toast文字
    imgUrl: app.globalData.imgUrl,
    isLogin: app.globalData.isLogin,
    gold: null,
    userInfo: null,

    word: '', // 搜索关键字
    searchLong: -1, // 搜索记录条数
    searchList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  onShow () {
    if (wx.getStorageSync('searchWord') == '') return;
    let searchList = JSON.parse(wx.getStorageSync('searchWord'));
    this.setData({
      searchList
    });
    this.checkSearch()
  },
  openPage: function (e) {
    let {id} = e.currentTarget.dataset;
    app.openPage('goods/goodsdetail/goodsdetail?gid=' + id)
  },

  checkSearch () {
    let {searchList} = this.data;
    this.setData({
      searchLong: searchList.length
    })
  },
  toSearchOld (e) {
    let {word} = e.currentTarget.dataset;
    this.setData({
      word
    });
    this.toSearch()
  },
  changeWord(e) {
    this.setData({
      word: e.detail.value
    })
  },
  /**
   * 执行搜索
   */
  toSearch () {
    let {word} = this.data;
    if (!word) {
      app.showToast(this, '请输入搜索的商品关键字')
    } else {
      app.addSearchWord(word);
      app.openPage('goods/goodslist/goodslist?word=' + word)
    }
  },
  /**
   * 删除搜索记录
   * @param e
   */
  delSearch (e) {
    let {word} = e.currentTarget.dataset;
    // let arr = JSON.parse(wx.getStorageSync('searchWord'));
    if (!word) {
      this.setData({
        searchList: []
      });
      this.checkSearch();
      wx.setStorageSync('searchWord', '')
    } else {
      let {searchList} = this.data;
      let index = searchList.indexOf(word);
      searchList.splice(index, 1);
      this.setData({
        searchList
      });
      this.checkSearch();
      wx.setStorageSync('searchWord', JSON.stringify(searchList))
    }
  }

});