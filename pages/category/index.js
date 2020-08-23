// pages/category/index.js
import { request } from "../../request/index.js";
import regeneratorRuntime from "../../lib/runtime/runtime";
Page({
	data: {
		//左侧的菜单数据
		leftMenuList: [],
		//右侧的商品数据
		rightContent: [],
		//被点击选中的商品选项
		currentIndex: 0,
		//右侧内容的滚动条距离顶部的距离
		scrollTop: 0,
	},
	//接口 返回的数据
	Cates: [],

	onLoad: function (options) {
		/**
		 * 0 web中的本地存储 和 小程序中的本地存储的区别
		 * 	 1 写代码的方式不一样了
		 * 	   web：localStorage.setItem('key','value')	localStorage.getItem('key')
		 * 小程序中：wx:setStorageSync('key','value')	wx:getStorageSync('key')
		 * 	 2 存的时候 有没有做类型转换
		 * 		 web 不管存入的是什么类型的数据，最终都会先调用一下 toString() 方法,把数据转换成为字符串 再存进去
		 *   小程序 不存在 类型转换这个操作 存什么类型的数据进去，获取出来的就是什么类型的数据
		 * 1 先判断一下本地存储中有没有旧的数据
		 * 2 没有旧数据 直接发送请求
		 * 3 有旧的数据 同时 旧的数据也没有过期 就使用 本地存储中的旧数据即可
		 */

		// 1 获取本地存储的数据
		const Cates = wx.getStorageSync("cates");
		// 2 判断
		if (!Cates) {
			this.getCates();
		} else {
			//有旧的数据 定义过期时间
			if (Date.now() - Cates.time > 1000 * 10) {
				//重新发送请求 获取数据
				this.getCates();
			} else {
				this.Cates = Cates.data;
				//构造左侧大菜单数据
				let leftMenuList = this.Cates.map((v) => {
					return v.cat_name;
				});
				//构造右侧商品数据
				let rightContent = this.Cates[0].children;
				this.setData({
					leftMenuList,
					rightContent,
				});
			}
		}
	},

	// 获取导航数据
	async getCates() {
		// request({
		// 	url: "/categories",
		// }).then((result) => {
		// 	this.Cates = result.data.message;
		// 	//把接口数据存储到本地储存中
		// 	wx.setStorageSync("cates", { time: Date.now(), data: this.Cates });
		// 	//构造左侧大菜单数据
		// 	let leftMenuList = this.Cates.map((v) => {
		// 		return v.cat_name;
		// 	});
		// 	//构造右侧商品数据
		// 	let rightContent = this.Cates[0].children;
		// 	this.setData({
		// 		leftMenuList,
		// 		rightContent,
		// 	});
		// });

		// 1 使用es7 的async await 方法来发送异步请求
		const result = await request({ url: "/categories" });
		this.Cates = result;
		//把接口数据存储到本地储存中
		wx.setStorageSync("cates", { time: Date.now(), data: this.Cates });
		//构造左侧大菜单数据
		let leftMenuList = this.Cates.map((v) => {
			return v.cat_name;
		});
		//构造右侧商品数据
		let rightContent = this.Cates[0].children;
		this.setData({
			leftMenuList,
			rightContent,
		});
	},

	//左侧菜单的点击事件
	handleItemTap(e) {
		/*
		1 获取被点击的标题身上的索引
		2 给data中的currentIndex赋值
		*/
		const { index } = e.currentTarget.dataset;
		let rightContent = this.Cates[index].children;
		this.setData({
			currentIndex: index,
			rightContent,
			//重新设置 右侧内容的scroll-view标签的距离顶部的距离
			scrollTop: 0,
		});
	},
});
