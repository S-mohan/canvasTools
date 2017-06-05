(function() {
	var $screenshotModal = document.getElementById('screenshotModal')
	var $modalShow = document.getElementById('modalShow')

	var $toolsWrap = document.getElementById('canvasTools')
	var Canvas = document.getElementById('screenshotCanvas')
	var $canvasWrapper = Canvas.parentNode


	function parseHtml() {
		var doc = document.documentElement
		var clone = doc.cloneNode(true)
		clone.querySelector('#screenshotModal').style.display = 'none'
		return clone.outerHTML
	}


	var canvasTools = null
	var context = Canvas.getContext('2d')
	$modalShow.addEventListener('click', function(event) {
		$screenshotModal.style.display = 'block'
		const WW = document.body.offsetWidth
		const WH = document.body.offsetHeight
		const CWW = $canvasWrapper.offsetWidth
		const scale = CWW / WW
		$canvasWrapper.style.maxHeight = WH * scale + 'px'
		Canvas.width = WW
		Canvas.height = WH
		
		rasterizeHTML.drawHTML(parseHtml(), Canvas, {
				executeJsTimeout: 5000
			})
			.then(function(renderResult) {
				renderResult.image.width = String(CWW)
				renderResult.image.height = String(WH * scale)
				Canvas.width = CWW
				Canvas.height = WH * scale
				context.clearRect(0, 0, Canvas.width, Canvas.height)
				context.drawImage(renderResult.image, 0, 0, renderResult.image.width , renderResult.image.height)
				if (!canvasTools) {
					canvasTools = new CanvasTools(Canvas, {container : $toolsWrap}) 
				}
			}, function(error) {

			})
	})

})()