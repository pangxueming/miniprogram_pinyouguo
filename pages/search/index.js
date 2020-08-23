// pages/search/index.js
import { request } from "../../request/index.js";
import regeneratorRuntime from "../../lib/runtime/runtime";

Page({
	data: {
		goods: [],
		isFocus: false,
		// 输入框的value值
		inpValue: "",
	},
	Time: -1,
	handleInput(e) {
		// 1 获取输入框的值
		const { value } = e.detail;
		// 2 检验值的合法性
		if (!value.trim()) {
			clearTimeout(this.Time);
			this.setData({
				isFocus: false,
				goods: [],
			});
			// 值不合法
			return;
		}
		this.setData({ isFocus: true });
		clearTimeout(this.Time);
		this.Time = setTimeout(() => {
			// 3 准备发送请求获取数据
			this.qsearch(value);
		}, 1000);
	},

	//发送请求获取搜索建议 数据
	async qsearch(query) {
		const res = await request({ url: "/goods/qsearch", data: { query } });
		console.log(res);
		this.setData({ goods: res });
	},

	handleCancel() {
		this.setData({ inpValue: "", isFocus: false, goods: [] });
	},
});
