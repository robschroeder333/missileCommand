
const source = document.createElement('canvas')
assignAttributes(source, {
	id: 'source',
	height: window.innerHeight,
	width: window.innerWidth
})
document.body.appendChild(source)

const context = source.getContext('2d', {alpha: 'false'})


const baseArray = []
for (let index = 1; index <= 4; index++) {
	const base = {
		origin: [
			((window.innerWidth / 5) * index ) - ((window.innerWidth / 10) / 2),
			window.innerHeight - ((window.innerHeight / 10) + (window.innerHeight / 20))
		],
		health: 2,
		dimensions: [
			window.innerWidth / 10,
			window.innerHeight / 10
		],
		color: () => {
			switch (base.health) {
			case 2:
				return 'green'				
			case 1:
				return 'yellow'				
			case 0:
				return 'red'						
			default:
				return 'red'						
			}
		}
	}
	baseArray.push(base)
}


const targetArray = []
const target = (event) => {
	const target = {
		cycles: 1000,
		origin: [
			event.clientX,
			event.clientY
		],
		reticle: {
			dimensions: [
				10,
				10
			],
			color: 'green'
		},
		line: {
			start: weighBases(event.clientX),
			color: 'yellow',
			length: 2			
		},
		explosionSize: 20,
		expolosionColor: 'yellow',
	}
	target.reticle.offset = [
		target.origin[0] - target.reticle.dimensions[0] - 3,
		target.origin[1] - target.reticle.dimensions[1] - 3
	]
	target.line.vector = [
		target.origin[0] - target.line.start[0],
		target.origin[1] - target.line.start[1]		
	]
	target.line.magnitude = Math.sqrt(Math.pow(target.line.vector[0], 2) + Math.pow(target.line.vector[1], 2))
	target.line.vector = [
		target.line.vector[0] / target.line.magnitude, 
		target.line.vector[1] / target.line.magnitude
	]
	target.line.end = [
		target.line.start[0] + (target.line.vector[0] * target.line.length), 
		target.line.start[1] * (target.line.vector[1] * target.line.length)
	]
	
	target.draw = () => {
		if (target.cycles > 0) {				
			context.strokeStyle = target.reticle.color
			context.strokeRect(
				target.reticle.offset[0], 
				target.reticle.offset[1], 
				target.reticle.dimensions[0],
				target.reticle.dimensions[1]
			)	
			
			if (target.cycles < 900 && target.cycles > 500) {
				context.strokeStyle = target.line.color
				context.beginPath()
				context.moveTo(target.line.start[0], target.line.start[1])
				context.lineTo(target.line.end)
				context.stroke()
				target.line.end += target.vector
			}
			target.cycles--
		} else {
			target
		}
	}
	targetArray.push(target)
}

document.addEventListener('click', target)

setInterval(() => {
	context.fillStyle = 'black'
	context.fillRect(0, 0, window.innerWidth, window.innerHeight) // background
	context.fillStyle = 'brown'
	context.fillRect( //ground
		0, 
		window.innerHeight - (window.innerHeight / 10), 
		window.innerWidth, 
		window.innerHeight / 10
	)
	baseArray.forEach((ele) => {
		context.fillStyle = ele.color()
		context.fillRect(ele.origin[0], ele.origin[1], ele.dimensions[0], ele.dimensions[1])
	})

	targetArray.forEach((ele, i) => {
		if (ele.cycles > 0) {
			ele.draw()
		} else {
			//remove
		}
		
	})
}, 100)

function weighBases(targetX) {
	let result = []
	let choice
	let lowest

	baseArray.forEach((base, i) => {
		const weight = Math.abs(targetX - base.origin[0])
		if (choice === undefined){
			choice = i
			lowest = weight
		} else {
			Math.abs(targetX - base.origin[0])
			if (lowest > weight) {
				lowest = weight
				choice = i
			}
		}
	})
	result = [baseArray[choice].origin[0], baseArray[choice].origin[1]]
	return result
}
function assignAttributes(element, attributes) {
	Object.keys(attributes).forEach(key => element.setAttribute(key, attributes[key]))
}