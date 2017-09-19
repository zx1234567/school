// pages/goods/goods.js
var fun_md5 = require('../../utils/md5.js')
var fun_sha1 = require('../../utils/sha1.js')
var fun_base64 = require('../../utils/base64.js')
var fun_aes = require('../../utils/aes.js')
var app = getApp()
//十六位十六进制数作为秘钥
var key = fun_aes.CryptoJS.enc.Utf8.parse("5de7e29919fad4d5");
//十六位十六进制数作为秘钥偏移量
var iv = fun_aes.CryptoJS.enc.Utf8.parse('1234567890123456'); 
Page({
    data: {
      carArray: []
    },
    selectMenu: function (e) {
        var index = e.currentTarget.dataset.itemIndex;
        this.setData({
            toView: 'order' + index.toString()
        })
        console.log(this.data.toView);
    },
    //移除商品
    decreaseCart: function (e) {
        var index = e.currentTarget.dataset.itemIndex;
        var parentIndex = e.currentTarget.dataset.parentindex;
        this.data.goods[parentIndex].foods[index].shopcount--
        var num = this.data.goods[parentIndex].foods[index].shopcount;
        var mark = 'a' + index + 'b' + parentIndex
        var price = this.data.goods[parentIndex].foods[index].price;
        var obj = { price: price, num: num, mark: mark, name: name, index: index, parentIndex: parentIndex };
        var carArray1 = this.data.carArray.filter(item => item.mark != mark);
        carArray1.push(obj);
        console.log(carArray1);
        this.setData({
            carArray: carArray1,
            goods: this.data.goods
        })
        this.calTotalPrice()
        this.setData({
            payDesc: this.payDesc(),
        })
        //关闭弹起
        var count1 = 0
        for (let i = 0; i < carArray1.length; i++) {
            if (carArray1[i].num == 0) {
                count1++;
            }
        }
        //console.log(count1)
        if (count1 == carArray1.length) {
            if (num == 0) {
                this.setData({
                    cartShow: 'none'
                })
            }
        }
    },
    decreaseShopCart: function (e) {
        console.log('1');
        this.decreaseCart(e);
    },
    //添加到购物车  这个函数是要把数据添加到购物车
    addCart(e) {
        var index = e.currentTarget.dataset.itemIndex;   //这是要拿到大模块里的第几个
        var parentIndex = e.currentTarget.dataset.parentindex;  //这里是要确定是热销凉菜，热菜的哪个模块
        let thisGoods = this.data.goods[parentIndex].goodsList[index]
        var price = thisGoods.price;
        var num = thisGoods.ordered;
        var name = thisGoods.name;
        var obj = { price: price, num: num,  name: name, index: index, parentIndex: parentIndex };
        console.log("this data detail")
        console.log(this.data.goods[parentIndex].goodsList[index])
        var carArray = this.data.carArray
        carArray.push(obj)
        // console.log(carArray);
        this.setData({
          carArray: carArray
        })
        this.calTotalPrice();      //计算总价
        this.setData({
            payDesc: this.payDesc()
        })
    },
    addShopCart: function (e) {
        this.addCart(e);
    },
    //计算总价
    calTotalPrice: function () {
        var carArray = this.data.carArray;
        var totalPrice = 0;
        var totalCount = 0;
        console.log(carArray)
        for (var i = 0; i < carArray.length; i++) {
            totalPrice += carArray[i].price * carArray[i].num;
            totalCount += Number(carArray[i].num)
        }
        this.setData({
            totalPrice: totalPrice,
            totalCount: totalCount,
            //payDesc: this.payDesc()
        });
    },
    //差几元起送
    payDesc() {
        if (this.data.totalPrice === 0) {
            return `￥${this.data.minPrice}元起送`;
        } else if (this.data.totalPrice < this.data.minPrice) {
            let diff = this.data.minPrice - this.data.totalPrice;
            return '还差' + diff + '元起送';
        } else {
            return '去结算';
        }
    },
    //結算
    pay() {
        if (this.data.totalPrice < this.data.minPrice) {
            return;
        }
        // window.alert('支付' + this.totalPrice + '元');
        //确认支付逻辑
        var resultType = "success";
        wx.redirectTo({
            url: '../goods/pay/pay?resultType=' + resultType
        })
    },
    //彈起購物車
    toggleList: function () {
        if (!this.data.totalCount) {
            return;
        }
        this.setData({
            fold: !this.data.fold,
        })
        var fold = this.data.fold
        //console.log(this.data.fold);
        this.cartShow(fold)
    },
    cartShow: function (fold) {
        console.log(fold);
        if (fold == false) {
            this.setData({
                cartShow: 'block',
            })
        } else {
            this.setData({
                cartShow: 'none',
            })
        }
        console.log(this.data.cartShow);
    },
   
    tabChange: function (e) {
        var showtype = e.target.dataset.type;
        this.setData({
            status: showtype,
        });
    },  EncryptBASE64: function (word) {
      var srcs1 = fun_aes.CryptoJS.enc.Utf8.parse(word);
      var encrypted1 = fun_aes.CryptoJS.AES.encrypt(srcs1, key, { iv: iv, mode: fun_aes.CryptoJS.mode.ECB, padding: fun_aes.CryptoJS.pad.Pkcs7 });
      //返回base64加密结果
      
      return encrypted1.toString();
    },
    onLoad: function (options) {


      
      var that = this
      var str_aes_encodeBASE64 = that.EncryptBASE64('{"shopid":"123456"}');
      that.setData({
        images1: str_aes_encodeBASE64

      })
    
      wx.request({
        url: 'http://localapi/jeeplus/getShopGoodsTypelist', //仅为示例，并非真实的接口地址
        method : 'POST' ,
        data: {
          s : str_aes_encodeBASE64
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded' // 默认值
        },
        success: function (res) {
          console.log(res.data);
          that.setData({//如果在sucess直接写this就变成了wx.request()的this了.必须为getdata函数的this,不然无法重置调用函数
  　　　　　　goods: res.data.body.goods
  　　　　})
        }
      })


    
    },
    onReady: function () {
        // 页面渲染完成
    },
    onShow: function () {
        // 页面显示
    },
    onHide: function () {
        // 页面隐藏
    },
    onUnload: function () {
        // 页面关闭
    }
})
