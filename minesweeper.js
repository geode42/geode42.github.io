let colors = {
	tileColor: 'rgb(83, 145, 212)',
	flaggedColor: 'rgb(232, 200, 83)',
	revealedColor: 'rgb(220, 220, 220)',
	text1Color: 'rgb(40, 127, 210)',
	text2Color: 'rgb(70, 163, 62)',
	text3Color: 'rgb(216, 79, 79)',
	text4Color: 'rgb(122, 85, 224)',
	text5Color: 'rgb(199, 66, 110)',
	text6Color: 'rgb(50, 179, 131)',
	text7Color: 'rgb(166, 61, 61)',
	text8Color: 'rgb(75, 31, 110)',
}
let scrollableInputTimeoutDelay = 500, generateBoardDelay = 500

let scrollableInputs = document.getElementsByClassName('scroll-input')

let scrollableInputTimer

function scrollableInputKeyDown(e) {
	if (!['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) return
	for (let i = 0; i < scrollableInputs.length; i++) {
		let element = scrollableInputs.item(parseInt(i))
		if (element.dataset.mouseOver == 'false') continue

		if (element.getAttribute('key-' + e.key) == 'true') continue

		let val = parseInt(element.textContent)
		let prefix = element.textContent.substring(0, element.textContent.indexOf(val))
		let suffix = element.textContent.substring(element.textContent.indexOf(val) + JSON.stringify(val).length)
		let min = element.dataset.min
		let max = element.dataset.max
		if (element.dataset.active == 'false') {
			newVal = parseInt(e.key)
		} else {
			newVal = parseInt(JSON.stringify(val) + e.key)
		}
		if (newVal < min) newVal = min
		if (newVal > max) newVal = max
		element.textContent = `${prefix}${newVal}${suffix}`
		element.dataset.active = 'true'
		clearTimeout(scrollableInputTimer)
		element.setAttribute('key-' + e.key, 'true')
	
		// There's probably a better way to do this, but I don't know what it is... so...
		if (element == scaleInput) {
			function generateBoardOnEditTimeoutFunction() {if (mineGrid.length == 0) generateBoard()}
			clearTimeout(element.dataset.generateBoardTimer)
			element.dataset.generateBoardTimer = setTimeout(generateBoardOnEditTimeoutFunction, generateBoardDelay)
		}

	}
}

function scrollableInputKeyUp(e) {
	if (!['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) return
	for (let i = 0; i < scrollableInputs.length; i++) {
		let element = scrollableInputs.item(parseInt(i))
		if (element.dataset.mouseOver == 'false') continue
		
		element.setAttribute('key-' + e.key, 'false')
		function timeoutFunction() {element.dataset.active = 'false'}
		clearTimeout(scrollableInputTimer)
		scrollableInputTimer = setTimeout(timeoutFunction, scrollableInputTimeoutDelay)
	}
}

function scrollableInputWheel(e, element) {
	let val = parseInt(element.textContent)
	let prefix = element.textContent.substring(element.dataset.preGapAmount, element.textContent.indexOf(val))
	let suffix = element.textContent.substring(element.textContent.indexOf(val) + JSON.stringify(val).length)
	let newVal = val - Math.round(e.deltaY * 0.01)
	let min = element.dataset.min
	let max = element.dataset.max
	if (newVal < min) newVal = min
	if (newVal > max) newVal = max

	let newText = `${prefix}${newVal}${suffix}` 

	let preGapAmount = element.dataset.commonLength - newText.length
	if (preGapAmount < 0) preGapAmount = 0
	element.dataset.preGapAmount = preGapAmount

	element.textContent = `${String.fromCharCode(160).repeat(preGapAmount)}${prefix}${newVal}${suffix}`

	// There's probably a better way to do this, but I don't know what it is... so...
	if (element == scaleInput) {
		if (mineGrid.length == 0) generateBoard()
	}
}

for (let i = 0; i < scrollableInputs.length; i++) {
	let element = scrollableInputs.item(parseInt(i))
	element.dataset.active = 'false'
	let val = parseInt(element.textContent)
	let prefix = element.textContent.substring(0, element.textContent.indexOf(val))
	let suffix = element.textContent.substring(element.textContent.indexOf(val) + JSON.stringify(val).length)
	let min = element.dataset.min
	let max = element.dataset.max
	if (min == undefined) element.dataset.min = 0
	if (max == undefined) element.dataset.max = 100

	let commonLength = element.dataset.commonLength
	if (commonLength == undefined) element.dataset.commonLength = `${prefix}${element.dataset.max}${suffix}`.length
	element.style.minWidth = `${element.dataset.commonLength}ch`
	element.dataset.preGapAmount = 0

	element.dataset.mouseOver = 'false'
	
	element.addEventListener('wheel', (e) => scrollableInputWheel(e, element))

	element.addEventListener('mouseover', () => {
		element.dataset.mouseOver = 'true'
	})
	element.addEventListener('mouseout', () => {
		element.dataset.mouseOver = 'false'
		clearTimeout(scrollableInputTimer)
	})
}

document.addEventListener('keydown', (e) => scrollableInputKeyDown(e))
document.addEventListener('keyup', (e) => scrollableInputKeyUp(e))

const difficultyInput = document.getElementById('difficulty-input')
const scaleInput = document.getElementById('scale-input')
const tileContainer = document.getElementById('tile-container')
const rightClickBlocker = document.getElementById('right-click-blocker')
const settingsContainer = document.getElementById('settings-container')
const settingsContainerHeight = settingsContainer.offsetHeight
const restartButton = document.getElementById('restart-button')

difficultyInput.textContent = '15%'
scaleInput.textContent = '50px'

let defaultTileSize = 50, defaultTilePadding = 4, minOuterPadding = 20, TopBarPadding = 10, defaultFontSize = 30
let mineGrid = []

let xres, yres, gridSizeX, gridSizeY, outerPaddingX, outerPaddingY

function generateBoard() {
	restartButton.disabled = true
	let tileSize = parseInt(scaleInput.textContent)
	let sizeModifier = tileSize / defaultTileSize
	let tilePadding = defaultTilePadding * sizeModifier
	let fontSize = Math.round(defaultFontSize * sizeModifier)
	tileContainer.replaceChildren()
	xres = window.innerWidth, yres = window.innerHeight

	gridSizeX = Math.floor((xres - minOuterPadding * 2 + tilePadding) / (tileSize + tilePadding))
	gridSizeY = Math.floor((yres - minOuterPadding * 2 + tilePadding - settingsContainerHeight) / (tileSize + tilePadding))

	outerPaddingX = (xres - (tileSize * gridSizeX + tilePadding * (gridSizeX - 1))) / 2
	outerPaddingY = ((yres - settingsContainerHeight) - (tileSize * gridSizeY + tilePadding * (gridSizeY - 1))) / 2

	mineGrid = []

	rightClickBlocker.style.top = `${settingsContainerHeight + outerPaddingY - tilePadding}px`
	rightClickBlocker.style.bottom = `${outerPaddingY - tilePadding}px`
	rightClickBlocker.style.left = `${outerPaddingX - tilePadding}px`
	rightClickBlocker.style.right = rightClickBlocker.style.left
	rightClickBlocker.addEventListener('contextmenu', e => e.preventDefault())

	for (let i=0; i<gridSizeX; i++) {
		for (let j=0; j<gridSizeY; j++) {
			let tile = document.createElement('div')
			tile.className = 'tile'
			s = tile.style
			s.width = `${tileSize}px`
			s.height = `${tileSize}px`
			s.left = `${outerPaddingX + i * (tileSize + tilePadding)}px`
			s.top = `${outerPaddingY + settingsContainerHeight + j * (tileSize + tilePadding)}px`
			s.backgroundColor = colors['tileColor']
			s.fontSize = `${fontSize}px`
			tile.setAttribute('x', i)
			tile.setAttribute('y', j)
			tile.setAttribute('flagged', 'false')
			tile.setAttribute('hidden', 'true')
			tile.id = `${i}-${j}`
	
			tile.addEventListener('contextmenu', e => e.preventDefault())
	
			tile.addEventListener('mousedown', (e) => {
				let x = parseInt(tile.getAttribute('x')), y = parseInt(tile.getAttribute('y'))
				if (e.button == 2) {
					if (tile.getAttribute('flagged') === 'false') {
						if (tile.getAttribute('hidden') == 'true') {
							tile.setAttribute('flagged', 'true')
							tile.style.backgroundColor = colors['flaggedColor']
						}
					} else {
						tile.setAttribute('flagged', 'false')
						tile.style.backgroundColor = colors['tileColor']
					}
				} else if (e.button == 0) {
					if (mineGrid.length == 0) {
						generateMines(x, y)
						restartButton.disabled = false
					}
					checkAdjacentTiles(x, y)
				}
			})
	
			tileContainer.appendChild(tile)
		}
	}

}

function arrayInArray(childArray, parentArray) {
	if (JSON.stringify(parentArray).indexOf(JSON.stringify(childArray)) != -1) return true
	return false
}

function generateMines(x, y) {
	let mineCount = Math.round(parseInt(difficultyInput.textContent) / 100 * gridSizeX * gridSizeY)
	if (mineCount > gridSizeX * gridSizeY - 9) {
		mineCount = gridSizeX * gridSizeY - 9
	}
	for (let i = 0; i < mineCount; i++) {
		let startingClearTiles = getAdjacentTiles(x, y)
		startingClearTiles.push([x, y])
		let position = [Math.floor(Math.random() * gridSizeX), Math.floor(Math.random() * gridSizeY)]
		while (arrayInArray(position, mineGrid) || arrayInArray(position, startingClearTiles)) {
			position = [Math.floor(Math.random() * gridSizeX), Math.floor(Math.random() * gridSizeY)]
		}
		mineGrid.push(position)
	}
}



function getAdjacentTiles(x, y) {
	let adjacentTiles = []
	if (y != 0) {
		if (x != 0) adjacentTiles.push([x - 1, y - 1])
		adjacentTiles.push([x, y - 1])
		if (x != gridSizeX - 1) adjacentTiles.push([x + 1, y - 1])
	}
	if (x != 0) adjacentTiles.push([x - 1, y])
	if (x != gridSizeX - 1) adjacentTiles.push([x + 1, y])
	if (y != gridSizeY - 1) {
		if (x != 0) adjacentTiles.push([x - 1, y + 1])
		adjacentTiles.push([x, y + 1])
		if (x != gridSizeX - 1) adjacentTiles.push([x + 1, y + 1])
	}
	return adjacentTiles
}

function getAdjacentMinesCount(x, y) {
	let mineCount = 0
	for (i of getAdjacentTiles(x, y)) {
		if (arrayInArray(i, mineGrid)) {
			mineCount++
		}
	}
	return mineCount
}

function tileContainsMine(x, y) {
	if (arrayInArray([x, y], mineGrid)) return true
	return false
}

function tileIsBlank(x, y) {
	if (getAdjacentMinesCount(x, y) > 0) return false
	return true
}

function tileIsHidden(x, y) {
	if (document.getElementById(`${x}-${y}`).getAttribute('hidden') == 'true') return true
	return false
}

function tileIsRevealed(x, y) {
	if (document.getElementById(`${x}-${y}`).getAttribute('hidden') == 'false') return true
	return false
}

function getTileElementFromCoords(x, y) {
	return document.getElementById(`${i[0]}-${i[1]}`)
}

function checkAdjacentTiles(x, y) {
	if (tileIsRevealed(x, y)) {
		let flaggedCount = 0
		for (i of getAdjacentTiles(x, y)) {
			if (getTileElementFromCoords(i[0], i[1]).getAttribute('flagged') == 'true') flaggedCount++
		}
		if (flaggedCount == getAdjacentMinesCount(x, y)) {
			for (i of getAdjacentTiles(x, y)) {
				if (tileIsHidden(i[0], i[1]) && getTileElementFromCoords(i[0], i[1]).getAttribute('flagged') == 'false') checkAdjacentTiles(i[0], i[1])
			}
		}
		return
	}

	let tilesToClear = [[x, y]]
	let lookedAt = []

	function idk(x, y) {
		if (arrayInArray([x, y], lookedAt) || tileIsRevealed(x, y)) return
		lookedAt.push([x, y])
		if (tileIsBlank(x, y)) {
			for (i of getAdjacentTiles(x, y)) {
				if (!arrayInArray(i, tilesToClear)) {
					tilesToClear.push(i)
					idk(i[0], i[1])
				}
			}
		}
	}

	for (i of getAdjacentTiles(x, y)) idk(x, y)
	for (i of tilesToClear) {
		let tile = getTileElementFromCoords(i[0], i[1])
		if (tileContainsMine(i[0], i[1])) {
			tile.style.backgroundColor = 'rgb(227, 68, 68)'
			continue
		}
		if (tile.getAttribute('flagged') == 'true' && !(i[0] == x && i[1] == y)) continue

		if (tileIsRevealed(i[0], i[1])) continue
		tile.style.backgroundColor = colors['revealedColor']
		tile.setAttribute('hidden', 'false')
		tile.style.cursor = 'auto'
		let mineCount = getAdjacentMinesCount(i[0], i[1])
		if (mineCount > 0) {
			tile.appendChild(document.createTextNode(mineCount))
			tile.style.color = colors[`text${mineCount}Color`]
		}
	}
}

generateBoard()

window.onresize = () => {
	if (mineGrid.length == 0) generateBoard()
}
