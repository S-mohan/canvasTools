import '../scss/canvastools.scss'
import './closet'
import utils from './utils'
import Template from './template'

//stroke类型操作
const STROKE_TYPES = ['rect', 'ellipse', 'brush', 'arrow', 'mosaic', 'font', 'rubber']

//默认颜色
const STROKE_DEFAULT_COLOR = '#fb3838'

//默认画笔大小
const STROKE_DEFAULT_WIDTH = 2

//输入框padding值
const TEXT_HELPER_PADDING = 2

//输入框默认字体大小
//以设置的字体大小为准，改值仅做辅助值
const TEXT_HELPER_FONT_SIZE = 12

//字体
const TEXT_FONT_FAMILY = '"Helvetica Neue",Helvetica,Arial,"Hiragino Sans GB","Hiragino Sans GB W3","WenQuanYi Micro Hei",sans-serif'


/**
 * 创建画笔+颜色容器
 * @param  {Number} stroke [默认画笔]
 * @param  {String} color  [默认颜色]
 * @return {HTMLElement}   
 */
const buildStrokePanel = (stroke = STROKE_DEFAULT_COLOR, color = STROKE_DEFAULT_COLOR) => {
	const el = document.createElement('div')
	el.className = 'canvas-tools__panel js-panel__stroke'
	el.innerHTML = Template.getStrokePanel(stroke) + Template.getColorPanel(color)
	return el
}

/**
 * 创建字号+颜色容器
 * @param  {Number} fontSize [默认字号]
 * @param  {String} color  [默认颜色]
 * @return {HTMLElement}   
 */
const buildFontPanel = (fontSize = TEXT_HELPER_FONT_SIZE, color = STROKE_DEFAULT_COLOR) => {
	const el = document.createElement('div')
	el.className = 'canvas-tools__panel js-panel__font'
	el.innerHTML = Template.getFontPanel(fontSize) + Template.getColorPanel(color)
	return el
}


/**
 * 创建辅助文本输入框
 * @return {HTMLElement}
 */
const getTextHelper = () => {
	let $textHelper = document.getElementById('canvas-tools-input')
	if (!$textHelper) {
		$textHelper = document.createElement('div')
		$textHelper.setAttribute('contenteditable', 'plaintext-only')
		$textHelper.setAttribute('spellcheck', 'false')
		$textHelper.setAttribute('id', 'canvas-tools-input')
		$textHelper.className = 'canvas-tools-input'
		document.body.appendChild($textHelper)
	}
	$textHelper.innerHTML = ''
	$textHelper.style.cssText = 'display: block';
	return $textHelper
}

/**
 * 初始化辅助文本输入框样式
 * @param  {MouseEvent} event [鼠标事件]
 * @param  {Object} state [instance state]
 * @param  {Object} rect  [instance rect]
 * @return {HTMLElement}   
 */
const insertTextHelper = (event, state, rect) => {
	const $textHelper = getTextHelper(),
		threshold = state.fontSize || TEXT_HELPER_FONT_SIZE,
		padding = 2 * TEXT_HELPER_PADDING + 2,
		pos = getPos(event, rect)

	let x = event.pageX,
		y = event.pageY,
		maxW = Math.floor(rect.width - pos.x) - padding,
		maxH = Math.floor(rect.height - pos.y) - padding

	if (maxW <= threshold) {
		x -= (threshold + padding - maxW)
		maxW = threshold
	}

	if (maxH <= threshold) {
		y -= (threshold + padding - maxH)
		maxH = threshold
	}

	if (maxW >= rect.width) {
		maxW = rect.width - pos.x
	}

	if (maxH >= rect.height) {
		maxH = rect.height - pos.y
	}

	const styleMap = {
		'font-size': threshold + 'px',
		'line-height': threshold + 'px',
		'min-width': threshold + 'px',
		'min-height': threshold + 'px',
		'max-width': maxW + 'px',
		'max-height': maxH + 'px',
		'z-index': 19900206,
		'font-family': TEXT_FONT_FAMILY,
		display: 'block',
		position: 'absolute',
		top: y + 'px',
		left: x + 'px',
		color: state.strokeColor,
		padding: TEXT_HELPER_PADDING + 'px',
		overflow: 'hidden',
	}

	let style = ''

	for (let key in styleMap) {
		style += `${key}:${styleMap[key]};`
	}

	$textHelper.style.cssText = style
	$textHelper.focus()
	return $textHelper
}

/**
 * 移除辅助文本输入框
 * @return 
 */
const removeTextHelper = () => {
	let $textHelper = document.getElementById('canvas-tools-input')
	if (!$textHelper) {
		return
	}
	$textHelper.innerHTML = ''
	$textHelper.style.cssText = 'display: none';
}


/**
 * 获取鼠标在Canvas上的位置
 * @param  {Element Event} event [鼠标事件]
 * @param  {Object} rect  [Canvas rect]
 * @return {Object} 
 */
const getPos = (event, rect) => {
	let x = event.pageX - rect.left
	let y = event.pageY - rect.top

	if (x <= 0) x = 0
	if (x >= rect.width) x = rect.width
	if (y <= 0) y = 0
	if (y >= rect.height) y = rect.height

	return {
		x,
		y
	}
}


/**
 * 默认配置
 * @type {Object}
 */
const defaults = {
	//工具条父级对象容器
	container: document.body,
	//显示按钮
	buttons: ['rect', 'ellipse', 'brush', 'font', 'undo', 'save']
}


//创建一个下载链接
const $saveLink = document.createElementNS('http://www.w3.org/1999/xhtml', 'a')

//是否支持原生下载
const canUseSaveLink = 'download' in $saveLink

//出发click事件
const _click = element => element.dispatchEvent(new MouseEvent("click"))

//下载文件
const __downloadFile = function () {
	const fileName = `canvas_${Date.now()}.png`
	const canvas = this.canvas
	let fileUrl
	if (canUseSaveLink) {
		fileUrl = canvas.toDataURL('png')
		fileUrl = fileUrl.replace('image/png', 'image/octet-stream')
		setTimeout(() => {
			$saveLink.href = fileUrl
			$saveLink.download = fileName
			_click($saveLink)
		})
	}
	//for ie10+ 
	else if (typeof navigator !== "undefined" && typeof canvas.msToBlob === 'function' && navigator.msSaveBlob) {
		navigator.msSaveBlob(canvas.msToBlob(), fileName)
	} else {
		console.log('您的浏览器不支持该操作')
	}
}


//相关事件绑定
function __bindEvents() {
	const self = this
	const {
		canvas,
		context,
		$el,
		state,
		config,
		rect,
		_handles,
		history
	} = this

	const $btns = utils.$('.js-btn', $el),
		$fontPanel = utils.$('.js-panel__font', $el)[0],
		$strokePanel = utils.$('.js-panel__stroke', $el)[0],
		$colorSelected = utils.$('.js-color-selected', $el),
		$colors = utils.$('.js-color', $el),
		$strokeWidth = utils.$('.js-stroke-width', $el),
		$fontSize = utils.$('.js-font-size', $el)

	//按钮事件
	_handles.btnEmit = function(event) {
		event.stopPropagation()
		if (state.drawType === 'font') {
			__drawFont.call(self, event)
		}
		const panel = this.getAttribute('data-panel')
		const value = this.getAttribute('data-value')
		utils.each($btns, (index, $btn) => {
			if ($btn !== this) {
				utils.classList($btn, 'remove', 'active')
			}
		})
		if (!!~STROKE_TYPES.indexOf(value)) {
			state.drawType = value
		}
		if (panel) {
			utils.classList(this, 'toggle', 'active')
			const isActive = /active/.test(this.className)
			const visible = isActive ? 'block' : 'none'
			if (panel === 'stroke') {
				$fontPanel.style.display = 'none'
				$strokePanel.style.display = visible
			} else if (panel === 'font') {
				$fontPanel.style.display = visible
				$strokePanel.style.display = 'none'
			}
		} else {
			//$fontPanel.style.display = 'none'
			//$strokePanel.style.display = 'none'
		}

		if (value === 'save') {
			__downloadFile.call(self)
			return
		}

		if (value === 'undo') {

			//history[0]是画布的初始状态
			//因此只有多于1个历史记录时才可以恢复上一步
			if (history.length > 1) {
				history.pop()
				context.putImageData(history[history.length - 1], 0, 0, 0, 0, rect.width, rect.height)
			}
		}

		__toggleCanvasCursor.call(self)
	}

	//切换颜色
	_handles.toggleColor = function(event) {
		const color = this.getAttribute('data-value')
		state.strokeColor = color
		utils.each($colorSelected, (index, item) => item.style.background = color)
	}

	//切换画笔大小
	_handles.toggleStrokeWidth = function(event) {
		state.strokeWidth = Number(this.getAttribute('data-value'))
		utils.each($strokeWidth, (index, item) => {
			const value = Number(item.getAttribute('data-value'))
			const method = value === state.strokeWidth ? 'add' : 'remove'
			utils.classList(item, method, 'active')
		})
	}

	//切换fontSize
	_handles.toggleFontSize = function(event) {
		state.fontSize = Number(this.value)
	}

	//鼠标在画布上的初始位置
	let _startPos


	//鼠标点击
	_handles.onMouseDown = function(event) {
		if (!!~STROKE_TYPES.indexOf(state.drawType) === false || state.drawType === 'font') {
			return
		}
		_startPos = getPos(event, rect)

		//保存当前快照
		state.lastImageData = context.getImageData(0, 0, rect.width, rect.height)

		//初始化context状态
		context.lineCap = 'round'
		context.lineJoin = 'round'
		context.shadowBlur = 0
		context.strokeStyle = state.strokeColor
		context.lineWidth = state.strokeWidth

		switch (state.drawType) {
			case 'rect':
				__drawRect.call(self, event, _startPos)
				break
			case 'ellipse':
				__drawEllipse.call(self, event, _startPos)
				break
			case 'brush':
			default:
				__drawBrush.call(self, event, _startPos)
				break
		}

		utils.$on(document, 'mousemove', _handles.onMouseMove)
		utils.$on(document, 'mouseup', _handles.onMouseUp)
	}

	//鼠标移动
	_handles.onMouseMove = function(event) {
		if (!!~STROKE_TYPES.indexOf(state.drawType) === false || state.drawType === 'font') {
			return
		}

		switch (state.drawType) {
			case 'rect':
				__drawRect.call(self, event, _startPos)
				break
			case 'ellipse':
				__drawEllipse.call(self, event, _startPos)
				break
			case 'brush':
			default:
				__drawBrush.call(self, event, null)
				break
		}
	}

	//鼠标离开
	_handles.onMouseUp = function(event) {
		utils.$off(document, 'mousemove', _handles.onMouseMove)
		utils.$off(document, 'mouseup', _handles.onMouseUp)
		if (!!~STROKE_TYPES.indexOf(state.drawType) && state.drawType !== 'font') {
			__pushHistory.call(self)
		}
	}

	//插入文本输入框
	_handles.insertTextHelper = function(event) {
		event.stopPropagation()
		if (state.drawType !== 'font') {
			return
		}
		if (state.isEntry) {
			__drawFont.call(self, event)
			return
		}
		insertTextHelper(event, state, rect)
		state.isEntry = true
	}

	//移除文本输入框
	_handles.removeTextHelper = function(event) {
		if (state.drawType !== 'font') {
			removeTextHelper()
		} else {
			if (!event.target.closest('#canvas-tools-input')) {
				__drawFont.call(self, event)
			}
		}
	}

	
	//按钮事件
	utils.$on($btns, 'click', _handles.btnEmit)

	//切换颜色
	utils.$on($colors, 'click', _handles.toggleColor)

	//切换画笔大小
	utils.$on($strokeWidth, 'click', _handles.toggleStrokeWidth)

	//切换字体大小
	utils.$on($fontSize, 'change', _handles.toggleFontSize)

	//矩形，椭圆，画笔等绘制
	utils.$on(canvas, 'mousedown', _handles.onMouseDown)

	//文字输入
	utils.$on(canvas, 'click', _handles.insertTextHelper)

	//移除文字输入框
	utils.$on(document, 'click', _handles.removeTextHelper)

}

/**
 * 绘制矩形
 * @param  {MouseEvent} event [鼠标事件]
 * @param  {Object} start [起始位置]
 * @return 
 */
function __drawRect(event, start) {
	const {
		context,
		rect,
		state
	} = this
	const pos = getPos(event, rect)
	let width = pos.x - start.x
	let height = pos.y - start.y

	context.clearRect(0, 0, rect.width, rect.height)
	context.putImageData(state.lastImageData, 0, 0, 0, 0, rect.width, rect.height)
	context.save()
	context.beginPath()
	context.strokeRect(start.x, start.y, width, height)
	context.restore()
	context.closePath()
}


/**
 * 绘制椭圆
 * @param  {MouseEvent} event [鼠标事件]
 * @param  {Object} start [起始位置]
 * @return 
 */
function __drawEllipse(event, start) {
	const {
		context,
		rect,
		state
	} = this
	const pos = getPos(event, rect)
	let scaleX = 1 * ((pos.x - start.x) / 2)
	let scaleY = 1 * ((pos.y - start.y) / 2)
	let x = (start.x / scaleX) + 1
	let y = (start.y / scaleY) + 1

	context.clearRect(0, 0, rect.width, rect.height)
	context.putImageData(state.lastImageData, 0, 0, 0, 0, rect.width, rect.height)
	context.save()
	context.beginPath()
	context.scale(scaleX, scaleY)
	context.arc(x, y, 1, 0, 2 * Math.PI)
	context.restore()
	context.closePath()
	context.stroke()
}

/**
 * 画笔工具自由绘制
 * @param  {MouseEvent} event [鼠标事件]
 * @param  {Object | null} start [起始位置]
 * @return 
 */
function __drawBrush(event, start = null) {
	const {
		context,
		rect
	} = this
	if (start) {
		context.beginPath()
		context.moveTo(start.x, start.y)
	} else {
		const pos = getPos(event, rect)
		context.lineTo(pos.x, pos.y)
		context.stroke()
	}
}


/**
 * 绘制文字
 * @param  {MouseEvent} event [鼠标事件]
 * @return {[type]} 
 */
function __drawFont(event) {
	const $textHelper = document.getElementById('canvas-tools-input')
	if (!$textHelper) {
		this.state.isEntry = false
		return
	}
	const content = $textHelper.textContent.trim()
	const length = content.length
	if (!content || !length) {
		this.state.isEntry = false
		removeTextHelper()
		return
	}

	const style = utils.getComputedStyles($textHelper),
		threshold = this.state.fontSize || TEXT_HELPER_FONT_SIZE,
		padding = 2 * TEXT_HELPER_PADDING,
		context = this.context

	let x = parseFloat(style.left) - this.rect.left + padding - 2,
		y = parseFloat(style.top) - this.rect.top + threshold,
		lineWidth = 0,
		lastSubStrIndex = 0

	context.beginPath()
	context.save()
	context.fillStyle = this.state.strokeColor
	context.font = `${this.state.fontSize}px ${TEXT_FONT_FAMILY}`

	for (let i = 0; i < length; i++) {
		let char = content[i]

		//让文字自动换行
		lineWidth += context.measureText(char).width

		if (lineWidth > this.rect.width - x) {
			context.fillText(content.substring(lastSubStrIndex, i), x, y)
			y += threshold
			lineWidth = 0
			lastSubStrIndex = i
		}
		if (i == length - 1) {
			context.fillText(content.substring(lastSubStrIndex, i + 1), x, y);
		}
	}
	context.restore()
	context.closePath()
	this.state.isEntry = false
	removeTextHelper()
	__pushHistory.call(this)
}


/**
 * 切换鼠标指针
 * @return 
 */
function __toggleCanvasCursor() {
	const canvas = this.canvas
	let cursor
	switch (this.state.drawType) {
		case 'brush':
			cursor = 'brush'
			break
		case 'font':
			cursor = 'font'
			break
		case 'rect':
		case 'ellipse':
			cursor = 'crosshair'
			break
		default:
			cursor = 'default'
	}
	if (cursor) {
		canvas.className = canvas.className.replace(/canvas-cursor__(\w+)/, '').trim() + ` canvas-cursor__${cursor}`
	}
}


/**
 * 保存到历史记录
 * @return  
 */
function __pushHistory() {
	this.history.push(this.context.getImageData(0, 0, this.rect.width, this.rect.height))
}


class CanvasTools {
	constructor(canvas, options) {
		if (!canvas || typeof canvas.getContext !== 'function') {
			throw new Error('invalid canvas object')
		}
		this.canvas = canvas
		this.context = canvas.getContext('2d')
		this.config = utils.extend({}, defaults, options || {})

		this.history = []
		this.state = Object.create(null)
		this.rect = Object.create(null)
		this._handles = Object.create(null)

		this.state.strokeWidth = STROKE_DEFAULT_WIDTH
		this.state.fontSize = TEXT_HELPER_FONT_SIZE
		this.state.strokeColor = STROKE_DEFAULT_COLOR
		this.state.drawType = 'brush'
		this.state.isEntry = false
		this.rect.width = canvas.width
		this.rect.height = canvas.height
		this.rect.top = canvas.offsetTop
		this.rect.left = canvas.offsetLeft

		//保存现场
		this.state.lastImageData = this.context.getImageData(0, 0, this.rect.width, this.rect.height)

		//将画布的初始状态保存到历史记录
		__pushHistory.call(this)

		__toggleCanvasCursor.call(this)

		this.render()
	}

	render() {
		const C = this.config
		const S = this.state
		let el = document.createElement('div')
		el.className = 'canvas-tools'
		el.innerHTML = Template.getButtons(C.buttons)
		C.container.appendChild(el)

		this.$el = el
		this.$el.appendChild(buildStrokePanel(S.strokeWidth, S.strokeColor))
		this.$el.appendChild(buildFontPanel(S.fontSize, S.strokeColor))
		__bindEvents.call(this)
	}


	destory() {
		const {
			canvas,
			$el,
			_handles
		} = this

		const $btns = utils.$('.js-btn', $el),
			$colors = utils.$('.js-color', $el),
			$strokeWidth = utils.$('.js-stroke-width', $el),
			$fontSize = utils.$('.js-font-size', $el),
			$textHelper = document.getElementById('canvas-tools-input')

		utils.$off($btns, 'click', _handles.btnEmit)
		utils.$off($colors, 'click', _handles.toggleColor)
		utils.$off($strokeWidth, 'click', _handles.toggleStrokeWidth)
		utils.$off($fontSize, 'change', _handles.toggleFontSize)
		utils.$off(canvas, 'mousedown', _handles.onMouseDown)
		utils.$off(canvas, 'click', _handles.insertTextHelper)
		utils.$off(document, 'click', _handles.removeTextHelper)
		$textHelper && $textHelper.parentNoed.removeChild($textHelper)
		this.canvas = null
		this.context = null
		this.history.length = 0
	}

}

export default CanvasTools