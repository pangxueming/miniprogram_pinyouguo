import { request } from "../../request/index.js";
Page({
	data: {
		//轮播图数组
		swiperList: [],
		//导航数组
		catesList: [],
		//楼层数据
		floorList: [],
	},
	//options(Object)
	//页面开始加载的时候 就会触发这个事件
	onLoad: function (options) {
		// 1 发送异步请求获取轮播图数据
		// wx.request({
		// 	url: "https://api-hmugo-web.itheima.net/api/public/v1/home/swiperdata",
		// 	success: (result) => {
		// 		this.setData({
		// 			swiperList: result.data.message,
		// 		});
		// 	},
		// });
		this.getSwiperList();
		this.getCatesList();
		this.getFloorList();
	},
	// 获取轮播图数据
	getSwiperList() {
		request({
			url: "/home/swiperdata",
		}).then((result) => {
			this.setData({
				swiperList: result,
			});
		});
	},
	// 获取导航数据
	getCatesList() {
		request({
			url: "/home/catitems",
		}).then((result) => {
			this.setData({
				catesList: result,
			});
		});
	},
	// 获取 楼层数据
	getFloorList() {
		request({
			url: "/home/floordata",
		}).then((result) => {
			console.log(result);
			this.setData({
				floorList: result,
			});
		});
	},
});
