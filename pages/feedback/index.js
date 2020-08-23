// pages/feedback/index.js
Page({
	data: {
		tabs: [
			{ id: 0, value: "体验问题", isActive: true },
			{ id: 1, value: "商品、商家投诉", isActive: false },
		],
		chooseImgs: [],
		// 文本域的内容
		textVal: "",
	},

	//外网的图片的路径数组
	UpLoadImgs: [],

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

	//点击+，选择图片事件
	handleChooseImg() {
		// 2 调用小程序内置选择图片 api
		wx.chooseImage({
			count: 9,
			sizeType: ["original", "compressed"],
			sourceType: ["album", "camera"],
			success: (result) => {
				this.setData({
					chooseImgs: [...this.data.chooseImgs, ...result.tempFilePaths],
				});
			},
			fail: () => {},
			complete: () => {},
		});
	},

	// 点击 删除图片
	handleRemoveImg(e) {
		const { index } = e.currentTarget.dataset;
		console.log(index);
		let { chooseImgs } = this.data;
		chooseImgs.splice(index, 1);
		this.setData({ chooseImgs });
	},

	// 文本域的输入事件
	handleTextInput(e) {
		this.setData({
			textVal: e.detail.value,
		});
	},
	// 提交按钮的点击
	handleFormSubmit() {
		// 1 获取文本框的内容
		const { textVal, chooseImgs } = this.data;
		// 2 合法性的检验
		if (!textVal.trim()) {
			//不合法
			wx.showToast({
				title: "输入不合法",
				icon: "none",
				mask: true,
			});
			return;
		}
		wx.showLoading({
			title: "正在上传中",
			mask: true,
		});
		if (chooseImgs.length != 0) {
			chooseImgs.forEach((v, i) => {
				wx.uploadFile({
					url: "https://img.coolcr.cn/api/upload",
					filePath: v,
					name: "image",
					success: (result) => {
						console.log(result);
						const { url } = JSON.parse(result.data).data;
						this.UpLoadImgs.push(url);
						// 所有的图片上传完毕才触发
						if (i === chooseImgs.length - 1) {
							wx.hideLoading();
							console.log("把 数据 提交到后台");
							// 提交都成功了 重置页面
							this.setData({ textVal: "", chooseImgs: [] });
							// 返回上一个页面
							wx.navigateBack({
								delta: 1,
							});
						}
					},
				});
			});
		} else {
			wx.hideLoading();
			console.log("只是提交了文本");
			wx.navigateBack({
				delta: 1,
			});
		}
	},
});
