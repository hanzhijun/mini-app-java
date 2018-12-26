// components/web-view/web-view.js
const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        url: ''
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        let host = app.config.host;
        let {url} = options;
        let id = wx.getStorageSync('pgcTemplateId');
        let thisUrl = '';
        if(host.indexOf('net')!=-1) { // 新版本，此处不通，记住要处理
            thisUrl = url + '?token=' + wx.getStorageSync('session') + '&id=' + id + '&api=net';
        } else {
            thisUrl = url + '?token=' + wx.getStorageSync('session') + '&id=' + id;
        }
        this.setData({
            url: thisUrl
        });
        wx.removeStorageSync('pgcTemplateId');

    },
    /**
     * 分享设置
     */
    onShareAppMessage: function () {
        let {url} = this.data; //分享的当前页面的路径
        var path = `pages/web-view/web-view?url=${url}`; //小程序存放分享页面的内嵌网页路径
        return {
            title: '贝划算，开始划算生活!',
            path: path,
            success: function(res) {
                // 转发成功
                // console.log('Share success!');
            },
            fail: function(res) {
                // 转发失败
                // console.log(JSON.stringify(res));
            }
        }
    }
});