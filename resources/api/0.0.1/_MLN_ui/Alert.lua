---
--- Generated by MLN Team (https://www.immomo.com)
--- Created by MLN Team.
--- DateTime: 15-01-2020 17:35
---

---
---  警告框
---
---@class Alert @parent class
---@field name string 
local _class = {
	_priveta_class_name = "Alert"}

---
---  构造方法
---
---@return Alert 
function Alert()
	return _class
end

---
---  设置警告框标题
---
---@param title string  标题
---@return Alert 
function _class:title(title)
	return self
end

---
---  获取警告框标题
---
---@return string 警告框标题
function _class:title()
	return "string"
end

---
---  设置警告信息
---
---@param msg string  警告信息
---@return Alert 
function _class:message(msg)
	return self
end

---
---  获取警告信息
---
---@return string 警告信息
function _class:message()
	return "string"
end

---
---  设置取消按钮文案和回调
---
---@param cancelText string  取消按钮文案
---@param callback fun():void
---	 点击取消按钮回调
---@return Alert 
function _class:setCancel(cancelText, callback)
	return self
end

---
---  设置确定按钮文案和回调
---
---@param okText string  确定按钮文案
---@param callback fun():void
---	 点击确定按钮回调
---@return Alert 
function _class:setOk(okText, callback)
	return self
end

---
---  设置多按钮文案和回调
---
---@param buttonsText Array  多按钮文案
---@param callback fun(idx:number):void
---	 function(idx)...end 
---		 回调被点击按钮索引
---@return Alert 
function _class:setButtonList(buttonsText, callback)
	return self
end

---
---  设置单按钮文案和回调
---
---@param singleBtnText string  按钮文案
---@param callback fun():void
---	 点击回调
---@return Alert 
function _class:setSingleButton(singleBtnText, callback)
	return self
end

---
---  展示弹框
---
---@return Alert 
function _class:show()
	return self
end

---
---  销毁弹框
---
---@return Alert 
function _class:dismiss()
	return self
end

return _class