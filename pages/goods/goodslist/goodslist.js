/**
 * @title 商品列表
 * @author han
 * @date 2018-10-27 15:18:00
 */
const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        loading: 1, // loading加载提示框
        loginbox: 0, // 登录弹窗
        toast: 0, // toast提示
        toastTxt: '你真的很不错哟！', // toast文字
        imgUrl: app.globalData.imgUrl,

        title: '',
        sid: '',
        sname: '',
        word: null,
        list: [],
        searchType: 1, // 1综合 2销量 3价格升序 4价格降序

        count: -1,
        pageNumber: '',
        pageSize: '',
        pages: 1
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let {sid, sname, word} = options;
        if(sname) {
            wx.setNavigationBarTitle({
                title: sname
            });
            this.setData({
                sid,
                sname,
                title: sname
            })
        }

        if (word) {
            wx.setNavigationBarTitle({
                title: '搜索结果'
            });
            this.setData({
                word,
                title: '搜索结果'
            })
        }
        if (!sid && !word) {
            app.showToast(this, '类目获取错误，即将返回首页!');
            let _this = this
            setTimeout(function () {
                _this.goHome()
            }, 3000)
        }

        let obj = {
            categoryId: sid
        };

        app.myAjax('post', 'bhs-client-online/goodsInfo/list', obj, (res) => {
            if (res.code == 1) {
                this.setData({
                    list: res.data.data,
                    loading: 0
                })
            } else {
                this.setData({
                    loading: 0
                })
            }
        }, (res) => {
            this.setData({
                loading: 0
            })
        })
    },

    openPage: function (e) {
        let {id} = e.currentTarget.dataset;
        app.openPage('goods/goodsdetail/goodsdetail?gid=' + id)
    },

    /**
     * 标签切换
     * @param type
     */
    changeNav (e) {

        let {type} = e.currentTarget.dataset;
        let {searchType} = this.data;
        if (type == 1) {
            if (searchType == 1) return;
            this.setData({
                searchType: 1
            });
            app.showToast(this, '综合排序模式')
        } else if (type == 2) {
            if (searchType == 2) return;
            this.setData({
                searchType: 2
            });
            app.showToast(this, '销量排序模式')
        } else {
            if (searchType == 3) {
                this.setData({
                    searchType: 4
                });
                app.showToast(this, '价格降序排列')
            } else {
                this.setData({
                    searchType: 3
                });
                app.showToast(this, '价格升序排列')
            }
        }
    }

});