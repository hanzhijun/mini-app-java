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
        toastTxt: '你真的很不错哟！', // toast文字
        imgUrl: app.globalData.imgUrl,
        
        bannerList: app.data.nearbyBannerList,
        navList: app.data.nearbyNavList,
        list: app.data.nearbyList

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * 获取商品类目数据
     */
    getList: function () {

        /*app.post('goodsInfo/classify', '{}', (res) => {
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
        })*/

    },
    openPageTo: function () {

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