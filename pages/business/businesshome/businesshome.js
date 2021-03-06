/**
 * @title 商家
 * @author han
 * @date 2018-11-10 17:10:00
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
        toastTxt: '系统错误，请稍后重试!', // toast文字
        imgUrl: app.globalData.imgUrl,

        business_offline_id: '', // 一级类目id
        scrollTop: 0, // 一级类目区滚动条位置
        bannerList: app.data.homeBannerList,
        packageList: app.data.homePackageList,
        couponList: app.data.homeCouponList

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

        // 假如url未传cid, 默认展示第一条一级类目
        let {cid, list} = this.data;
        if(!cid) {
            this.setData({
                cid: list[0].cid
            })
        }

        this.navMoveTo();
    },
    /**
     * 一级类目，滚动至可视位置
     */
    navMoveTo: function () {
        let {cid, list, scrollTop} = this.data;
        for(let i=1; i<list.length; i++) {
            if(list[i].cid == cid) {
                scrollTop = i * 50
            }
        }
        this.setData({
            scrollTop
        })
    },
    /**
     * 切换一级类目
     * @param e
     */
    changeNav: function(e) {
        let {cid} = e.currentTarget.dataset;
        this.setData({
            cid
        })
    },
    /**
     *  跳转商品列表页
     * @param e
     */
    listClick: function(e){
        let {sid,sname} = e.currentTarget.dataset;
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