import initAreaPicker, {getSelectedAreaData} from '../../../../template/index';
const app = getApp();

Page({
    data: {
        history_page: '',
        num: 0,
        areaPicker: {
            show: false
        },
        flag: true,
        defalutVal: 0,
        uid: ''
    },
    
    onShow: () => {

        initAreaPicker({
            // hideDistrict: true, // 是否隐藏区县选择栏，默认显示
        });

    },

    regionChange: function () {

        this.setData({
            'areaPicker.show': true
        })

    },

    getSelecedData() {

        this.setData({
            flag: false,
            province: getSelectedAreaData()[0].code,
            city: getSelectedAreaData()[1].code,
            town: getSelectedAreaData()[2].code ? getSelectedAreaData()[2].code : 0,
            provinceName: getSelectedAreaData()[0].fullName,
            cityName: getSelectedAreaData()[1].fullName,
            townName: getSelectedAreaData()[2].fullName
        });

    },

    onLoad: function (options) {

        let {uid, history_page =''} = options;
        if(uid){
            this.setData({
                uid
            });
        }
        this.data.history_page = history_page;
        var title = "新增收货人";
        if (uid) {
            title = "修改收货人";
            var updateData = wx.getStorageSync('updateReciver');
            this.setData({
                flag: false,
                resiverName: updateData.userName,
                resiverPhone: updateData.userPhone,
                receiverId: updateData.id,
                defalutVal: updateData.isDefault,
                detailAdress: updateData.detailAddress.replace(updateData.province,'').replace(updateData.city,'').replace(updateData.district,''),
                provinceName: updateData.province,
                cityName: updateData.city,
                townName: updateData.district,
                province: updateData.provinceCode,
                city: updateData.cityCode,
                town: updateData.districtCode
            })
        }
        wx.setNavigationBarTitle({
            title: title
        })

    },

    // 获取收货人名称
    resiverName: function (e) {

        this.setData({
            resiverName: e.detail.value
        })

    },

    // 获取收货人电话
    resiverPhone: function (e) {

        this.setData({
            resiverPhone: e.detail.value
        })

    },

    // 获取详细地址
    detailAdress: function (e) {

        this.setData({
            detailAdress: e.detail.value
        })

    },

    // tab切换
    label: function (e) {

        this.setData({
            num: e.target.dataset.num
        })

    },

    // 设为默认
    setDefault: function (e) {

        let defalutVal = e.detail.value[0];
        if (undefined == defalutVal) {
            defalutVal = 0
        }
        else {
            defalutVal = 1
        }
        this.setData({
            defalutVal: defalutVal
        })

    },

    // 保存
    save: function (e) {

        wx.showLoading();
        // 获取参数
        let {provinceName, cityName, townName, province, city, town, resiverName, resiverPhone, uid, defalutVal, history_page} = this.data;
        let detailAdress = this.data.provinceName + this.data.cityName + this.data.townName + this.data.detailAdress;

        // 验证表单提交
        if (resiverName == "" || resiverName == null || resiverName == undefined) {
            wx.showToast({
                title: '请填写姓名',
                icon: 'none'
            })
        } else if (resiverPhone == "" || resiverPhone == null || resiverPhone == undefined) {
            wx.showToast({
                title: '请填写手机号',
                icon: 'none'
            })
        } else if (!(/^1(3|4|5|7|8|9)\d{9}$/.test(resiverPhone))) {
            wx.showToast({
                title: '手机号格式不正确',
                icon: 'none'
            })
        } else if (detailAdress == "" || detailAdress == null || detailAdress == undefined) {
            wx.showToast({
                title: '请填写详细地址',
                icon: 'none'
            })
        }

        let obj = {
            id: uid,
            isDefault: defalutVal,
            userName: resiverName,
            userPhone: resiverPhone,
            userTel: "",
            province: provinceName,
            provinceCode: province,
            city: cityName,
            cityCode: city,
            district: townName,
            districtCode: town,
            detailAddress: detailAdress
        };

        // 保存
        let _this = this;

        if(uid) {
            app.myAjax2('put', 'bhs-client-online/address', obj, (res) => {

                if (res.code == 1) {
                    wx.navigateBack({
                        delta: 1
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
        } else {
            app.myAjax2('post', 'bhs-client-online/address', obj, (res) => {

                if (res.code == 1) {
                    wx.navigateBack({
                        delta: 1
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
        }

    }

});