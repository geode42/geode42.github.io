const canvas = document.querySelector('#canvas')
const c = canvas.getContext('2d')

let scale = window.devicePixelRatio // HiDPI displays
canvas.width = Math.round(window.innerWidth * scale)
canvas.height = Math.round(window.innerHeight * scale)
c.scale(scale, scale)

let painting = false
let brushSize = 40
let erasing = false

let brushResizeExponential = true

function startPosition(e) {
	if (e.which == 2) return  // Middle mouse button
	if (e.which == 1) {
		erasing = false
	} else if (e.which == 3) {
		erasing = true
	}
	painting = true
	c.beginPath()
	draw(e)
}
function finishedPosition() {
	painting = false
	c.closePath()
}

function draw(e) {
	if (!painting) return
	if (!erasing) {
		c.lineWidth = brushSize
		c.strokeStyle = 'black'
	} else {
		c.lineWidth = brushSize * 4
		c.strokeStyle = 'white'
	}
	c.lineCap = 'round'
	c.lineTo(e.clientX, e.clientY)
	c.stroke()
	c.beginPath()
	c.moveTo(e.clientX, e.clientY)
}

function changeBrushSize(e) {
	if (e.deltaY < 0) {
		if (brushResizeExponential) {
			brushSize *= 1.1
		} else {
			brushSize += 10
		}
	} else {
		if (brushResizeExponential) {
			brushSize /= 1.1
		} else {
			brushSize -= 10
		}
	}
}

window.addEventListener('mousedown', startPosition)
window.addEventListener('mouseup', finishedPosition)
window.addEventListener('mousemove', draw)
window.addEventListener('wheel', changeBrushSize)
document.addEventListener('contextmenu', event => event.preventDefault())
