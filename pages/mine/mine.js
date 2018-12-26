// pages/mine/mine.js
const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        rawData: null,
        userInfo: []
    },

    onLoad: function () {
        this.setData({
            balance: app.globalData.balance,
            gold: app.globalData.gold,
            silver: app.globalData.silver,
            copper: app.globalData.copper
        })
    },

    onShow: function () {
        this.init();
    },

    loginevent: function () {
        setTimeout(() => {
            this.init();
        }, 1000)
    },

    init: function () {
        console.log(app.globalData.balance);
        console.log(app.globalData.gold);
        console.log(app.globalData.silver);
        console.log(app.globalData.copper);
        if (!wx.getStorageSync('session')) {
            let that = this.selectComponent("#loginBox");
            if (that) {
                that.setData({
                    hidden: false
                });
            }
            wx.hideLoading();
            return;
        } else {
            let that = this.selectComponent("#loginBox");
            if (that) {
                that.setData({
                    hidden: 'hidden'
                });
            }
        }

        let rawData = wx.getStorageSync('rawData');
        this.setData({
            rawData: rawData && JSON.parse(rawData)
        });

        // app.clearStorageSync();

    },

/*    getUserCapital: function () {
        app.get('userCapital/detail', '{}', (res) => {
            // console.log('成功' + JSON.stringify(res));
            if (res.code == 1) {
                this.setData({
                    list: res.data.data,
                    loading: 0
                })
            } else {
                // console.log('失败' + JSON.stringify(res.err));
                this.setData({
                    loading: 0
                })
            }
        }, (res) => {
            // console.log('失败' + JSON.stringify(res.err));
            this.setData({
                loading: 0
            })
        })
    },*/

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.init();
        wx.stopPullDownRefresh();
    }

});