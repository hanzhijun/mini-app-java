const app = getApp();

Page({
    data: {
        loading: 0, // loading加载提示框
        loginbox: 0, // 登录弹窗
        toast: 0, // toast提示
        toastTxt: '你真的很不错哟！', // toast文字
        imgUrl: app.globalData.imgUrl,
        hasGold: 0,

        address: '复城国际中心', // 用户地址
        checkAll: 1, // 是否全选
        goodsList: [], // 购物车商品列表
        myCollectList: [],
        count: -1, // 总件数
        option: 'shopcart', // 编辑商品  shopcart：购物车   edit：编辑   no: 购物车为空
        cart_msg: [],
        cartBox: -1, // 弹窗 1确认删除 2确认收藏
        pay: { // 结算
            silver_num: 0, // 银贝
            get_goldshells: 0, // 返金贝
            price: 0, // 价格
            copper_price: 0, // 铜贝
            gold_price: 0, // 金贝
            num: 0, // 选中商品总数量
            nums: 0, // 选中件数
            missPrice: 0 // 可用金贝数抵扣金额
        }
    },

    onLoad: function () {
        this.getUserCapital()
    },

    onShow: function () {

        this.init();
        app.clearStorageSync();
        app.getaddress((res) => {
            let address_json = res.address_component;
            this.setData({
                address: `${address_json.city}${address_json.district}`
            })
        });

    },

    onPullDownRefresh: function () {

        app.clearStorageSync();
        app.getaddress((res) => {
            let address_json = res.address_component;
            this.setData({
                address: `${address_json.city}${address_json.district}`
            })
        });
        wx.stopPullDownRefresh();

    },

    init: function () {
        this.getList()
    },
    getList () {
        let _this = this;
        app.myAjax2('post', 'bhs-client-online/shoppingCart/list', {}, (res) => {
            if (res.code == 1) {
                if (res.data.data.length == 0) {
                    _this.setData({
                        count: 0,
                        option: 'no',
                        loading: 0
                    });
                    return
                }
                let {goodsList} = _this.data;
                let {data, count} = res.data;
                for (let i = 0; i < data.length; i++) {
                    let list = data[i];
                    list['isSelect'] = 1;
                    list.goodsImage = list.goodsImage.replace('http://192.168.100.231/http://', 'http://');
                    goodsList.push(list)
                }
                _this.setData({
                    goodsList,
                    count,
                    loading: 0
                });
                _this.checkAllMoney()
            } else {
                _this.setData({
                    loading: 0
                })
            }
        });
    },
    /**
     * 计算购物车选中商品数量及总价
     */
    checkAllMoney () {
        let {goodsList, pay, hasGold} = this.data;
        pay.price = pay.num = pay.nums = 0;
        for (let i = 0; i < goodsList.length; i++) {
            if (goodsList[i].isSelect === 1) {
                pay.num += goodsList[i].quantity;
                pay.nums += 1;
                pay.price += goodsList[i].quantity * goodsList[i].goodsPrice.cash
            }
        }
        pay.missPrice = Math.min(pay.price / 100, hasGold);
        this.setData({
            goodsList,
            pay,
            loading: 0
        })
    },
    /**
     * 加减数量操作
     */
    changeNum (e) {
        let {sku, num, quantity} = e.currentTarget.dataset;
        if (num * 1 === -1 && quantity * 1 === 1) return;
        let obj = {
            goodsSkuId: sku,
            quantity: quantity + num * 1
        };
        this.setData({
            loading: 1
        });
        let _this = this;
        // 变更数量提交服务器
        app.myAjax2('put', 'bhs-client-online/shoppingCart/updateQuantity', obj, function (res) {
            if (res.code * 1 === 1) {
                console.log('成功变更数量');
                let {goodsList} = _this.data;
                for (let i = 0; i < goodsList.length; i++) {
                    if (goodsList[i].goodsSkuId === sku) {
                        goodsList[i].quantity = goodsList[i].quantity + num * 1
                    }
                }
                _this.setData({
                    goodsList
                });
                _this.checkAllMoney()
            } else {
                console.log('变更数量失败！')
            }
            _this.setData({
                loading: 0
            });
        })
    },
    /**
     * 全选与取消全选操作
     */
    toCheckAll () {
        let {checkAll, goodsList} = this.data;
        checkAll = Math.abs(checkAll - 1);
        for (let i = 0; i < goodsList.length; i++) {
            goodsList[i].isSelect = checkAll
        }
        this.setData({
            checkAll,
            goodsList
        });
        this.checkAllMoney()
    },
    /**
     * 单个选择与取消选择操作
     */
    checkSingle (e) {
        let {id} = e.currentTarget.dataset;
        let {checkAll, goodsList} = this.data;
        let over = true;
        for (let i = 0; i < goodsList.length; i++) {
            if (goodsList[i].goodsSkuId === id) {
                goodsList[i].isSelect = Math.abs(goodsList[i].isSelect - 1)
            }
            if (goodsList[i].isSelect === 0) {
                over = false
            }
        }
        checkAll = over === true ? 1 : 0;
        this.setData({
            checkAll,
            goodsList
        });
        this.checkAllMoney()
    },
    /**
     * 编辑商品 (顶部切换按钮)
     * @param e
     */
    switchPage () {
        let {option} = this.data;
        if (option === 'shopcart') {
            option = 'edit'
        } else {
            option = 'shopcart'
        }
        this.setData({
            option
        })
    },
    /**
     * 购物车删除
     */
    deleteCartConfirm () {
        this.setData({
            cartBox: 1
        })
    },
    deleteCart () {
        let {goodsList, checkAll} = this.data;
        this.setData({
            loading: 1
        });
        let _this = this;
        if (checkAll === 1) { // 全部删除
            app.myAjax2('delete', 'bhs-client-online/shoppingCart/deleteAll', '{}', function (res) {
                if (res.code * 1 === 1) {
                    console.log('购物车删除成功');
                    _this.setData({
                        goodsList: [],
                        count: 0,
                        option: 'no',
                        loading: 0,
                        cartBox: -1
                    })
                }
            })
        } else { // 删除部分
            let obj = [];
            for (let i = 0; i < goodsList.length; i++) {
                if (goodsList[i].isSelect === 1) {
                    obj.push(goodsList[i].goodsSkuId)
                }
            }
            app.myAjax2('delete', 'bhs-client-online/shoppingCart', obj, function (res) {
                if (res.code * 1 === 1) {
                    console.log('购物车删除成功');
                    let newData = [];
                    for (let i = 0; i < goodsList.length; i++) {
                        if (goodsList[i].isSelect === 0) {
                            newData.push(goodsList[i])
                        }
                    }
                    _this.setData({
                        goodsList: newData,
                        count: newData.length
                    });
                    _this.checkAllMoney()
                }
                _this.setData({
                    loading: 0,
                    cartBox: -1
                })
            })
        }
    },
    // 移入收藏夹
    joinCollect () {
        this.setData({
            cartBox: 2
        })
    },
    // 关闭弹窗
    cartCloseBox () {
        this.setData({
            cartBox: -1
        })
    },
    // 去结算
    toPay () {
        let ginfo = [];
        let {goodsList} = this.data;
        for (let i = 0; i < goodsList.length; i++) {
            if (goodsList[i].isSelect === 1) {
                let obj = {
                    quantity: goodsList[i].quantity,
                    goodsSkuId: goodsList[i].goodsSkuId,
                    orderActivityid: goodsList[i].buyerId,
                    remarks: ''
                };
                ginfo.push(obj)
            }
        }
        app.setStorageSync({
            ginfo
        });
        app.openPage('goods/orderconfirm/orderconfirm')
    },

    openPageCollect: function (e) {
        let { gid, type } = e.currentTarget.dataset;
        app.openPage(`goods/goodsdetail/goodsdetail?gid=${gid}&type=${type}`);
    },

    /**
     * 登录成功回执
     */
    loginevent: function () {
        // this.init();
    },

    /**
     * 获取用户余额，金贝数
     */
    getUserCapital: function () {
        let _this = this;
        app.myAjax2('get', 'bhs-client-online/userCapital/detail', '{}', (res) => {
            if (res.code == 1) {
                _this.setData({
                    hasGold: res.data.gold
                })
            }
        })
    }

});
