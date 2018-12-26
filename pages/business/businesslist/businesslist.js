/**
 * @title 商家分类
 * @author han
 * @date 2018-11-10 14:18:00
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

        business_category_id: '', // 一级类目id
        business_category_id2: '',
        scrollLeft: 0, // 一级类目区滚动条位置
        navList: app.data.businessNavList,
        list: app.data.businessList,

        scrollId1: '',
        scrollId2: ''

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        let {business_category_id, business_category_id2} = options;
        this.setData({
            business_category_id: !business_category_id ? null : business_category_id,
            business_category_id2: !business_category_id2 ? null : business_category_id2
        });

        this.getList()
    },
    /**
     * 重组数据
     */
    getData: function () {
        let {navList, business_category_id, business_category_id2} = this.data;
        if (!business_category_id) {
            business_category_id = navList[0].business_category_id;
        }
        for (let item in navList) {
            if (navList[item].business_category_id == business_category_id) {
                if (!business_category_id2) {
                    business_category_id2 = navList[item].child[0].business_category_id
                }
                navList[item].isSelect = 1;
                for (let i in navList[item].child) {
                    if (navList[item].child[i].business_category_id == business_category_id2) {
                        navList[item].child[i].isSelect = 1
                    } else {
                        navList[item].child[i].isSelect = 0
                    }
                }
            } else {
                navList[item].isSelect = 0
            }
        }
        this.setData({navList, business_category_id, business_category_id2})
    },

    /**
     * 获取商品类目数据
     */
    getList: function () {

        /*app.myAjax('post', 'bhs-client-online/goodsInfo/classify', '{}', (res) => {
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

        this.getData();
        this.navMoveTo();
    },
    /**
     * 一级类目，滚动至可视位置
     */
    navMoveTo: function () {
        let {business_category_id, business_category_id2} = this.data;
        this.setData({
            scrollId1: 'bus-class-1-' + business_category_id,
            scrollId2: 'bus-class-2-' + business_category_id2
        })
    },
    /**
     * 切换分类
     * @param e
     */
    onIpItemClick(e) {

        let {type, id} = e.currentTarget.dataset;
        if(type == 1) { // 一级分类
            this.setData({
                business_category_id: id,
                business_category_id2: null
            })
        } else { // 二级分类
            this.setData({
                business_category_id2: id
            })
        }
        this.getData();
        this.navMoveTo();
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