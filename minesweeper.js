let colors = {
	tileColor: 'rgb(83, 145, 212)',
	flaggedColor: 'rgb(232, 200, 83)',
	revealedColor: 'rgb(220, 220, 220)',
	mineColor: 'rgb(227, 68, 68)',
	text1Color: 'rgb(40, 127, 210)',
	text2Color: 'rgb(70, 163, 62)',
	text3Color: 'rgb(216, 79, 79)',
	text4Color: 'rgb(122, 85, 224)',
	text5Color: 'rgb(199, 66, 110)',
	text6Color: 'rgb(50, 179, 131)',
	text7Color: 'rgb(166, 61, 61)',
	text8Color: 'rgb(75, 31, 110)',
}
let scrollableInputTimeoutDelay = 500, generateBoardDelay = 500, holdTapFlagTimeoutDelay = 180, endGameRevealMineDelay = 5

let scrollableInputs = document.getElementsByClassName('scroll-input')

let scrollableInputTimer, regenerateBoardDelayTimer, holdTapFlagTimer
let holdTapComplete = false

let gameEnded = false
let hiddenTilesCount = 0
let mineCount = 0

function scrollableInputKeyDown(e) {
	if (e.key == 'Escape') {
		for (let i = 0; i < scrollableInputs.length; i++) {
			let element = scrollableInputs.item(parseInt(i))
			element.dataset.selected = 'false'
			element.dataset.active = 'false';
			element.dataset.rawVal = parseInt(element.textContent)
		}
		return
	}
	if (!['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Backspace'].includes(e.key)) return
	for (let i = 0; i < scrollableInputs.length; i++) {
		let element = scrollableInputs.item(parseInt(i))
		let childNodes = element.children
		let prefixElement = childNodes.item(0)
		let valueElement = childNodes.item(1)
		let suffixElement = childNodes.item(2)

		if (!(element.dataset.mouseOver == 'true' || element.dataset.selected == 'true')) continue

		if (element.getAttribute('key-' + e.key) == 'true') continue

		let val = element.dataset.rawVal
		let min = parseInt(element.dataset.min)
		let max = parseInt(element.dataset.max)
		let newVal = 0
		if (e.key == 'Backspace') {
			if (val.length == 1) newVal = min
			else newVal = parseInt(val.slice(0, -1))
		} else {
			if (element.dataset.active == 'false') {
				newVal = parseInt(e.key)
			} else {
				newVal = parseInt(val + e.key)
			}
		}
		if (((min <= newVal) && (newVal <= max)) || ((min <= parseInt(val)) && (parseInt(val) <= max))) element.dataset.rawVal = newVal
		if (newVal < min) newVal = min
		if (newVal > max) newVal = max
		valueElement.textContent = newVal
		element.dataset.active = 'true'
		clearTimeout(scrollableInputTimer)
		element.setAttribute('key-' + e.key, 'true')
	
		// There's probably a better way to do this, but I don't know what it is... so...
		if (element == scaleInput) {
			function generateBoardOnEditTimeoutFunction() {if (mineGrid.length == 0) generateBoard()}
			clearTimeout(regenerateBoardDelayTimer)
			regenerateBoardDelayTimer = setTimeout(generateBoardOnEditTimeoutFunction, generateBoardDelay)
		}

	}
}

function scrollableInputKeyUp(e) {
	if (!['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Backspace'].includes(e.key)) return
	for (let i = 0; i < scrollableInputs.length; i++) {
		let element = scrollableInputs.item(parseInt(i))
		if (!(element.dataset.mouseOver == 'true' || element.dataset.selected == 'true')) continue
		
		element.setAttribute('key-' + e.key, 'false')
		if (element.dataset.selected == 'true') continue
		function timeoutFunction() {element.dataset.active = 'false'; element.dataset.rawVal = parseInt(element.textContent)}
		clearTimeout(scrollableInputTimer)
		scrollableInputTimer = setTimeout(timeoutFunction, scrollableInputTimeoutDelay)
	}
}

function scrollableInputMouseDown(e) {
	if (e.button != 0) return
	for (let i = 0; i < scrollableInputs.length; i++) {
		let element = scrollableInputs.item(parseInt(i))
		if (element.dataset.mouseOver == 'false') {
			element.dataset.selected = 'false'
			continue
		}

		element.dataset.selected = 'true'
	}
}

function scrollableInputTouchStart(e) {
	tile = e.target
	if (tile.className != 'tile') return
	holdTapComplete = false
	clearTimeout(holdTapFlagTimer)
	function holdTapFlagTimeoutFunction() { // Copied from right-click handler far below in this file
		holdTapComplete = true
		if (tile.getAttribute('flagged') === 'false') {
			if (tile.getAttribute('hidden') == 'true') {
				tile.setAttribute('flagged', 'true')
				tile.style.backgroundColor = colors['flaggedColor']
			}
		} else {
			tile.setAttribute('flagged', 'false')
			tile.style.backgroundColor = colors['tileColor']
		}
	}
	holdTapFlagTimer = setTimeout(holdTapFlagTimeoutFunction, holdTapFlagTimeoutDelay)
}

function scrollableInputTouchEnd(e) {
	clearTimeout(holdTapFlagTimer)
	function releaseTapBufferTimeoutFunction() {
		holdTapComplete = false
	}
	setTimeout(releaseTapBufferTimeoutFunction, 100) // Tap events seem to also register as click events, this simply disables click events for 1/10 of a second to fix that.
}

function scrollableInputWheel(e, element) {
	let childNodes = element.children
	let prefixElement = childNodes.item(0)
	let valueElement = childNodes.item(1)
	let suffixElement = childNodes.item(2)

	let val = parseInt(valueElement.textContent)
	let newVal = 0
	if (e.deltaY > 0) {
		newVal = val - 1
	} else {
		newVal = val + 1
	}
	let min = parseInt(element.dataset.min)
	let max = parseInt(element.dataset.max)
	if (newVal < min) newVal = min
	if (newVal > max) newVal = max

	valueElement.textContent = newVal

	// There's probably a better way to do this, but I don't know what it is... so...
	if (element == scaleInput) {
		if (mineGrid.length == 0) generateBoard()
	}
}

document.addEventListener('DOMContentLoaded', () => {
	for (let i = 0; i < scrollableInputs.length; i++) {
		let element = scrollableInputs.item(parseInt(i))
		let childNodes = element.children
		let prefixElement = childNodes.item(0)
		let valueElement = childNodes.item(1)
		let suffixElement = childNodes.item(2)
		element.dataset.active = 'false'
		let val = parseInt(valueElement.textContent)

		let prefix = prefixElement.textContent
		let suffix = suffixElement.textContent
		let min = element.dataset.min
		let max = element.dataset.max
		if (min == undefined) element.dataset.min = 0
		if (max == undefined) element.dataset.max = 100
	
		if (prefix != '') {
			prefixElement.style.minWidth = `${prefix.length}ch`
			prefixElement.style.paddingLeft = `${element.dataset.padding}px`
		}
		if (suffix != '') {
			suffixElement.style.minWidth = `${suffix.length}ch`
			suffixElement.style.paddingRight = `${element.dataset.padding}px`
		}
		valueElement.style.minWidth = `${element.dataset.minWidth}ch`
		
		element.dataset.rawVal = val
		element.dataset.mouseOver = 'false'
		
		element.addEventListener('wheel', (e) => scrollableInputWheel(e, element))
	
		element.addEventListener('mouseover', () => {
			element.dataset.mouseOver = 'true'
		})
		element.addEventListener('mouseout', () => {
			element.dataset.mouseOver = 'false'
			clearTimeout(scrollableInputTimer)
			element.dataset.active = 'false'
		})
	}
})

document.addEventListener('keydown', scrollableInputKeyDown)
document.addEventListener('keyup', scrollableInputKeyUp)
document.addEventListener('mousedown', scrollableInputMouseDown)
document.addEventListener('touchstart', scrollableInputTouchStart)
document.addEventListener('touchend', scrollableInputTouchEnd)

const difficultyInput = document.getElementById('difficulty-input')
const scaleInput = document.getElementById('scale-input')
const tileContainer = document.getElementById('tile-container')
const rightClickBlocker = document.getElementById('right-click-blocker')
const settingsContainer = document.getElementById('settings-container')
const settingsContainerHeight = settingsContainer.offsetHeight
const restartButton = document.getElementById('restart-button')

let defaultTileSize = 50, defaultTilePadding = 4, minOuterPadding = 20, TopBarPadding = 10, defaultFontSize = 30
let mineGrid = []

let xres, yres, gridSizeX, gridSizeY, outerPaddingX, outerPaddingY

function generateBoard() {
	gameEnded = false
	restartButton.disabled = true
	settingsContainer.style.backgroundColor = 'rgb(50, 50, 50)'
	restartButton.style.color = 'auto'
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

	hiddenTilesCount = gridSizeX * gridSizeY

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
				if (holdTapComplete) return
				if (gameEnded) return
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
	return parentArray.some(function (a) {
		return a.length === childArray.length && a.every(function(x, i) {
			return x === childArray[i]
		})
	})
}

function generateMines(x, y) {
	mineCount = Math.round(parseInt(difficultyInput.textContent) / 100 * gridSizeX * gridSizeY)
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

function getAdjacentMinesCount(x, y, adj_tiles=undefined) {
	if (adj_tiles == undefined) {
		adj_tiles = getAdjacentTiles(x, y)
	}
	let mineCount = 0
	for (i of adj_tiles) {
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

function tileIsBlank(x, y, adj_tiles) {
	if (getAdjacentMinesCount(x, y, adj_tiles) > 0) return false
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
	return document.getElementById(`${x}-${y}`)
}

function checkAdjacentTiles(x, y) {
	if (tileContainsMine(x, y)) {
		let tile = getTileElementFromCoords(x, y)
		tile.style.backgroundColor = colors['mineColor']
		loseFunction()
		return
	}

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
	let tilesToClearString = 'x y '
	let lookedAt = []

	function idk(x, y) {
		adj_tiles = getAdjacentTiles(x, y)
		if (arrayInArray([x, y], lookedAt) || tileIsRevealed(x, y)) return
		lookedAt.push([x, y])
		if (tileIsBlank(x, y, adj_tiles)) {
			for (i of adj_tiles) {
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
			tile.style.backgroundColor = colors['mineColor']
			continue
		}
		if (tile.getAttribute('flagged') == 'true' && !(i[0] == x && i[1] == y)) continue

		if (tileIsRevealed(i[0], i[1])) continue // Prevents numbered empty tiles from getting their number repeated
		tile.style.backgroundColor = colors['revealedColor']
		tile.setAttribute('hidden', 'false')
		tile.style.cursor = 'auto'
		let mineCount = getAdjacentMinesCount(i[0], i[1])
		if (mineCount > 0) {
			tile.appendChild(document.createTextNode(mineCount))
			tile.style.color = colors[`text${mineCount}Color`]
		}
		hiddenTilesCount -= 1
	}

	if (hiddenTilesCount == mineCount) {
		winFunction()
		return
	}
}

generateBoard()

window.onresize = () => {
	if (mineGrid.length == 0) generateBoard()
}

function loseFunction() {
	gameEnded = true

	let tiles = document.getElementsByClassName('tile')

	for (let i = 0; i < tiles.length; i++) {
		element = tiles.item(i)
		element.style.cursor = 'auto'
	}

	for (i in mineGrid) {
		let tile = getTileElementFromCoords(mineGrid[i][0], mineGrid[i][1])
		setTimeout(() => {tile.style.backgroundColor = colors['mineColor']}, i * endGameRevealMineDelay)
	}
}

function winFunction() {
	gameEnded = true

	let tiles = document.getElementsByClassName('tile')

	for (let i = 0; i < tiles.length; i++) {
		element = tiles.item(i)
		element.style.cursor = 'auto'
	}

	settingsContainer.style.backgroundColor = 'rgb(50, 122, 59)'
	restartButton.style.color = 'white'
}
