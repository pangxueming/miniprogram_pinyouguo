/**
 * 1 获取用户的收货地址
 *   1 绑定点击事件
 *   2 调用小晨旭内置api 获取用户的收货地址 	wx.chooseAddress
 * 2 获取 用户 对小程序 所授权 获取收货地址的 权限 状态 scope
 *   1 假设用户 点击获取收货地址的提示坤 确定 authSetting scope.address
 *     scope 值 true
 *   2 假设用户 从来没有调用过收货地址api
 *     scope 值 undefined
 *   3 假设用户 点击获取收货地址的提示框 取消
 *     scope 值 false
 *     1 诱导用户 自己 打开授权设置页面(wx.openSetting) 当用户重新给予 获取地址权限的时候
 *     2 获取收货地址
 *   4 把获取到的收货地址 存入到 本地存储中
 * 3 页面加载完毕
 *   0 onLoad onShow
 *   1 获取本地储存的数据
 *   2 把数据设置给data中的一个变量
 * 4 onShow
 *   0 回到商品详情页面 第一次添加商品的时候 手动添加了属性
 *     1 num=1;
 *     2 checked=true;
 *   1 获取缓存中的购物车商品信息
 *   2 把购物车的数据 填充到data中
 * 5 全选的实现 数据的展示
 *   1 onShow 获取缓存的购物车数组
 *   2 格局购物超级中的商品数据 所有的商品都被选中 checked=true 全选就被选中
 * 6 总价格和总数量
 *   1 都需要商品被选中 我们才能拿它来计算
 *   2 获取购物车数组
 *   3 遍历
 *   4 判断商品是否被选中
 *   5 总价格 += 商品的单价 * 商品的总数量
 *   5 总数量 += 商品的数量
 *   6 把计算后的价格和数量 设置返回data中即可
 * 7 商品选中
 *   1 绑定change事件
 *   2 获取到被修改的商品对象
 *   3 商品对象的选中状态 取反
 *   4 重新填充回data中和缓存中
 *   5 重新计算全选 总价格 总数量
 * 8 全选和反选
 *   1 全选复选框绑定事件 change
 *   2 获取 data中的全选变量 allChecked
 *   3 直接取反 allChecked=!allChecked
 *   4 遍历购物车数组 让里面 商品 选中状态跟随 allChecked 改变而改变
 *   5 把购物车数组 和 allChecked 重新设置回 data 把购物车把购物车重新设置回 缓存中
 *
 *  9 商品数量的编辑
 *    1 "+" "-" 按钮 绑定同一个点击事件 区分的关键是 自定义属性
 *      1 "+" "+1"
 *      2 "-" "-1"
 *    2 传递被点击的商品 id 为 goods_id
 *    3 获取data中的购物车数组 来获取需要被修改的商品对象
 * 		4 当购物车的熟练 = 1 同时用户点击 "-"
 * 			弹窗提示(wx.showModal) 询问用户 是否要删除
 *  		 1 确定 直接执行删除
 * 			 2 取消 什么都不做
 *    4 直接修改商品对象的数量 num
 *    5 把cart数组 重新设置回缓存中 和 data 中 this.setCart()
 * 10 点击结算
 *    1 判断有没有收货地址信息
 * 		2 判断用户有没有选购商品
 * 		3 经过以上的验证 跳转到支付页面
 */

import {
	getSetting,
	chooseAddress,
	openSetting,
	showModal,
	showToast,
} from "../../utils/asyncWx.js";
import regeneratorRuntime from "../../lib/runtime/runtime";

Page({
	data: {
		address: {},
		cart: [],
		allChecked: false,
		totalPrice: 0,
		totalNum: 0,
	},
	onShow() {
		// 1 获取本地储存中的收货地址
		const address = wx.getStorageSync("address");
		// 2 获取缓存中的购物车数据
		const cart = wx.getStorageSync("cart") || [];
		this.setCart(cart);
		this.setData({ address });
	},

	//点击获取收货地址
	async handleChooseAddress() {
		try {
			// 1 获取 权限转台
			const res1 = await getSetting();
			// 2 判断 权限转台
			const scopeAddress = res1.authSetting["scope.address"];
			if (scopeAddress === false) {
				// 3 诱导开启权限
				await openSetting();
			}
			// 4 获取收货地址 api
			let address = await chooseAddress();
			address.all =
				address.provinceName +
				address.cityName +
				address.countyName +
				address.detailInfo;
			//存入到本地存储中
			wx.setStorageSync("address", address);
		} catch (err) {
			console.log(err);
		}
	},

	//商品选中
	handleItemChange(e) {
		// 1 获取被修改的商品的id
		const goods_id = e.currentTarget.dataset.id;
		// 2 获取购物车数组
		let { cart } = this.data;
		// 3 找到被修改的商品对象
		const index = cart.findIndex((v) => v.goods_id === goods_id);
		// 4 选中状态 取反
		cart[index].checked = !cart[index].checked;
		this.setCart(cart);
	},

	// 设置购物车状态的同时 重新计算 底部工具栏的数据 全选 总价格 购买的数量
	setCart(cart) {
		let totalPrice = 0;
		let totalNum = 0;
		let allChecked = true;
		cart.forEach((v) => {
			if (v.checked) {
				totalPrice += v.num * v.goods_price;
				totalNum += v.num;
			} else {
				allChecked = false;
			}
		});
		//判断数组是否为空
		allChecked = cart.length != 0 ? allChecked : false;
		this.setData({
			cart,
			totalPrice,
			totalNum,
			allChecked,
		});

		wx.setStorageSync("cart", cart);
	},

	//商品全选功能
	handleItemAllChecked() {
		// 1 获取data中的数据
		let { cart, allChecked } = this.data;
		// 2 修改值
		allChecked = !allChecked;
		// 3 循环修改cart中的商品 修改商品的选中状态
		cart.forEach((v) => (v.checked = allChecked));
		// 4 把修改完的值 重新填充回data或者缓存中
		this.setCart(cart);
	},

	//商品数量的编辑功能
	async handleItemNumEdit(e) {
		// 1 获取传递过来的参数
		const { id, operation } = e.currentTarget.dataset;
		console.log(id, operation);
		// 2 获取购物车数组
		const { cart } = this.data;
		// 3 获取需要修改的商品的索引
		const index = cart.findIndex((v) => v.goods_id === id);
		// 4 判断是否执行删除操作
		if (cart[index].num === 1 && operation === -1) {
			const res = await showModal({ content: "是否删除当前商品?" });
			if (res.confirm) {
				cart.splice(index, 1);
				this.setCart(cart);
			}
		} else {
			// 4 进行数量修改
			cart[index].num += operation;
			// 5 把数据设置回 data 和 缓存中
			this.setCart(cart);
		}
	},

	// 点击 结算 实现 支付
	async handlePay() {
		// 1 判断收货地址
		const { address, totalNum } = this.data;
		if (!address.userName) {
			await showToast({ title: "请选择收货地址" });
			return;
		}
		// 2 判断用户有没有选择商品
		if (totalNum === 0) {
			await showToast({ title: "您还没有选择商品" });
			return;
		}
		// 3 跳转到支付页面
		wx.navigateTo({
			url: "/pages/pay/index",
		});
	},

	// 1 获取 权限状态
	// wx.getSetting({
	// 	success: (result) => {
	// 		// 2 获取权限状态 只要是发现一些 属性名很怪异的时候 都要使用 ['key'] 形式来获取属性值
	// 		const scopeAddress = result.authSetting["scope.address"];
	// 		if (scopeAddress === true || scopeAddress === undefined) {
	// 			wx.chooseAddress({
	// 				success: (result2) => {
	// 					console.log(result2);
	// 				},
	// 			});
	// 		} else {
	// 			// 3 用户 以前拒绝过授权 先诱导用户打开授权页面
	// 			wx.openSetting({
	// 				success: (result3) => {
	// 					// 4 调用获取收货地址的代码
	// 					wx.chooseAddress({
	// 						success: (result2) => {
	// 							console.log(result2);
	// 						},
	// 					});
	// 				},
	// 			});
	// 		}
	// 	},
	// });
});
