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
        toastTxt: '你真的很不错哟！', // toast文字
        imgUrl: app.globalData.imgUrl,

        width: app.globalData.width,
        bannerList: [], // banner图片列表
        detailImgList: [], // 详情中图片列表
        id: '', // 商品id
        areaRestriction: '',
        goodsDesc: '',
        goodsName: '',
        shareBuy: '',
        skuList: [],
        skuSpecList: [],
        skuData: '', // sku名称 如："红色,S"
        skuId: '', // sku唯一id
        price: '', // 售价
        quantity: 1, // 商品数量
        goodsStock: "", // 库存数量
        orderActivityid: 1 //  参加活动的活动类型，参加的活动，1线上，2服务，3代金卷
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let {gid} = options;
        this.setData({
            id: gid
        });
        this.getGoodsInfo()
    },
    /**
     * 获取商品详情数据
     */
    getGoodsInfo() {
        let {id} = this.data;
        app.myAjax('get', 'bhs-client-online/goodsInfo/' + id, '{}', (res)=> {
            // console.log('成功' + JSON.stringify(res));
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
                    var v = skuSpecList[i].specGroupValues.split(','), vList = [];
                    for (var j = 0; j < v.length; j++) {
                        var obj = {
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
                    loading: 0
                });
                this.checkSkuData();
            } else {
                // console.log('失败' + JSON.stringify(res.err));
                this.setData({
                    loading: 0
                })
            }
        }, (res)=> {
            // console.log('失败' + JSON.stringify(res.err));
            this.setData({
                loading: 0
            })
        })
    },
    /**
     * 根据选中的规格，计算sukData及price
     */
    checkSkuData(){
        let {skuSpecList, skuList} = this.data;
        let value = '', price = '', skuId = '', goodsStock = '';
        for (var i = 0; i < skuSpecList.length; i++) {
            for (var j = 0; j < skuSpecList[i].specList.length; j++) {
                if (skuSpecList[i].specList[j].over == 1) {
                    value = value == '' ? skuSpecList[i].specList[j].name : value + ',' + skuSpecList[i].specList[j].name
                }
            }
        }
        for (var k = 0; k < skuList.length; k++) {
            if (skuList[k].skuSpec == value) {
                price = skuList[k].sellPrice;
                skuId = skuList[k].id;
                goodsStock = skuList[k].stock
            }
        }
        this.setData({
            skuData: value,
            price,
            skuId,
            goodsStock
        })
    },
    /**
     * 变更商品规格
     * @param e
     */
    changeSku(e) {
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
    // 加入购物车
    joinShopCart: function (e) {
        // if (this.data.buy_limit > 0 && this.data.buy_limit == this.data.bought) {
        //     app.alert('您已达到购买上限~', 'none');
        //     return;
        // }
        let _this = this;
        let obj = {
            goodsSkuId: _this.data.skuId
        };
        app.myAjax2('post', 'bhs-client-online/shoppingCart', obj, (res) => {

            if (res.code == 1) {
                _this.setData({
                    loading: 0
                })
            } else {
                _this.setData({
                    loading: 0
                })
            }
        }, (res) => {
            _this.setData({
                loading: 0
            })
        })
    },
    upper(e) {
        console.log('upper')
    },
    lower(e) {
        console.log('lower')
    },
    scroll(e) {
        console.log('scroll')
    },
    toOrder() {
        let {quantity, skuId, orderActivityid, ginfo = []} = this.data;
        let obj = {
            quantity, // 购买商品数量
            goodsSkuId: skuId, // 商品skuId
            orderActivityid, // 参加活动的活动类型，参加的活动，1线上，2服务，3代金卷
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
    checkNumber: function (e) {

        let {type} = e.currentTarget.dataset;
        let {quantity, goodsStock} = this.data;
        if (quantity >= goodsStock && type == 1) {
            app.showToast(this, '您已选至库存上限');
        } else if (quantity != 1 || type != -1) {
            this.setData({
                quantity: quantity * 1 + type * 1
            })
        }

    }
});