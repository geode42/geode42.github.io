class fancyInput extends HTMLElement {
	constructor() {
		super()
		this.value = 0
		this.min = 0
		this.max = 100
	}

	validateAndUpdateValue(v) {
		let inputValue = parseInt(v.value)
		if (inputValue == '') inputValue = 0
		if (inputValue < this.min) {
			inputValue = this.min
		} else if (inputValue > this.max) {
			inputValue = this.max
		}
		this.value = inputValue
		v.value = inputValue
	}

	connectedCallback() {
		let elementContainer = document.createElement('div')
		let v = document.createElement('input')
		v.type = 'number'
		v.className = 'fancy-input-value'
		let u = document.createElement('div')
		u.className = 'fancy-input-unit'
		elementContainer.appendChild(v)
		elementContainer.appendChild(u)
		this.appendChild(elementContainer)
		this.value = parseInt(this.getAttribute('default-value'))
		v.value = this.value
		u.appendChild(document.createTextNode(this.getAttribute('unit')))
		this.min = parseInt(this.getAttribute('min'))
		this.max = parseInt(this.getAttribute('max'))

		let s = this.style
		let cs = elementContainer.style
		let vs = v.style
		let us = u.style
		
		s.width = `calc(${this.getAttribute('value-length')}ch + ${u.textContent.length}ch + 1ch)`
		cs.width = `calc(${this.getAttribute('value-length')}ch + ${u.textContent.length}ch + 1ch)`
		cs.position = 'relative'

		// Center items
		cs.display = 'flex'
		cs.alignItems = 'center'
		
		vs.position = 'absolute'
		vs.width = `calc(${this.getAttribute('value-length')}ch + ${u.textContent.length}ch + 1ch + 14px)` // 14px is arbitrary
		vs.textAlign = 'center'
		vs.background = 'transparent'
		vs.border = 'none'
		vs.outline = 'none'
		// vs.padding = '0'
		// vs.margin = '0'
		// us.padding = '0'
		// us.margin = '0'
		// cs.padding = '0'
		// cs.margin = '0'
		// s.padding = '0'
		// s.margin = '0'
		vs.paddingRight = `calc(${u.textContent.length}ch + 7px)` // 7 px to offset the 14 above
		vs.height = `34px` // 34px is arbitrary, based of off the two 17px values in the CSS file
		
		us.position = 'absolute'
		us.right = '0'
		us.pointerEvents = 'none'
		us.userSelect = 'none'

		this.onwheel = function(e) {
			let inputValue = parseInt(v.value)
			if (e.deltaY < 0) {
				inputValue += 1
			} else {
				inputValue -= 1
			}
			v.value = inputValue
			this.validateAndUpdateValue(v)
		}

		v.onblur = function(e) { // When the input loses focus
			this.validateAndUpdateValue(v)
		}.bind(this)

		v.onkeydown = function(e) {
			if (e.key == 'Enter') v.blur()
		}
	}
}

customElements.define('fancy-input', fancyInput)