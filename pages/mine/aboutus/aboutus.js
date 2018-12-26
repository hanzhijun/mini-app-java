const app = getApp();

Page({
    data: {
        vision: ''
    },
    onLoad() {
        this.setData({
            vision: app.globalData.vision
        })
    }
});