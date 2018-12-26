/**
 * @title 确认订单
 * @author han
 * @date 2018-10-29 13:14:00
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

        id: -1,
        freightPrice: {}, // 邮费
        goodsList: [],
        goodsPriceTotalPrice: {}, // 商品总价
        payDetailTotalPrice: {}, // 订单总价
        payPriceTotalPrice: {},
        userOrderAddressResultVos: [], // 收货地址列表
        addrId: null, // 选中的收货地址id
        addrUserName: '', // 收货人
        addrUserTel: '', // 收货人电话
        addrUserRess: '', // 收货详情地址
        ginfo: [],
        useGold: 1, // 是否使用金贝 deduction: this.useGold === 1 ? true : false
        useGoldNum: 0, // 使用金贝数量
        payNum: 0 // 实付金额
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        let ginfo = "";
        if (!wx.getStorageSync('ginfo')) {
            return;
        } else {
            ginfo = wx.getStorageSync('ginfo');
            this.setData({
                ginfo
            })
        }
        var obj = {
            onlineGoodsList: ginfo,
            province: 0
        };
        console.log(JSON.stringify(obj));
        let _this = this;
        app.myAjax2('post', 'bhs-client-online/order/confirm', obj, (res) => {
            console.log('成功' + JSON.stringify(res));
            if (res.code == 1) {
                let {freightPrice, goodsList, goodsPriceTotalPrice, payDetailTotalPrice, payPriceTotalPrice, userOrderAddressResultVos} = res.data
                let newGoodsList = []
                for (let j = 0; j < goodsList.length; j++) {
                    let json = goodsList[j]
                    json.mess = ''
                    newGoodsList.push(json)
                }

                if (userOrderAddressResultVos.length !== 0) {
                    for (let i = 0; i < userOrderAddressResultVos.length; i++) {
                        if (userOrderAddressResultVos[i].isDefault === 1) {
                            _this.setData({
                                addrId: userOrderAddressResultVos[i].id,
                                addrUserName: userOrderAddressResultVos[i].userName,
                                addrUserTel: userOrderAddressResultVos[i].userPhone,
                                addrUserRess: userOrderAddressResultVos[i].province + userOrderAddressResultVos[i].city + userOrderAddressResultVos[i].district + userOrderAddressResultVos[i].detailAddress
                            })
                        }
                    }
                }
                _this.setData({
                    freightPrice,
                    goodsList: newGoodsList,
                    goodsPriceTotalPrice,
                    payDetailTotalPrice,
                    payPriceTotalPrice,
                    userOrderAddressResultVos
                })
                _this.checkPayNum()
            }
            _this.setData({
                loading: 0
            })
        }, (res) => {
            console.log('失败' + JSON.stringify(res.err));
            this.setData({
                loading: 0
            })
        })
    },
    // 核算实付金额
    checkPayNum () {
        this.setData({
            balance: app.globalData.balance,
            gold: app.globalData.gold,
            silver: app.globalData.silver,
            copper: app.globalData.copper
        });
        let {payPriceTotalPrice, freightPrice, useGold, gold} = this.data;
        // 商品金额
        let cash = payPriceTotalPrice.cash / 100;
        // 邮费
        let freight = freightPrice.cash / 100;
        // 使用金贝数
        let useGoldNum = Math.min(cash, gold / 100);
        if (useGold == 0) {
            useGoldNum = 0
        }
        this.setData({
            useGoldNum,
            payNum: cash - useGoldNum + freight
        })
    },
    /**
     * 生成订单
     */
    createOrder: function () {
        let {ginfo, addrId} = this.data;
        var obj = {
            onlineGoodsList: ginfo,
            province: addrId,
            openid: wx.getStorageSync('openId')
        };
        console.log(JSON.stringify(obj));
        app.myAjax('post', 'bhs-client-online/order/create', obj, (res) => {
            console.log('成功' + JSON.stringify(res));
            // app.globalData.orderId = orderResultVo.topOrderId;
            if (res.code == 1) {
                let {orderResultVo, paymentResultVo} = res.data;
                if (threePayList) {
                    wx.requestPayment({
                        'timeStamp': threePayList.timeStamp.toString(),
                        'nonceStr': threePayList.nonceStr,
                        'package': threePayList.packageInfo,
                        'signType': threePayList.signType,
                        'paySign': threePayList.paySign,
                        'success': function (e) {
                            console.log(JSON.stringify(e));
                            // pay_success(orderResultVo.topOrderId, 1);
                        },
                        'fail': function (e) {
                            console.log(JSON.stringify(e));
                            // pay_error(orderResultVo.topOrderId);
                        }
                    })
                } else {
                    console.log(999);
                    // pay_success(order_id);
                }
                this.setData({
                    loading: 0
                })
            } else {
                console.log('失败' + JSON.stringify(res.err));
                this.setData({
                    loading: 0
                })
            }
        }, (res) => {
            console.log('失败' + JSON.stringify(res.err));
            this.setData({
                loading: 0
            })
        })
    },
    /**
     * 添加留言
     * @param e
     */
    addLiuyan(e) {
        let {index} = e.currentTarget.dataset;
        let {value} = e.detail;
        let {goodsList, newGoodsList = [], ginfo, newGinfo = []} = this.data;
        for (var i = 0; i < goodsList.length; i++) {
            if (index == i) {
                let json = JSON.parse(JSON.stringify(goodsList[i]));
                json.mess = value;
                newGoodsList.push(json)
            } else {
                newGoodsList.push(goodsList[i])
            }
        }
        for (var j = 0; j < ginfo.length; j++) {
            if (index == j) {
                let json = JSON.parse(JSON.stringify(ginfo[j]));
                json.mess = value;
                newGinfo.push(json)
            } else {
                newGinfo.push(ginfo[j])
            }
        }
        this.setData({
            goodsList: newGoodsList,
            ginfo: newGinfo
        })
    },
    openPage: function (e) {
        let {id} = e.currentTarget.dataset;
        app.openPage('detail/detail?id=' + id)
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
});