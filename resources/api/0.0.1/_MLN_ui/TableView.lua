---
--- Generated by MLN Team (https://www.immomo.com)
--- Created by MLN Team.
--- DateTime: 15-01-2020 17:35
---

---
---  列表数据展示控件，内容可复用
---
---
---  该控件使用复用的方式加载列表数据，根据数据源组数个数进行回调。支持上拉加载更多，下拉刷新数据。在上拉加载更多数据时，建议必要使用reloadData进行数据刷新，要采用局部刷新的方式进行刷新，效率会更高。
---
---@note  当cell的样式一致时，使用默认初始化方法即可，当cell样式较多时，要采用复用ID的形式进行初始化和赋值操作。另外，iOS默认展示滚动指示条，android默认不展示
---@class TableView : View @parent class
---@field name string 
local _class = {
	_priveta_class_name = "TableView"}

---
---  构造方法
---
---@param refreshEnable boolean  是否开启下拉刷新
---@param loadEnable boolean  是否开启上拉加载更多
---@return TableView 
---@note  刷新功能需桥接对应的代理方法
function TableView(refreshEnable, loadEnable)
	return _class
end

---
---  提供数据与view的绑定；提供点击等事件的回调
---
---
---  adapter提供了本组件的数据源，cell初始化，cell数据绑定，cell事件回调功能。
---
---@param adapter TableViewAdapter  数据与事件适配器
---@return TableView 
---@note  建议TableViewAdapter初始化完后再对TableView进行设置,因为设置adapter会触发刷新，当初始化完毕后设置可以减少刷新次数
function _class:adapter(adapter)
	return self
end

---
---  获取当前tableView绑定的adapter
---
---@return TableViewAdapter 
function _class:adapter()
	return TableViewAdapter()
end

---
---  设置加载更多的阈值，默认为0，取值范围0~1
---
---@param threshold number  阈值，范围0~1
---@return TableView 
---@note  eg：0.5表示还剩一半屏幕高度的页面还未显示时，就触发setLoadingCallback回调
function _class:loadThreshold(threshold)
	return self
end

---
---  获取当前预加载的阈值
---
---@return number 阈值
function _class:loadThreshold()
	return 0
end

---
---  设置内容偏移量
---
---@param offset Point  pt: 内容偏移量坐标, 这里把tableView内容的左上角坐标看做原点origin(0, 0)，pt即为相对origin的偏移量坐标
---@return TableView 
---@note  contentOffset，即内容偏移量，我们把tableView内容的左上角坐标看做原点origin(0, 0),内容偏移量即为当前实现内容的左上角坐标pt与origin之间的差值contentOffset(pt.x - origin.x, pt.y - origin.y)
function _class:contentOffset(offset)
	return self
end

---
---  获取内容偏移量坐标
---
---@return Point 内容偏移量坐标，这里把tableView内容的左上角坐标看做原点origin(0, 0)，pt即为相对origin的偏移量坐标
---@note  contentOffset，即内容偏移量，我们把tableView内容的左上角坐标看做原点origin(0, 0),内容偏移量即为当前实现内容的左上角坐标pt与origin之间的差值contentOffset(pt.x - origin.x, pt.y - origin.y)
function _class:contentOffset()
	return Point()
end

---
---  设置开始滚动的回调
---
---@param callback fun(x:number, y:number):void
---	 回调格式：
---		 ``` 
---		function(number x,number y) 
---		 	 ---x:x轴坐标 
---		 	 ---y:y轴坐标 
---		 end
---		```
---@return TableView 
function _class:setScrollBeginCallback(callback)
	return self
end

---
---  设置滚动中的回调
---
---@param callback fun(x:number, y:number):void
---	 回调格式：
---		 ``` 
---		function(number x,number y) 
---		 	 ---x:x轴坐标 
---		 	 ---y:y轴坐标 
---		 end
---		```
---@return TableView 
function _class:setScrollingCallback(callback)
	return self
end

---
---  设置拖拽结束后的回调
---
---@param callback fun(x:number, y:number):void
---	 回调格式：
---		 ``` 
---		function(number x,number y) 
---		 	 ---x:x轴坐标 
---		 	 ---y:y轴坐标 
---		 end
---		```
---@return TableView 
function _class:setEndDraggingCallback(callback)
	return self
end

---
---  设置开始减速滚动回调
---
---@param callback fun(x:number, y:number):void
---	 回调格式：
---		 ``` 
---		function(number x,number y) 
---		 	 ---x:x轴坐标 
---		 	 ---y:y轴坐标 
---		 end
---		```
---@return TableView 
function _class:setStartDeceleratingCallback(callback)
	return self
end

---
---  设置是否展示滚动指示器
---
---@param show boolean  默认为true
---@return TableView 
---@note  Android部分场景，指示器位置不能划到底部
function _class:showScrollIndicator(show)
	return self
end

---
---  重新回调所有的cell高度，并回调当前屏幕上cell的init和filData方法
---
---@return TableView 
---@note  在数据量特别大的情况下，当数据量较大并且使用heightForCell回调高度时，注意涉及到需要计算的高度要使用lua table进行缓存
function _class:reloadData()
	return self
end

---
---  刷新某一行的数据
---
---@param row number  指定的行
---@param section number  指定的组
---@param animated boolean  是否展示动画
---@return TableView 
---@note  动画效果仅ios有效，并且使用时请勿改变其他cell的内容，否则两端会有差异：android可以更新多个cell，ios只能更新单个
function _class:reloadAtRow(row, section, animated)
	return self
end

---
---  刷新某个组里所有行的数据
---
---@param section number  组数
---@param animated boolean  是否展示动画
---@return TableView 
---@note  动画效果仅ios有效，并且使用时请勿改变其他cell的内容，否则两端会有差异：android可以更新多个cell，ios只能更新单个
function _class:reloadAtSection(section, animated)
	return self
end

---
---  滚动到控件的顶部
---
---@param animated boolean  是否动画滚动到顶部
---@return TableView 
function _class:scrollToTop(animated)
	return self
end

---
---  滚动到某个cell
---
---@param row number  行数
---@param section number  组数
---@param animated boolean  是否动画滚动
---@return TableView 
function _class:scrollToCell(row, section, animated)
	return self
end

---
---  删除某行cell
---
---@param row number  行数
---@param section number  组数
---@return TableView 
function _class:deleteCellAtRow(row, section)
	return self
end

---
---  在指定位置插入cell
---
---@param row number  行数
---@param section number  组数
---@return TableView 
function _class:insertCellAtRow(row, section)
	return self
end

---
---  删除指定位置的cell
---
---@param section number  组数
---@param startRow number  开始行数
---@param endRow number  结束行数
---@return TableView 
function _class:deleteCellsAtSection(section, startRow, endRow)
	return self
end

---
---  在指定位置插入cell
---
---@param section number  组数
---@param startRow number  开始行数
---@param endRow number  结束行数
---@return TableView 
function _class:insertCellsAtSection(section, startRow, endRow)
	return self
end

---
---  在指定位置插入cell
---
---@param row number  行数
---@param section number  组数
---@param animated boolean  是否动画执行
---@return TableView 
function _class:insertRow(row, section, animated)
	return self
end

---
---  删除指定位置的cell
---
---@param row number  行数
---@param section number  组数
---@param animated boolean  是否动画执行
---@return TableView 
function _class:deleteRow(row, section, animated)
	return self
end

---
---  在指定位置范围插入cell
---
---@param section number  组数
---@param startRow number  开始行数
---@param endRow number  结束行数
---@param animated boolean  是否执行动画
---@return TableView 
function _class:insertRowsAtSection(section, startRow, endRow, animated)
	return self
end

---
---  在指定位置范围删除cell
---
---@param section number  组数
---@param startRow number  开始行数
---@param endRow number  结束行数
---@param animated boolean  是否执行动画
---@return TableView 
function _class:deleteRowsAtSection(section, startRow, endRow, animated)
	return self
end

---
---  是否在最顶端
---
---@return boolean 布尔值
function _class:isStartPosition()
	return true
end

---
---  设置是否开启下拉刷新功能
---
---@param enable boolean  是否开启
---@return TableView 
---@note  需要确保对应刷新的handler已经添加,在刷新过程中关闭会导致视图抖动
function _class:refreshEnable(enable)
	return self
end

---
---  获取是否开启了下拉刷新功能，默认false
---
---@return boolean 布尔值
function _class:refreshEnable()
	return true
end

---
---  获取当前是否正在刷新中
---
---@return boolean 布尔值
function _class:isRefreshing()
	return true
end

---
---  开始刷新动作
---
---@return TableView 
function _class:startRefreshing()
	return self
end

---
---  停止刷新动作
---
---@return TableView 
function _class:stopRefreshing()
	return self
end

---
---  设置触发了下拉刷新的回调
---
---@param callback fun():void
---	 回调格式：
---		 ``` 
---		 function() 
---		 end
---		```
---@return TableView 
function _class:setRefreshingCallback(callback)
	return self
end

---
---  设置是否开启上拉加载更多
---
---@param enable boolean  是否开启上拉加载更多
---@return TableView 
---@note  默认false，需要增加刷新对应的handler处理,在加载过程中关闭会导致视图抖动
function _class:loadEnable(enable)
	return self
end

---
---  获取当前是否开启了上拉加载更多功能
---
---@return boolean 
function _class:loadEnable()
	return true
end

---
---  获取是否正在上拉加载中
---
---@return boolean 布尔值
function _class:isLoading()
	return true
end

---
---  停止加载更多的动作
---
---@return TableView 
function _class:stopLoading()
	return self
end

---
---  触发没有更多数据，在TableView的底部会展示没有更多数据的提示
---
---@return TableView 
function _class:noMoreData()
	return self
end

---
---  去除“没有更多数据”的状态，将状态变成普通状态
---
---@return TableView 
function _class:resetLoading()
	return self
end

---
---  触发加载失败
---
---
---  该方法会触发上拉加载更多的加载失败提示，目前是空实现，无任何效果
---
---@return TableView 
function _class:loadError()
	return self
end

---
---  滚动到指定位置
---
---
---  
---
---@param offset Point  指定位置坐标
---@return TableView 
---@note  iOS可用, android sdk version >= 1.5.0可用
function _class:setOffsetWithAnim(offset)
	return self
end

---
---  设置触发了加载更多的回调
---
---@param callback fun():void
---	 回调格式：
---		 ``` 
---		 function() 
---		 end
---		```
---@return TableView 
function _class:setLoadingCallback(callback)
	return self
end

---
---  返回指定位置的cell, 只对屏幕内cell有效
---
---@param section number  组数
---@param row number  行数
---@return table 返回cell表
function _class:cellWithSectionRow(section, row)
	return table()
end

---
---  返回当前屏幕展示的所有cell
---
---@return Array 返回当前屏幕所有cell的数组
function _class:visibleCells()
	return Array()
end

---
---  设置是否可以滚动
---
---@param enable boolean  是否可以滚动
---@return TableView 
function _class:setScrollEnable(enable)
	return self
end

---
---  设置是否开启弹性效果
---
---@param bounces boolean  true:默认值，拖拽有弹性效果 false:关闭弹性效果
---@return TableView 
---@note  iOS私有方法，仅在必要时使用，使用时需判断平台
function _class:i_bounces(bounces)
	return self
end

---
---  获取是否开启弹性效果
---
---@return boolean 是否开启弹性效果
---@note  iOS私有方法，仅在必要时使用，使用时需判断平台
function _class:i_bounces()
	return true
end

---
---  设置是否开启垂直弹性效果
---
---
---  是否开启水平弹性效果，垂直排布时，用于处理ContentSize小于尺寸时的体验优化
---
---@param bounces boolean  true:默认值，拖拽有弹性效果 false:关闭弹性效果
---@return TableView 
---@note  iOS私有方法，仅在必要时使用，使用时需判断平台
function _class:i_bounceVertical(bounces)
	return self
end

---
---  获取是否开启垂直弹性效果
---
---@return boolean 是否开启垂直弹性效果
---@note  iOS私有方法，仅在必要时使用，使用时需判断平台
function _class:i_bounceVertical()
	return true
end

---
---  设置视图宽度
---
---
---  view宽度，可设置MeasurementType的枚举值（SDK>=1.0.5）, 默认是MeasurementType.WRAP_CONTENT
---
---@param size number  宽度值
---@return TableView 

---
---  获取视图宽度
---
---
---  获取视图的宽度
---
---@return number 浮点数，视图宽度

---
---  设置视图高度
---
---
---  view高度，可设置MeasurementType的枚举值（SDK>=1.0.5， 默认是MeasurementType.WRAP_CONTENT
---
---@param size number  高度值
---@return TableView 

---
---  获取视图高度
---
---
---  获取视图的高度值
---
---@return number 浮点数，视图高度

---
---  设置视图的上外边距
---
---
---  设置视图的上外边距，SDK>=1.0.2，只能在LinearLayout中有用
---
---@param value number  间距值
---@return TableView 

---
---  获取视图的上外边距
---
---
---  获取视图的上外边距， SDK>=1.0.2 只能在特殊layout中有用
---
---@return number 间距值

---
---  设置视图的左外边距
---
---
---  设置视图的左外边距，SDK>=1.0.2 只能在特殊layout中有用
---
---@param value number  间距值
---@return TableView 

---
---  获取视图的左外边距
---
---
---  获取视图的左外边距，SDK>=1.0.2 只能在特殊layout中有用
---
---@return number 浮点数，间距值

---
---  设置视图的下外边距
---
---
---  获取视图的下外边距，SDK>=1.0.2 只能在特殊layout中有用，具体请参考[Lua基础布局简介](Lua基础布局简介-Step1)
---
---@param value number  间距值
---@return TableView 

---
---  获取视图的下外边距
---
---
---  获取视图的下外边距，SDK>=1.0.2 只能在特殊layout中有用，具体请参考[Lua基础布局简介](Lua基础布局简介-Step1)
---
---@return number 浮点数，间距值

---
---  设置视图的右外边距
---
---
---  设置视图的右外边距，SDK>=1.0.2 只能在特殊layout中有用，具体请参考[Lua基础布局简介](Lua基础布局简介-Step1)
---
---@param value number  间距值
---@return TableView 

---
---  获取视图的右外边距
---
---
---  获取视图的右外边距，SDK>=1.0.2 只能在特殊layout中有用，具体请参考[Lua基础布局简介](Lua基础布局简介-Step1)
---
---@return number 浮点数，间距值

---
---  约束优先级，范围0-1000
---
---
---  设置约束计算优先级，数值越大越优先计算，占据的可用位置便越大，具体请参考[Lua基础布局简介](Lua基础布局简介-Step1)
---
---@param priority number  范围0-1000
---@return TableView 
---@note  只能在LinearLayout中有用

---
---  获取约束优先级,范围0-1000
---
---
---  获取约束计算优先级，数值越大越优先计算，占据的可用位置便越大，具体请参考[Lua基础布局简介](Lua基础布局简介-Step1)
---
---@return number 约束优先级
---@note  只能在LinearLayout中有用

---
---  约束权重（百分比），范围0-1000
---
---
---  约束权重（百分比）。当子视图A的Weight为3，B的Weight为4时，则A占容器的3/7，B占容器的4/7。
---
---@param weight number  范围0-1000
---@return TableView 
---@note  只能在LinearLayout中有用

---
---  获取约束权重（百分比），范围0-1000
---
---
---  获取约束权重（百分比）。
---
---@return number 约束权重
---@note  只能在LinearLayout中有用

---
---  设置视图的内边距
---
---@param top number  top:距顶部的距离
---@param right number  right:距右侧的距离
---@param bottom number  bottom:距底部的距离
---@param left number  left:距左侧的距离
---@return TableView 

---
---  设置最大宽度约束
---
---
---  设置最大宽度约束，SDK>=1.1.5,配合自适应使用，当宽度为WRAP_CONTENT或MATCH_PARENT时有效
---
---@param number_a number  约束值
---@return TableView 
---@note  配合自适应使用，对于嵌套视图父视图设置该属性，子视图超出父视图范围的情况，可以导致效果和预期不一致，此时需要对父视图使用clipToBounds切割子视图，iOS默认不切割子视图

---
---  设置最小宽度约束
---
---
---  设置视图最小宽度约束，SDK>=1.1.5,配合自适应使用，当宽度为WRAP_CONTENT或MATCH_PARENT时有效
---
---@param value number  约束值
---@return TableView 
---@note  配合自适应使用，对于嵌套视图父视图设置该属性，子视图超出父视图范围的情况，可以导致效果和预期不一致，此时需要对父视图使用clipToBounds切割子视图，iOS默认不切割子视图

---
---  设置最大高度约束
---
---
---  设置视图最大高度约束，SDK>=1.1.5,配合自适应使用，当高度为WRAP_CONTENT或MATCH_PARENT时有效
---
---@param value number  约束值
---@return TableView 
---@note  配合自适应使用，对于嵌套视图父视图设置该属性，子视图超出父视图范围的情况，可以导致效果和预期不一致，此时需要对父视图使用clipToBounds切割子视图，iOS默认不切割子视图

---
---  设置最小高度约束
---
---
---  设置视图最小高度约束，SDK>=1.1.5,配合自适应使用，当高度为WRAP_CONTENT或MATCH_PARENT时有效
---
---@param value number  约束值
---@return TableView 
---@note  配合自适应使用，对于嵌套视图父视图设置该属性，子视图超出父视图范围的情况，可以导致效果和预期不一致，此时需要对父视图使用clipToBounds切割子视图，iOS默认不切割子视图

---
---  返回该视图的父视图对象
---
---
---  返回当前控件的父视图，window返回nil
---
---@return View 父视图
---@note  window返回nil

---
---  添加子视图
---
---
---  将子视图添加到当前视图，该方法只有容器类拥有
---
---@param subView View  任意继承自View的视图实例对象
---@return TableView 

---
---  将视图插入到当前视图的某一个层级
---
---
---  将视图插入到当前视图的某个层级，该方法只有容器类拥有
---
---@param subView View  子视图
---@param idx number  idx:插入的位置，0为最底部，往上递增
---@return TableView 

---
---  从父视图中移除自身
---
---
---  从父视图中移除自身
---
---@return TableView 

---
---  移除当前视图所有的子视图
---
---
---  移除当前视图的所有子视图
---
---@return TableView 

---
---  坐标转换
---
---
---  将自身的点的坐标换算到参考视图的坐标系中
---
---@param otherView View  参考视图
---@param point Point  被转换的坐标点，来自于自身
---@return Point 转换之后的点，位于参考视图
---@note  被转换的坐标来自于自身

---
---  坐标转换
---
---
---  将参考view的点坐标换算到自身的坐标系中
---
---@param otherView View  参考视图
---@param point Point  被转换的坐标点，来自于参考视图
---@return Point 转换后的坐标点，位于自身
---@note  被转换的坐标来自于参考视图

---
---  布局相关
---
---
---  设置当前view吸附状态
---
---@param gravity Gravity  吸附效果，枚举参考[Gravity](Gravity)，布局参考[Lua基础布局简介](Lua基础布局简介-Step1)
---@return TableView 
---@note  SDK>=1.0.2 只能在特殊layout中有用，eg: LinearLayout，默认吸附左上角

---
---  坐标转换
---
---
---  将自身的点的坐标换算到参考view的坐标中, 在可滚动视图中，与android一致，表现为屏幕上显示的相对坐标
---
---@param otherView View  参考视图
---@param point Point  被转换的点
---@return Point 转换后的点

---
---  设置视图透明度，范围 0 ~ 1
---
---@param value number  透明值：0.0~1.0
---@return TableView 
---@note  在iOS,当透明度小于0.1之后，将无法响应事件

---
---  获取视图透明度
---
---@return number 透明值

---
---  设置视图是否隐藏，默认为false，不隐藏。该方法隐藏后依然占位，如果不想占位，请使用gone
---
---@param isHidden boolean  是否隐藏，默认false
---@return TableView 

---
---  获取视图是否隐藏
---
---@return boolean 布尔值

---
---  设置视图是否隐藏,开启后，视图在LinearLayout中将不占位置
---
---
---  设置当前视图是否隐藏且不占位，SDK>=1.2.1,在新布局中有效，hidden方法是隐藏但是占位
---
---@param isGone boolean  是否隐藏,传true隐藏，传false展示
---@return TableView 

---
---  获取视图是否隐藏
---
---
---  获取当前视图是否是隐藏且不占位，SDK>=1.2.1,在新布局有效
---
---@return boolean 布尔值，是否隐藏

---
---  设置视图的边框宽度
---
---@param value number  边框宽度
---@return TableView 

---
---  获取视图的边框宽度值
---
---@return number 浮点数，视图宽度

---
---  设置视图的边框颜色
---
---@param color Color  颜色，默认为黑色
---@return TableView 

---
---  获取视图的边框颜色
---
---@return Color 颜色

---
---  设置视图的背景颜色
---
---@param color Color  颜色
---@return TableView 

---
---  获取视图的背景颜色
---
---@return Color 颜色

---
---  设置视图的圆角半径
---
---@param radius number  半径值
---@return TableView 
---@note  iOS默认不切割，使用[CornerManager](CornerManager)开启自动切割，调用clipToBounds手动控制是否切割，Android默认切割超出部分

---
---  获取视图的圆角半径,默认返回左上角
---
---@return number 浮点数，半径值

---
---  设置圆角半径，根据不同的位置
---
---@param radius number  圆角半径
---@param corner RectCorner  TOP_LEFT:左上 TOP_RIGHT:右上 BOTTOM_LEFT:左下 BOTTOM_RIGHT:右下 , @see RectCorner
---@return TableView 
---@note  不能与阴影连用

---
---  根据不同的方向获取视图圆角半径
---
---@param corner RectCorner  TOP_LEFT:左上 TOP_RIGHT:右上 BOTTOM_LEFT:左下 BOTTOM_RIGHT:右下 , @see RectCorner
---@return number 圆角半径，默认返回左上角

---
---  设置子视图是否在view的边界内绘制
---
---@param isClip boolean  是否开启边界内绘制
---@return TableView 
---@note  Android：clipToBounds只能对parent使用，parent会遍历子View，让所有子View都统一clipToBounds。注：parent自己不生效，需要调用parent的parent才行。
---		IOS：clipToBounds只能对View自己生效

---
---  设置圆角后，是否切割，默认切割false；优化性能使用
---
---
---  <# nil #
---
---@param noClip boolean  是否切割
---@return TableView 
---@note  iOS空实现，仅Android可用，Android sdk1.5.0 默认切割子View。可以改用addCornerMask()绘制圆角遮罩

---
---  以覆盖一张中间透明周边含有指定颜色圆角的图片的方式实现圆角效果
---
---
---  在iOS上， 切割圆角在一定情况下会触发离屏渲染等问题，在大量圆角且可滚动的页面中，可能会有明显的掉帧体验（低端设备比较明显)，为了优化这种性能问题，所以提供该方案来解决类似的性能问题。
---
---@param cornerRadius number  cornerRadius:圆角半径
---@param maskColor Color  maskColor:圆角遮罩的颜色
---@param corners RectCorner  指定含有圆角的位置，并且可以通过与方式指定多个圆角，具体枚举值见[RectCorner](RectCorner)
---@return TableView 
---@note  这是一种提高圆角切割性能的方案，对于子视图超出父视图显示的情况，不建议使用该方式。

---
---  设置线性渐变色
---
---@param startColor Color  start:开始颜色
---@param endColor Color  end:结束颜色
---@param isVertical boolean  vertical：true代表从上到下，false代表从左到右
---@return TableView 

---
---  设置线性渐变色，支持正向反向
---
---@param startColor Color  开始颜色
---@param endColor Color  结束颜色
---@param type GradientType  gradientType：GradientType.LEFT_TO_RIGHT 值为1 代表从左到右， GradientType.RIGHT_TO_LEFT 值为2 代表从右到左， GradientType.TOP_TO_BOTTOM 值为3 代表从上到下，GradientType.BOTTOM_TO_TOP代 值为4 表从下到上
---@return TableView 

---
---  设置当前视图是否可以响应用户的点击，触摸等交互事件
---
---@param usable boolean  是否可以用户交互
---@return TableView 
---@note  该属性关闭后，不仅会导致自身无法响应事件，而且子视图也无法响应事件。所以当业务中遇到某些控件无法响应，可以考虑是否是自身或父视图禁用了用户交互。

---
---  获取当前视图是否可以响应用户的点击，触摸等交互事件
---
---
---  <# nil #
---
---@return boolean 布尔值

---
---  设置点击事件回调
---
---@param callback fun():void
---	 回调格式：
---		 ``` 
---		 function() 
---		 end 
---		 ```
---@return TableView 
---@note  iOS采用的是手势监听，所以要注意事件冲突，在冲突时可使用touchEnd方法

---
---  设置长按回调
---
---@param callback fun():void
---	 回调格式：
---		 ``` 
---		 function() 
---		 end 
---		 ```
---@return TableView 

---
---  设置有坐标的点击回调
---
---@param callback fun(x:number, y:number):void
---	 回调格式：
---		 ``` 
---		 function(number x,number y) 
---		 	 ---x:x轴坐标 
---		 	 ---y:y轴坐标 
---		 end 
---		 ```
---@return TableView 
---@note  已废弃，在需要 回调点击坐标的情况下请结合实际场景使用touchBegin或者touchEnd方法

---
---  获取是否有焦点
---
---
---  获取当前视图是否有焦点，在iOS端理解为第一响应者
---
---@return boolean true是否焦点

---
---  判断是否能获取焦点
---
---
---  获取当前视图是否可以获得焦点
---
---@return boolean true为可以获得焦点

---
---  获取焦点
---
---
---  请求焦点，即请求成为第一响应者
---
---@return TableView 

---
---  取消焦点
---
---
---  取消焦点，即取消第一响应者
---
---@return TableView 

---
---  触摸开始的回调
---
---
---  设置当触摸开始时的回调，并回调坐标值
---
---@param callback fun(x:number, y:number):void
---	 回调格式：
---		 ``` 
---		 function(number x,number y) 
---		 	 ---x:x轴坐标 
---		 	 ---y:y轴坐标 
---		 end 
---		 ```
---@return TableView 

---
---  触摸移动中的回调
---
---
---  设置触摸移动中的回调，并回调坐标值
---
---@param callback fun(x:number, y:number):void
---	 回调格式：
---		 ``` 
---		 function(number x,number y) 
---		 	 ---x:x轴坐标 
---		 	 ---y:y轴坐标 
---		 end 
---		 ```
---@return TableView 
---@note  该回调会在移动中多次调用

---
---  触摸结束后的回调
---
---
---  设置触摸结束后的回调，并回调坐标值
---
---@param callback fun(x:number, y:number):void
---	 回调格式：
---		 ``` 
---		 function(number x,number y) 
---		 	 ---x:x轴坐标 
---		 	 ---y:y轴坐标 
---		 end 
---		 ```
---@return TableView 
---@note  该坐标是手指抬起时的坐标

---
---  触摸取消的回调
---
---
---  设置触摸取消时的回调，并回调坐标值
---
---@param callback fun(x:number, y:number):void
---	 回调格式：
---		 ``` 
---		 function(number x,number y) 
---		 	 ---x:x轴坐标 
---		 	 ---y:y轴坐标 
---		 end 
---		 ```
---@return TableView 
---@note  该回调在用户移出当前视图时会调用

---
---  触摸开始时的回调
---
---
---  增强版触摸开始时回调，会在回调中返回额外的信息
---
---@param callback fun(map:table):void
---	 回调格式：
---		 ``` 
---		 function(map)  
---		 	 ---map参数如下：
---		 	 ---x:触摸时相对父控件x坐标值 
---		 	 ---y:触摸时相对父控件y坐标值 
---		 	 ---screenX:触摸时相对屏幕x坐标 
---		 	 ---screenY:触摸时相对屏幕Y坐标 
---		 	 ---target:触摸到的view 
---		 	 ---timeStamp:触摸时间（单位s）
---		 end 
---		 ```
---@return TableView 

---
---  触摸移动时的回调
---
---
---  增强版触摸移动中回调，会在回调中返回额外的信息
---
---@param callback fun(map:table):void
---	 回调格式：
---		 ``` 
---		 function(map)  
---		 	 ---map参数如下：
---		 	 ---x:触摸时相对父控件x坐标值 
---		 	 ---y:触摸时相对父控件y坐标值 
---		 	 ---screenX:触摸时相对屏幕x坐标 
---		 	 ---screenY:触摸时相对屏幕Y坐标 
---		 	 ---target:触摸到的view 
---		 	 ---timeStamp:触摸时间（单位s）
---		 end 
---		 ```
---@return TableView 

---
---  触摸结束时的回调
---
---
---  增强版触摸结束的回调，会在回调中返回额外的信息
---
---@param callback fun(map:table):void
---	 回调格式：
---		 ``` 
---		 function(map)  
---		 	 ---map参数如下：
---		 	 ---x:触摸时相对父控件x坐标值 
---		 	 ---y:触摸时相对父控件y坐标值 
---		 	 ---screenX:触摸时相对屏幕x坐标 
---		 	 ---screenY:触摸时相对屏幕Y坐标 
---		 	 ---target:触摸到的view 
---		 	 ---timeStamp:触摸时间（单位s）
---		 end 
---		 ```
---@return TableView 

---
---  触摸取消时的回调
---
---
---  增强版触摸取消时的回调，会在回调中返回额外的信息
---
---@param callback fun(map:table):void
---	 回调格式：
---		 ``` 
---		 function(map)  
---		 	 ---map参数如下：
---		 	 ---x:触摸时相对父控件x坐标值 
---		 	 ---y:触摸时相对父控件y坐标值 
---		 	 ---screenX:触摸时相对屏幕x坐标 
---		 	 ---screenY:触摸时相对屏幕Y坐标 
---		 	 ---target:触摸到的view 
---		 	 ---timeStamp:触摸时间（单位s）
---		 end 
---		 ```
---@return TableView 

---
---  设置是否开启键盘出现后视图自动位移
---
---@param isOpen boolean  是否开启
---@return TableView 
---@note  已废弃

---
---  是否开启键盘出现后视图自动位移，并可设置偏移量
---
---@param isOpen boolean  是否开启
---@param offset number  偏移量
---@return TableView 
---@note  已废弃

---
---  锚点，动画作用的位置，从0~1的比例，在视图中对应位置
---
---@param x number  横向位置，范围0~1
---@param y number  竖向位置，范围0~1
---@return TableView 

---
---  旋转视图,可以控制绝对旋转还是叠加旋转
---
---@param rotate number  旋转角度值，0~360
---@param add boolean  是否叠加，默认false
---@return TableView 
---@note  已废弃，请使用rotation方法

---
---  旋转视图
---
---
---  旋转视图，范围-360~360，默认在视图旋转状态基础上进行叠加旋转
---
---@param rotate number  旋转角度值，0~360
---@param notAdding boolean  基于当前状态，旋转angle弧度 SDK>=1.2.2 ,@notAdding 是否不叠旋转 SDK>=1.5.1
---@return TableView 

---
---  缩放视图
---
---
---  设置视图横向和纵向的缩放比例
---
---@param x number  x轴缩放倍数0~max
---@param y number  y轴缩放倍数0~max
---@param add boolean  设置当前视图缩放是否从初始状态开始，默认false在当前视图缩放比例基础上进行缩放
---@return TableView 
---@note  参数c是iOS平台隐藏参数，默认不要传

---
---  位移视图
---
---
---  设置视图的横向和纵向的偏移量
---
---@param x number  x轴位移量（单位是pt，dp）
---@param y number  y轴位移量（单位是pt，dp）
---@param add boolean  设置当前视图位移是否从初始状态开始，默认false在当前视图位移基础上进行位移
---@return TableView 
---@note  参数c是iOS隐藏属性，默认不要传

---
---  重置Transform
---
---
---  当我们在设置了Transform属性（rotation，scale，translation）之后想要重置到初始化状态时，可以调用该方法
---
---@return TableView 

---
---  移除视图上的帧动画
---
---
---  移除视图上设置过的帧动画，即Animation动画
---
---@return TableView 

---
---  视图截屏
---
---
---  截图方法，当业务有需要将当前视图的内容保存下来的时候，可以调用该方法进行截图
---
---@param filename string  保存图片的文件名
---@return string 图片路径
---@note  请在界面绘制完毕后，再进行截图操作

---
---  添加高斯模糊
---
---
---  为当前视图增加高斯模糊效果
---
---@return TableView 
---@note  iOS有效，Android空实现

---
---  移除高斯模糊
---
---
---  移除当前视图上增加的高斯模糊效果
---
---@return TableView 
---@note  iOS有效，Android空实现

---
---  设置点击时的效果
---
---
---  开启视图的高亮点击效果，通常用在cell的点击效果上
---
---@param open boolean  是否打开
---@return TableView 
---@note  Android上为波纹效果，iOS上是一种灰色高亮

---
---  设置是否开启点击收起键盘功能
---
---
---  设置是否开启点击收起键盘功能，只能当子视图唤起的键盘，才能触发收起
---
---@param open boolean  是否开启点击取消编辑功能
---@return TableView 

---
---  将当前视图的子视图移动到所有子视图的最上层
---
---
---  在添加子视图时，默认是新添加的视图在已有的上层，当业务需要将最早添加的视图移动到最上层是，使用该方法
---		
---		⚠️LinearLayout不可使用该方法。️Android不能实现将某个View放入图层下方或上方，View可以做到是通过将子视图加入顺序调换实现，LinearLayout若调换顺序，将导致布局出错
---
---@param subView View  子视图
---@return TableView 
---@note  LinearLayout不可使用该方法。️Android不能实现将某个View放入图层下方或上方，View可以做到是通过将子视图加入顺序调换实现，LinearLayout若调换顺序，将导致布局出错

---
---  将子视图放到最下层
---
---
---  在添加子视图是，默认新添加的视图在最上层，当业务需要将新添加的视图移动到最下层时，使用该方法
---		
---		⚠️LinearLayout不可使用该方法。️Android不能实现将某个View放入图层下方或上方，View可以做到是通过将子视图加入顺序调换实现，LinearLayout若调换顺序，将导致布局出错
---
---@param subView View  子视图
---@return TableView 
---@note  LinearLayout不可使用该方法。️Android不能实现将某个View放入图层下方或上方，View可以做到是通过将子视图加入顺序调换实现，LinearLayout若调换顺序，将导致布局出错

---
---  给视图设置背景图片
---
---@param imageName string  图片名字，不带后缀
---@return TableView 
---@note  背景图片只支持本地资源

---
---  给视图添加矩形或圆形阴影
---
---@param shadowColor Color  阴影颜色，Android不可修改
---@param shadowOffset Size  阴影偏移量
---@param shadowRadius number  阴影半径
---@param opacity number  阴影透明度0~1.0
---@param isOval boolean  是否是圆形阴影，默认为false
---@return TableView 

---
---  设置视图阴影
---
---@param shadowOffset Size  阴影偏移量
---@param shadowRadius number  阴影半径，数值越大，阴影越大，默认3
---@param opacity number  阴影透明度0~1.0
---@return TableView 
---@note  1.cornerRadius+Shadow 使用时:
---		 1)不能对同一个View用ClipToBounds()，否则无效;
---		 2)Android 给子View使用Shadow，子View不能充满容器，否则阴影被Parent切割
---		 2.setCornerRadiusWithDirection 禁止与Shadow连用;
---		 3.阴影的View有Z轴高度，会遮挡没有Z轴高度的同层View
---		

---
---  子视图从父视图移除时的回调
---
---
---  当这个视图从父视图移除，或者当该视图的父视图从祖父视图移除时都会回调
---
---@param callback fun():void
---	 回调格式：
---		 ``` 
---		 function()  
---		  end 
---		 ```
---@return TableView 

---
---  开始画布动画(CanvasAnimation)，不会影响布局
---
---@param animation CanvasAnimation  画布动画
---@return TableView 
---@note  不可使用FrameAnimation和Animation

---
---  停止View里的画布动画
---
---@return TableView 
---@note  非画布动画不会停止

return _class