
const source = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
assignAttributes(source, {
	id: 'source',
	height: window.innerHeight,
	width: window.innerWidth,
	style: 'background: black'
})
document.body.appendChild(source)

const ground = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
assignAttributes(ground, {
	width: window.innerWidth,
	height: window.innerHeight / 10,
	x: 0,
	y: window.innerHeight - (window.innerHeight / 10),
	stroke: 'green',
	fill: 'brown'
})
source.appendChild(ground)

const baseArray = []

for (let index = 1; index <= 4; index++) {
	const base = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
	assignAttributes(base, {
		id: `base${index}`,
		width: window.innerWidth / 10,
		height: window.innerHeight / 10,
		stroke: 'blue',
		fill: 'green',
		y: window.innerHeight - ((window.innerHeight / 10) + (window.innerHeight / 20)),
		x: ((window.innerWidth / 5) * index ) - ((window.innerWidth / 10) / 2)
	})
	baseArray.push(base)
}
baseArray.forEach(el => source.appendChild(el))

const target = (event) => {
	const speed = 5
	const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
	assignAttributes(rect, {
		width: 10,
		height: 10,
		x: event.clientX - 13,
		y: event.clientY - 13,
		stroke: 'green',
		fill: 'none'
	})
	source.appendChild(rect)
	
	const origin = weighBases(event.clientX)
	const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
	assignAttributes(line, {
		id: Math.random() * 200,
		x1: origin[0],
		y1: origin[1],
		stroke: 'yellow',
	})
	const drawLineX = document.createElementNS('http://www.w3.org/2000/svg', 'animate')
	assignAttributes(drawLineX, {
		attributeName: 'x2',
		values: `${origin[0]};${event.clientX}`,
		dur: `${speed}s`,
		fill: 'freeze'
	})
	const drawLineY = document.createElementNS('http://www.w3.org/2000/svg', 'animate')
	assignAttributes(drawLineY, {
		attributeName: 'y2',
		values: `${origin[1]};${event.clientY}`,
		dur: `${speed}s`,
		fill: 'freeze'
	})
	line.appendChild(drawLineX)
	line.appendChild(drawLineY)
	
	const expolosion = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
	assignAttributes(expolosion, {
		cx: event.clientX,
		cy: event.clientY,
		stroke: 'green',
		fill: 'yellow'
	})
	const explode = document.createElementNS('http://www.w3.org/2000/svg', 'animate')
	assignAttributes(explode, {
		attributeName: 'r',
		values: '0;20;0',
		duration: '3s'
	})
	expolosion.appendChild(explode)

	drawLineX.addEventListener('endEvent',() => rect.append(expolosion))
	source.appendChild(line)
}

document.addEventListener('click', target)


setInterval(() => {
	
}, 20)

function weighBases(targetX) {
	let result = []
	let choice
	let lowest

	baseArray.forEach((base, i) => {
		const weight = Math.abs(targetX - base.getAttribute('x'))
		if (choice === undefined){
			choice = i
			lowest = weight
		} else {
			Math.abs(targetX - base.getAttribute('x'))
			if (lowest > weight) {
				lowest = weight
				choice = i
			}
		}
	})
	result = [baseArray[choice].getAttribute('x'), baseArray[choice].getAttribute('y')]
	return result
}
function assignAttributes(element, attributes) {
	Object.keys(attributes).forEach(key => element.setAttribute(key, attributes[key]))
}