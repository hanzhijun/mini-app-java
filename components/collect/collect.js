const app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    imgUrl: app.globalData.imgUrl,
    host: app.globalData.host
  },


  attached: function () {
    let {item,url} = this.data;
/*    app.post('Car/myCollectList', {
      opt: 'goods',
      page: 1
    }, (res) => {
      if(res.code == 200) {
        this.setData({
          item: res.data.list.slice(0, 4)
        })
      }
    })*/
  },

  /**
   * 组件的方法列表
   */
  methods: {
    openPage: function (e) {
      let { gid, type } = e.currentTarget.dataset;
      app.openPage(`goods/goodsdetail/goodsdetail?gid=${gid}&type=${type}`);
    }
  }
});
