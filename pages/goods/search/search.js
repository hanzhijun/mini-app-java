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
    toastTxt: '你真的很不错哟！', // toast文字
    imgUrl: app.globalData.imgUrl,

    title: '商品搜索',
    word: '', // 搜索关键字
    searchLong: -1, // 搜索记录条数
    searchList: [{
      id: 123,
      text: '哈根达斯'
    }, {
      id: 124,
      text: '圆圆美梦成真'
    }, {
      id: 125,
      text: '遍历在加'
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
      app.openPage('goods/goodslist/goodslist?word=' + word)
    }
  },
  /**
   * 删除搜索记录
   * @param e
   */
  delSearch (e) {
    let {id} = e.currentTarget.dataset;
    if (!id) {
      console.log('搜索历史全部删除成功')
      this.setData({
        searchList: []
      });
      this.checkSearch()
    } else {
      console.log('搜索单条记录')
      let {searchList} = this.data
      let newData = []
      for (let i = 0; i < searchList.length; i++) {
        if (searchList[i].id !== id) {
          newData.push(searchList[i])
        }
      }
      this.setData({
        searchList: newData
      });
      this.checkSearch()
    }
  }

});