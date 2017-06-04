const ArrayProto = Array.prototype

const SelectorRegs = {
	id: /^#([\w-]+)$/,
	className: /^\.([\w-]+)$/,
	tagName: /^[\w-]+$/
}


const isObject = obj => obj !== null && typeof obj === 'object'


const isPlainObject = obj => Object.prototype.toString.call(obj) === '[object Object]'



/**
 * 获取元素对象集合
 * @param  {String} selector [选择器]
 * @param  {HTMLElement} context  [上下文对象]
 * @return {Array}          [元素节点集合]
 */
const $ = (selector = '*', context = document) => {
	if (typeof selector === "string") {
		selector = selector.trim()
		let dom = [];
		if (SelectorRegs.id.test(selector)) {
			dom = document.getElementById(RegExp.$1)
			dom = dom ? [dom] : []
		} else if (SelectorRegs.className.test(selector)) {
			dom = context.getElementsByClassName(RegExp.$1)
		} else if (SelectorRegs.tagName.test(selector)) {
			dom = context.getElementsByTagName(selector)
		} else {
			dom = context.querySelectorAll(selector)
		}
		return ArrayProto.slice.call(dom)
	}
	return []
}


/**
 * 对象遍历
 * @param  {Object | Array}   object   [对象源]
 * @param  {Function} callback [回调]
 * @return  
 */
const each = (object, callback) => {
	if (typeof object === "object" && typeof callback === "function") {
		if (Array.isArray(object)) {
			for (let i = 0, len = object.length; i < len; i++) {
				if (callback.call(object[i], i, object[i]) === false) {
					break
				}
			}
		} else if ('length' in object && typeof object.length === "number") { //这地方不太严谨，谨慎使用
			for (let k in object) {
				if (callback.call(object[k], k, object[k]) === false) {
					break
				}
			}
		}
	}
}


/**
 * 事件绑定，支持代理
 * @param  {HTMLElement}   element   [DOM元素]
 * @param  {String}   eventType [事件类型]
 * @param  {String}   selector  [选择器]
 * @param  {Function} callback  [回调]
 * @return 
 */
const bind = (element, eventType, selector, callback) => {
	let sel, handler;
	if (typeof selector === "function") {
		handler = selector
	} else if (typeof selector === "string" && typeof callback === "function") {
		sel = selector
	} else {
		return
	}
	if (sel) { //事件代理
		handler = function(e) {
			const nodes = $(sel, element)
			let matched = false
			for (let i = 0, len = nodes.length; i < len; i++) {
				const node = nodes[i]
				if (node === e.target || node.contains(e.target)) {
					matched = node
					break
				}
			}
			if (matched) {
				callback.apply(matched, ArrayProto.slice.call(arguments))
			}
		}
	}

	element.addEventListener(eventType, handler, false)
}


/**
 * 事件解绑
 * @param  {HTMLElement}   element   [DOM元素]
 * @param  {String}   eventType [事件类型]
 * @param  {Function} callback  [回调]
 * @return 
 */
const unbind = (element, eventType, callback) => element.removeEventListener(eventType, callback, false)


/**
 * 获取指定元素样式
 * @param  {HTMLElement} element
 * @return {Object}  
 */
const getComputedStyles = element => element.ownerDocument.defaultView.getComputedStyle(element, null)


/**
 * 对象深度拷贝
 * @param  {Object} out
 * @return {Object}
 */
const extend = function(out = {}) {
	for (let i = 1, len = arguments.length; i < len; i++) {
		let obj = arguments[i]
		if (!obj || !Object.keys(obj).length)
			continue
		for (let key in obj) {
			if (obj.hasOwnProperty(key)) {
				if (isPlainObject(obj[key]))
					out[key] = extend(out[key], obj[key])
				else
					out[key] = obj[key]
			}
		}
	}
	return out
}


const $on = (elements, eventType, selector, callback) => {
	if (!Array.isArray(elements)) {
		elements = [elements]
	}
	each(elements, (index, element) => bind(element, eventType, selector, callback))
}

const $off = (elements, eventType, callback) => {
	if (!Array.isArray(elements)) {
		elements = [elements]
	}
	each(elements, (index, element) => unbind(element, eventType, callback))
}

const classList = (elements, type = 'add', classes = '') => {
	if (!Array.isArray(elements)) {
		elements = [elements]
	}
	each(elements, (index, element) => element.classList[type](classes))
}


export default{
	$,
	each,
	bind,
	extend,
	unbind,
	getComputedStyles,
	classList,
	$on,
	$off,
}