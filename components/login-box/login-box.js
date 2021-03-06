
let app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    hidden: 'hidden'
  },

  attached: function() {
    let _this = this;
    if (!wx.getStorageSync('session')) {
      _this.setData({
        hidden: false
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    close: function() {
      this.setData({
        hidden: 'hidden'
      })
    },

    getUserInfo: function (e) {
      let _this = this;
      app.getUserInfo((data) => {
        _this.triggerEvent('loginevent', 1);
      },(err) => {
        _this.triggerEvent('loginevent', 0);
      });
      
      app.clearStorageSync();
      this.setData({
        hidden: 'hidden'
      })
    }
  },
})
