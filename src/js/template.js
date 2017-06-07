const ButtonsMap = {
	rect: {
		panel: 'stroke',
		name: '矩形工具'
	},
	ellipse: {
		panel: 'stroke',
		name: '椭圆工具'
	},
	brush: {
		panel: 'stroke',
		name: '画笔工具'
	},
	arrow: {
		panel: 'stroke',
		name: '箭头工具'
	},
	mosaic: {
		panel: 'mosaic',
		name: '马赛克工具'
	},
	font: {
		panel: 'font',
		name: '文字工具'
	},
	rubber: {
		name: '橡皮擦'
	},
	undo: {
		name: '撤销操作'
	},
	save: {
		name: '保存'
	}
}


//可用颜色
const ColorList = ['#000000', '#808080', '#800000', '#f7883a', '#308430', '#385ad3', '#800080', '#009999', '#ffffff', '#c0c0c0', '#fb3838', '#ffff00', '#99cc00', '#3894e4', '#f31bf3', '#16dcdc']

//可选择字号，Chrome不支持小于12号的字体
const FontSize = [12, 14, 16, 18, 20, 22]

//画笔大小
const StrokeWidth = [2, 4, 6]


/**
 * 获取buttons模版
 * @param  {Array}  buttons [可用按钮]
 * @return {String} 
 */
const getButtons = (buttons = []) => {
	let html = []
	const useButton = btn => {
		return buttons && !!~buttons.indexOf(btn)
	}
	for (let key in ButtonsMap) {
		if (useButton(key)) {
			let btn = ButtonsMap[key]
			html.push(`<div class="canvas-tools-btn js-btn" data-panel="${btn.panel || ''}" data-value="${key}" data-action="" title="${btn.name}">
			<a class="btn-toggle"><i class="canvas-tools-icon__${key}"></i></a>
			</div>`)
		}
	}
	return html.join('')
}


/**
 * 获取颜色面板
 * @param  {String} color [当前选中色]
 * @return {String}
 */
const getColorPanel = (color = '#fb3838') => {
	let html = ''
	html += '<div class="colors">'
	html += `<span class="color-selected"><i class="js-color-selected" style="background:${color}"></i></span>`
	html += '<div class="color-list">'

	let items1 = [],
		items2 = []
	for (let i = 0; i < 16; i++) {
		let item = `<li class="js-color" style="background:${ColorList[i]}" data-value="${ColorList[i]}"></li>`
		if (i < 8) {
			items1.push(item)
		} else {
			items2.push(item)
		}
	}

	html += `<ul>${items1.join('')}</ul>`
	html += `<ul>${items2.join('')}</ul>`

	html += '</div>'
	html += '</div>'

	return html
}


/**
 * 获取画笔大小面板
 * @param  {Number} stroke [当前画笔大小]
 * @return {String}  
 */
const getStrokePanel = (stroke = 2) => {
	let html = '<div class="strokes">'
	for (let i = 0, len = StrokeWidth.length; i < len; i++) {
		let size = StrokeWidth[i]
		let classes = ['stroke', 'js-stroke-width']
		size === stroke && classes.push('active')
		html += `<a class="${classes.join(' ')}" data-value="${size}"><i style="width:${size + 1}px;height:${size + 1}px;"></i></a>`
	}
	html += '</div>'
	return html
}


/**
 * 获取字号选择器
 * @param  {Number} fontSize [默认字号]
 * @return {String} 
 */
const getFontPanel = (fontSize = 12) => {
	let html = '<select class="font-select js-font-size">'
	for (let i = 0, len = FontSize.length; i < len; i++) {
		let size = FontSize[i]
		let selected = !!(size === fontSize) ? 'selected' : ''
		html += `<option value="${size}" ${selected}>${size}</option>`
	}
	html += '</select>'
	return html
}


const getAmbiguity = (ambiguite = .5) => `<label class="ambiguite-range"><span>模糊度</span><input type="range" min="0" step="0.01" max="1" value="${ambiguite}" class="js-mosaic-ambiguity"></label>`

export default {
	getButtons,
	getColorPanel,
	getStrokePanel,
	getFontPanel,
	getAmbiguity,
}