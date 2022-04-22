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

let tileSize = 50, tilePadding = 4, MinOuterPadding = 20
let mineCount = 40

let xres = window.innerWidth, yres = window.innerHeight

let gridSizeX = Math.floor((xres - MinOuterPadding * 2 + tilePadding) / (tileSize + tilePadding))
let gridSizeY = Math.floor((yres - MinOuterPadding * 2 + tilePadding) / (tileSize + tilePadding))

let outerPaddingX = (xres - (tileSize * gridSizeX + tilePadding * (gridSizeX - 1))) / 2
let outerPaddingY = (yres - (tileSize * gridSizeY + tilePadding * (gridSizeY - 1))) / 2

let mineGrid = []

function arrayInArray(childArray, parentArray) {
	if (JSON.stringify(parentArray).indexOf(JSON.stringify(childArray)) != -1) return true
	return false
}

function generateMines(x, y) {
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


const tileContainer = document.getElementById('tile-container')

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

for (let i=0; i<gridSizeX; i++) {
	for (let j=0; j<gridSizeY; j++) {
		let tile = document.createElement('div')
		tile.className = 'tile'
		s = tile.style
		s.width = `${tileSize}px`
		s.height = `${tileSize}px`
		s.left = `${outerPaddingX + i * (tileSize + tilePadding)}px`
		s.top = `${outerPaddingY + j * (tileSize + tilePadding)}px`
		s.backgroundColor = colors['tileColor']
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
				if (mineGrid.length == 0) generateMines(x, y)
				checkAdjacentTiles(x, y)
			}
		})

		tileContainer.appendChild(tile)
	}
}
