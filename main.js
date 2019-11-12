const assignAttributes = (element, attributes) => {
	Object.keys(attributes).forEach(key => element.setAttribute(key, attributes[key]))
}

const source = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
assignAttributes(source, {
	'id': 'source',
	'height': window.innerHeight,
	'width': window.innerWidth,
	'style': 'background: black'
})
document.body.appendChild(source)

const ground = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
assignAttributes(ground, {
	'width': window.innerWidth,
	'height': window.innerHeight / 10,
	'x': 0,
	'y': window.innerHeight - (window.innerHeight / 10),
	'stroke': 'green',
	'fill': 'brown'
})
source.appendChild(ground)

const baseArray = []

for (let index = 1; index <= 4; index++) {
	const base = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
	assignAttributes(base, {
		'id': `base${index}`,
		'width': window.innerWidth / 10,
		'height': window.innerHeight / 10,
		'stroke': 'blue',
		'fill': 'green',
		'y': window.innerHeight - ((window.innerHeight / 10) + (window.innerHeight / 20)),
		'x': ((window.innerWidth / 5) * index ) - ((window.innerWidth / 10) / 2)
	})
	baseArray.push(base)
}
baseArray.forEach(el => source.appendChild(el))

const target = (event) => {
	const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
	assignAttributes(rect, {
		'width': 10,
		'height': 10,
		'x': event.clientX - 13,
		'y': event.clientY - 13,
		'stroke': 'green',
		'fill': 'none'
	})

	source.appendChild(rect)
}

document.addEventListener('click', target)
setInterval(() => {

}, 20)