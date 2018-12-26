/**
 * @title 商品详情
 * @author han
 * @date 2018-10-27 14:14:00
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
    title: '商品详情', // 标题
    toastTxt: '系统错误，请稍后重试!', // toast文字
    imgUrl: app.globalData.imgUrl,
    isLogin: app.globalData.isLogin,
    gold: null,
    userInfo: null,

    width: app.globalData.width,
    bannerList: [], // banner图片列表
    detailImgList: [], // 详情中图片列表
    id: '', // 商品id
    areaRestriction: '',
    goodsDesc: '',
    goodsName: '',
    shareBuy: '', // 是否是助力购商品
    skuList: [],
    skuSpecList: [],
    skuData: '', // sku名称 如："红色,S"
    skuImgPath: '',
    goodsSkuId: '', // sku唯一id
    price: '', // 售价
    priceUseGold: null, // 用贝价
    missPrice: null, // 金贝帮你抵扣了
    quantity: 1, // 商品数量
    goodsStock: '', // 库存数量
    orderActivityId: 1, //  参加活动的活动类型，参加的活动，1线上，2服务，3代金卷
    skuBox: 0, // 是否开启选择sku规格弹窗 0关闭 1打开
    backGold: 0, // 返金贝数
    isFavorites: 0, // 是否收藏 0未收藏 1已收藏
    moduleType: 3 // 收藏类型 模块 1 商家 2 套餐 3 商品
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    let {gid} = options;
    this.setData({
      id: gid
    })
  },
  onShow () {
    this.init()
  },
  init () {
    if (!wx.getStorageSync('session')) {
      this.setData({
        isLogin: 0
      });
      this.getGoodsInfo()
    } else {
      this.setData({
        isLogin: 1
      });
      app.getUserCapital(this, this.getGoodsInfo)
    }
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo
      })
    }
  },
  /**
   * 获取商品详情数据
   */
  getGoodsInfo () {
    let {id} = this.data;
    app.myAjax('get', 'bhs-client-online/goodsInfo/' + id, '{}', (res)=> {
      if (res.code == 1) {
        let {areaRestriction, goodsName, shareBuy, skuList, skuSpecList, imageList} = res.data;
        let newSkuSpecList = [], detailImgList = [], bannerList = [];
        // 重组图片数据(viewType: 图片位置 1.宣传图片 2.内容介绍)
        for (var m = 0; m < imageList.length; m++) {
          if (imageList[m].viewType == 1) {
            bannerList.push(imageList[m])
          } else if (imageList[m].viewType == 2) {
            detailImgList.push(imageList[m])
          }
        }
        // 重组规格数据
        for (var i = 0; i < skuSpecList.length; i++) {
          let v = skuSpecList[i].specGroupValues.split(','), vList = [];
          for (let j = 0; j < v.length; j++) {
            let obj = {
              name: v[j],
              over: j == 0 ? 1 : 0
            };
            vList.push(obj);
          }
          var obj2 = {
            id: skuSpecList[i].id,
            specGroupId: skuSpecList[i].specGroupId,
            specGroupName: skuSpecList[i].specGroupName,
            specList: vList
          };
          newSkuSpecList.push(obj2)
        }
        this.setData({
          areaRestriction,
          goodsName,
          shareBuy,
          skuList,
          detailImgList,
          bannerList,
          skuSpecList: newSkuSpecList,
          skuImgPath: bannerList[0].imgPath,
          loading: 0
        });
        this.checkSkuData();
      } else {
        this.setData({
          loading: 0
        })
      }
    }, (res)=> {
      this.setData({
        loading: 0
      })
    })
  },
  /**
   * 根据选中的规格，计算sukData及price
   */
  checkSkuData () {
    let {skuSpecList, skuList, missPrice, priceUseGold, gold, isLogin} = this.data;
    let value = '';
    let price = '';
    let goodsSkuId = '';
    let goodsStock = '';
    let backGold = '';
    for (let i = 0; i < skuSpecList.length; i++) {
      for (let j = 0; j < skuSpecList[i].specList.length; j++) {
        if (skuSpecList[i].specList[j].over * 1 === 1) {
          value = value === '' ? skuSpecList[i].specList[j].name : value + ',' + skuSpecList[i].specList[j].name
        }
      }
    }
    for (let k = 0; k < skuList.length; k++) {
      if (skuList[k].skuSpec === value) {
        price = skuList[k].sellPrice;
        goodsSkuId = skuList[k].id;
        goodsStock = skuList[k].stock;
        backGold = skuList[k].backGold
      }
    }
    if (isLogin == 1) {
      missPrice = Math.min(price / 100, gold / 100).toFixed(2);
      priceUseGold = (price / 100 - missPrice).toFixed(2);
    }
    this.setData({
      price: price.toFixed(2),
      goodsSkuId,
      goodsStock,
      backGold,
      missPrice,
      priceUseGold,
      skuData: value
    })
  },
  /**
   * 变更商品规格
   * @param e
   */
  changeSku (e) {
    let {parent, index, over} = e.currentTarget.dataset;
    let {skuSpecList, newSkuSpecList = []} = this.data;
    if (over == 1) return;
    for (var i = 0; i < skuSpecList.length; i++) {
      if (parent != i) {
        newSkuSpecList.push(skuSpecList[i])
      } else {
        var list = skuSpecList[i].specList, newList = [];
        for (var j = 0; j < list.length; j++) {
          var obj = {
            name: list[j].name
          };
          if (index == j) {
            obj.over = 1
          } else {
            obj.over = 0
          }
          newList.push(obj)
        }
        var obj2 = {
          id: skuSpecList[i].id,
          specGroupId: skuSpecList[i].specGroupId,
          specGroupName: skuSpecList[i].specGroupName,
          specList: newList
        };
        newSkuSpecList.push(obj2);
      }
    }
    this.setData({
      skuSpecList: newSkuSpecList
    });
    this.checkSkuData()
  },
  /**
   * 加入购物车
   */
  joinShopCart () {
    let {isLogin, goodsSkuId, orderActivityId} = this.data;
    if (!isLogin) {
      this.setData({
        loginbox: 1
      });
      return
    }
    let obj = {
      goodsSkuId,
      orderActivityId, // 商品所属活动类型，线上为1，服务为2，代金卷为3
      quantity: 1 // 购买数量
    };
    let _this = this;
    app.myAjax2('post', 'bhs-client-online/shoppingCart', obj, function (res) {
      if (res.code == 1) {
        app.showToast(_this, '成功加入购物车')
      }
    })
  },
  /**
   * 立即购买
   */
  toOrder () {
    let {isLogin, quantity, goodsSkuId, orderActivityId} = this.data;
    if (!isLogin) {
      this.setData({
        loginbox: 1
      });
      return
    }
    let ginfo = [];
    let obj = {
      quantity, // 购买商品数量
      goodsSkuId, // 商品skuId
      orderActivityId, // 参加活动的活动类型，参加的活动，1线上，2服务，3代金卷
      remarks: "" // 订单备注
    };
    ginfo.push(obj);
    app.setStorageSync({
      ginfo
    });
    app.openPage('goods/orderconfirm/orderconfirm')
  },
  /**
   * 数量操作
   * @param e
   * @returns {number}
   */
  checkNumber (e) {
    let {type} = e.currentTarget.dataset;
    let {quantity, goodsStock} = this.data;
    if (quantity >= goodsStock && type == 1) {
      app.showToast(this, '您已选至库存上限');
    } else if (quantity != 1 || type != -1) {
      this.setData({
        quantity: quantity * 1 + type * 1
      })
    }
  },
  /**
   * 开启选择规格、数量弹窗
   */
  showSkuBox () {
    this.setData({
      skuBox: 1
    })
  },
  /**
   * 关闭选择规格、数量弹窗
   */
  closeSkuBox () {
    this.setData({
      skuBox: 0
    })
  },
  goToCart () {
    app.openPage('cart/cart', '_tab')
  }
});