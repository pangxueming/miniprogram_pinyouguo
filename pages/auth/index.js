import { login } from "../../utils/asyncWx.js";
import { request } from "../../request/index.js";
import regeneratorRuntime from "../../lib/runtime/runtime";

// pages/auth/index.js
Page({
	//
	async handleGetUserInfo(e) {
		try {
			// 1 获取用户信息
			const { rawData, signature, encryptedData, iv } = e.detail;
			const loginParams = { rawData, signature, encryptedData, iv };
			// 2 获取小程序登录成功后的code
			const { code } = await login();
			console.log(code);
			// 3 发送请求 获取用户的token
			let token = await request({
				url: "/users/wxlogin",
				data: loginParams,
				method: "post",
			});
			token =
				"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjIzLCJpYXQiOjE1NjQ3MzAwNzksImV4cCI6MTAwMTU2NDczMDA3OH0.YPt-XeLnjV-_1ITaXGY2FhxmCe4NvXuRnRB8OMCfnPo";

			// 4 存储token到缓存中 同时跳转到上一个页面
			wx.setStorageSync("token", token);
			wx.navigateBack({
				delta: 1,
			});
		} catch (error) {
			console.log(error);
		}
	},
});
