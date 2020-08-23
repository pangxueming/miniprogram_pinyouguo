/**
 * 1 用户上滑页面 滚动条触底 开始加载下一页数据
 * 	 1 找到滚动条触底事件
 *   2 判断还有没有下一页数据
 *   3 加入没有下一页数据 弹出一个提示
 * 	 2 加入还有下一页数据 来加载下一页数据
 */
import { request } from "../../request/index.js";
import regeneratorRuntime from "../../lib/runtime/runtime";
Page({
	data: {
		tabs: [
			{ id: 0, value: "综合", isActive: true },
			{ id: 1, value: "销量", isActive: false },
			{ id: 2, value: "价格", isActive: false },
		],
		goodsList: [],
	},
	//接口要的数据
	QueryParams: {
		query: "",
		cid: "",
		paganum: 1,
		pagesize: 10,
	},
	//总页数
	totalPages: 1,
	onLoad: function (options) {
		this.QueryParams.cid = options.cid || "";
		this.QueryParams.query = options.query || "";
		this.getGoodsList();
	},

	//获取商品列表数据
	async getGoodsList() {
		const res = await request({ url: "/goods/search", data: this.QueryParams });
		const { total } = res;
		this.totalPages = Math.ceil(total / this.QueryParams.pagesize);
		this.setData({
			goodsList: [...this.data.goodsList, ...res.goods],
		});
		//关闭下拉刷新窗口
		setTimeout(() => {
			wx.stopPullDownRefresh();
		}, 1000);
	},

	//标题点击事件 从子组件传递过来的
	handleTabsItemChange(e) {
		// 1 获取被点击的标题索引
		const { index } = e.detail;
		// 2 修改原数组
		const { tabs } = this.data;
		tabs.forEach((v, i) =>
			i === index ? (v.isActive = true) : (v.isActive = false)
		);
		//3 赋值到data中
		this.setData({
			tabs,
		});
	},
	//页面触底事件
	onReachBottom() {
		if (this.QueryParams.paganum >= this.totalPages) {
			wx.showToast({
				title: "没有更多了",
				icon: "none",
			});
		} else {
			this.QueryParams.paganum++;
			this.getGoodsList();
		}
	},
	//
	onPullDownRefresh() {
		//重置商品数据
		this.setData({
			goodsList: [],
		});
		// 重置页码
		this.QueryParams.paganum = 1;
		// 发送请求
		this.getGoodsList();
	},
});
