/**
 * 1 发送请求获取数据
 *  2 点击轮播图 预览发图
 *    1 给轮播图绑定点击事件
 *    2 调用小程序的api previewImage
 *  3 点击购物车 加入购物车
 *    1 先绑定点击事件
 *    2 获取缓存中的购物车的数据数组格式
 * 		3 先判断 当前的商品是否已经存在于 购物车
 * 		4 已经存在 修改商品数据执行购物车数量++ 重新把购物车数组 填充回缓存中
 * 		5 不存在于购物车的数组中 直接给购物车数组添加一个元素 新元素带上 购买数量属性 num 重新把购物车数组 填充回缓存中
 * 		6 弹出提示
 *
 */
import { request } from "../../request/index.js";
import regeneratorRuntime from "../../lib/runtime/runtime";
Page({
	data: {
		goodsObj: {},
		isCollect: false,
	},

	onShow: function () {
		let pages = getCurrentPages();
		let currentPage = pages[pages.length - 1];
		let options = currentPage.options;

		const { goods_id } = options;
		this.getGoodsDetail(goods_id);
	},

	//商品信息
	GoodsInfo: {},
	//获取商品详情数据
	async getGoodsDetail(goods_id) {
		const goodsObj = await request({
			url: "/goods/detail",
			data: { goods_id },
		});
		this.GoodsInfo = goodsObj; // 1 获取缓存中商品收藏的数组
		const collect = wx.getStorageSync("collect") || [];
		// 2 判断当前商品是否被收藏
		const isCollect = collect.some(
			(v) => v.goods_id === this.GoodsInfo.goods_id
		);
		this.setData({
			goodsObj: {
				goods_name: goodsObj.goods_name,
				goods_price: goodsObj.goods_price,
				/**
				 * iphone部分手机 不识别 webp图片格式
				 * 最好找到后台 让他修改
				 * 临时自己改 确保后台存在 1.webp => 1.jpg
				 */
				// goods_introduce: goodsObj.goods_introduce.replace(/\.webp/g, ".jpg"),
				goods_introduce: goodsObj.goods_introduce,
				pics: goodsObj.pics,
			},
			isCollect,
		});
	},

	//点击轮播图 预览大图
	handlePreviewImage(e) {
		// 构造要预览的图片数组
		const urls = this.GoodsInfo.pics.map((v) => v.pics_mid);
		// 接收传递过来的图片url
		const current = e.currentTarget.dataset.url;
		wx.previewImage({
			current, // 当前显示图片的http链接
			urls, // 需要预览的图片http链接列表
		});
	},

	//点击 加入购物车
	handleCartAdd() {
		// 1 获取缓存中的购物车数组
		let cart = wx.getStorageSync("cart") || [];
		// 2 判断 商品对象是否存在于购物车数组中
		let index = cart.findIndex((v) => v.goods_id === this.GoodsInfo.goods_id);
		if (index === -1) {
			// 3 不存在 第一次添加
			this.GoodsInfo.num = 1;
			this.GoodsInfo.checked = true;
			cart.push(this.GoodsInfo);
		} else {
			// 4 已经存在购物车数据 执行 num++
			cart[index].num++;
		}
		// 5 把购物车重新添加到缓存中
		wx.setStorageSync("cart", cart);
		// 6 弹框提示
		wx.showToast({
			title: "加入成功",
			icon: "success",
			mask: true,
		});
	},
	// 点击 切换商品收藏图标
	handleCollect() {
		// 1 获取缓存中的商品收藏数组
		let collect = wx.getStorageSync("collect") || [];
		// 2 判断商品是否被收藏过
		const index = collect.findIndex(
			(v) => v.goods_id === this.GoodsInfo.goods_id
		);
		// 3 当index! = -1 表示已经收藏过了
		let isCollect = false;
		if (index !== -1) {
			// 能找到 已经收藏过了 在数组中删除该商品
			collect.splice(index, 1);
			isCollect = false;
			wx.showToast({
				title: "取消收藏",
				mask: true,
			});
		} else {
			collect.push(this.GoodsInfo);
			isCollect = true;
			wx.showToast({
				title: "收藏成功",
				icon: "success",
				mask: true,
			});
		}
		wx.setStorageSync("collect", collect);
		this.setData({ isCollect });
	},
});
