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
    title: '订单确认', // 标题
    toastTxt: '系统错误，请稍后重试!', // toast文字
    imgUrl: app.globalData.imgUrl,
    isLogin: app.globalData.isLogin,
    gold: null,
    userInfo: null,

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
    payNum: 0, // 实付金额

    pay: {
      payPriceTotalPrice: null,
      freightPrice: null
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad () {},
  onShow () {
    this.init()
  },
  init () {
    if (!wx.getStorageSync('ginfo')) {
      wx.navigateBack()
    } else {
      this.setData({
        ginfo: wx.getStorageSync('ginfo')
      })
    }
    if (!wx.getStorageSync('session')) {
      this.setData({
        isLogin: 0
      });
      this.getGoodsInfo()
    } else {
      this.setData({
        isLogin: 1
      });
      app.getUserCapital(this, this.getOrderInfo)
    }
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo
      })
    }
  },
  /**
   * 获取order基础信息
   */
  getOrderInfo () {
    var obj = {
      deduction: false,
      onlineGoodsList: this.data.ginfo,
      userOrderAddressId: '',
      creatOrderAndPay: true,
      cashPaymentMethod: 'wechat',
      systemType: 'applet',
      openid: wx.getStorageSync('openId')
    };
    let _this = this;
    app.myAjax2('post', 'bhs-client-online/order/confirm', obj, (res) => {
      console.log('成功' + JSON.stringify(res));
      if (res.code == 1) {
        let {freightPrice, goodsList, goodsPriceTotalPrice, payDetailTotalPrice, payPriceTotalPrice, userOrderAddressResultVos} = res.data;
        let newGoodsList = [];
        for (let j = 0; j < goodsList.length; j++) {
          let json = goodsList[j];
          json.mess = '';
          if (json.remarks == null) {
            json.remarks = ''
          }
          json.price = (json.goodsPrice.cash/100).toFixed(2);
          json.subTotal = (json.goodsPrice.cash/100 * json.quantity).toFixed(2);
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
        });
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
    let {payPriceTotalPrice, freightPrice, useGold, gold, pay} = this.data;
    // 商品金额
    let cash = payPriceTotalPrice.cash / 100;
    // 邮费
    let freight = freightPrice.cash / 100;
    // 使用金贝数
    let useGoldNum = Math.min(cash, gold / 100).toFixed(2);
    if (useGold == 0) {
      useGoldNum = 0
    }
    // 商品总额
    pay.payPriceTotalPrice = (payPriceTotalPrice.cash / 100).toFixed(2);
    pay.freightPrice = (freightPrice.cash/100).toFixed(2);
    this.setData({
      useGoldNum,
      pay,
      payNum: (cash - useGoldNum + freight).toFixed(2)
    })
  },
  /**
   * 生成订单
   */
  createOrder () {
    let {ginfo, addrId} = this.data;
    var obj = {
      onlineGoodsList: ginfo,
      deduction: false,
      userOrderAddressId: addrId,
      creatOrderAndPay: true,
      cashPaymentMethod: 'wechat',
      systemType: 'applet',
      openid: wx.getStorageSync('openId')
    };

    app.myAjax('post', 'bhs-client-online/order/create', obj, (res) => {
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
            },
            'fail': function (e) {
              console.log(JSON.stringify(e));
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
  addLiuyan (e) {
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
  openPage (e) {
    let {id} = e.currentTarget.dataset;
    app.openPage('detail/detail?id=' + id)
  },
  /**
   * 新增或更换收货地址
   * @param e change add
   */
  goToAddress (e) {
    let {type} = e.currentTarget.dataset;
    app.openPage('mine/adress/adress?type=' + type)
  },
  /**
   * 变更留言
   * @param e
   */
  remarksChange (e) {
    let {index} = e.currentTarget.dataset;
    let {goodsList} = this.data;
    for (let i = 0; i < goodsList.length; i++) {
      if (i == index) {
        goodsList[i].remarks = e.detail.value;
      }
    }
    this.setData({
      goodsList
    })
  },
  /**
   * 变更是否使用金贝
   */
  checkSwitch () {
    // 是否使用金贝
    let {useGold} = this.data;
    useGold = Math.abs(useGold - 1);
    this.setData({
      useGold
    });
    this.checkPayNum()
  }

});