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
let generateBoardDelay = 500, holdTapFlagTimeoutDelay = 180, endGameRevealMineDelay = 5

let regenerateBoardDelayTimer, holdTapFlagTimer
let holdTapComplete = false

let gameEnded = false
let hiddenTilesCount = 0
let mineCount = 0

const difficultyInput = document.getElementById('difficulty-input')
const scaleInput = document.getElementById('scale-input')
const tileContainer = document.getElementById('tile-container')
const rightClickBlocker = document.getElementById('right-click-blocker')
const settingsContainer = document.getElementById('settings-container')
const settingsContainerHeight = settingsContainer.offsetHeight
const createNewBoardButton = document.getElementById('create-new-board-button')

let defaultTileSize = 50, defaultTilePadding = 4, minOuterPadding = 20, TopBarPadding = 10, defaultFontSize = 30
let mineGrid = []

let xres, yres, gridSizeX, gridSizeY, outerPaddingX, outerPaddingY

function generateBoard() {
	gameEnded = false
	// createNewBoardButton.disabled = true
	settingsContainer.style.backgroundColor = 'rgb(50, 50, 50)'
	createNewBoardButton.style.color = 'auto'
	let tileSize = parseInt(scaleInput.value)
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
						// createNewBoardButton.disabled = false
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
	mineCount = Math.round(parseInt(difficultyInput.value) / 100 * gridSizeX * gridSizeY)
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
	createNewBoardButton.style.color = 'white'
}
