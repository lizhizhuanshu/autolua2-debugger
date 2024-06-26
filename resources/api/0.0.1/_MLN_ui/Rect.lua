---
--- Generated by MLN Team (https://www.immomo.com)
--- Created by MLN Team.
--- DateTime: 15-01-2020 17:35
---

---
---  用来描述视图控件的坐标和宽高
---
---@class Rect @parent class
---@field name string 
local _class = {
	_priveta_class_name = "Rect"}

---
---  创建Rect对象
---
---@param x number  横坐标
---@param y number  纵坐标
---@param width number  宽
---@param height number  高
---@return Rect 
function Rect(x, y, width, height)
	return _class
end

---
---  设置坐标位置，即x轴y轴坐标
---
---@param point Point  包含横竖坐标，详情见[Point](Point)
---@return Rect 
function _class:point(point)
	return self
end

---
---  获取横竖坐标，即x轴y轴坐标
---
---@return Point 包含横竖坐标，详情见[Point](Point)
function _class:point()
	return Point()
end

---
---  设置宽高
---
---@param size Size  包含宽和高，详情见[Size](Size)
---@return Rect 
function _class:size(size)
	return self
end

---
---  获取宽高，详情见[Size](Size)
---
---@return Size 宽高，详情见[Size](Size)
function _class:size()
	return Size()
end

---
---  设置横坐标
---
---@param x number  横坐标
---@return Rect 
function _class:x(x)
	return self
end

---
---  获取横坐标
---
---@return number 横坐标
function _class:x()
	return 0
end

---
---  设置纵坐标
---
---@param y number  纵坐标
---@return Rect 
function _class:y(y)
	return self
end

---
---  获取纵坐标
---
---@return number 纵坐标
function _class:y()
	return 0
end

---
---  设置宽
---
---@param width number  宽
---@return Rect 
function _class:width(width)
	return self
end

---
---  获取宽
---
---@return number 宽
function _class:width()
	return 0
end

---
---  设置高度
---
---@param height number  高度
---@return Rect 
function _class:height(height)
	return self
end

---
---  获取高度
---
---@return number 高度
function _class:height()
	return 0
end

return _class