(function() {
	var $ = function(id) {
		return document.getElementById(id)
	}
	var $modal = $('modal')
	var $openModal = $('openModal')
	var $canvasToolBar = $('canvasToolBar')
	var $canvasWrap = $('canvasWrap')
	var $closeModal = $('closeModal')
	var $screenshot = $('screenshot')


	function parseHtml() {
		return $screenshot.outerHTML
	}
	var $canvas, canvasTools
	$openModal.addEventListener('click', function() {
		$modal.style.display = 'block'
		$canvas = document.createElement('canvas')
		var context = $canvas.getContext('2d')
		$canvasWrap.appendChild($canvas)

		rasterizeHTML.drawHTML(parseHtml(), $canvas, {
				executeJsTimeout: 3000
			})
			.then(function(renderResult) {
				var width = $screenshot.offsetWidth
				var height = $screenshot.offsetHeight
				renderResult.image.width = width
				renderResult.image.height = height
				$canvas.width = width
				$canvas.height = height
				context.clearRect(0, 0, width, height)
				context.drawImage(renderResult.image, 0, 0, width ,height)
				$canvasWrap.style.maxHeight = height + 'px'
				setTimeout(function() {
					canvasTools = new CanvasTools($canvas, {container : $canvasToolBar}) 
				})
			}, function(error) {
				console.log(error)
			})
	})

	$closeModal.addEventListener('click', function() {
		$modal.style.display = 'none'
		$canvasWrap.style.maxHeight = 0 + 'px'
		$canvasWrap.removeChild($canvas)
		$canvas = null
		canvasTools.destory()
	})
})()