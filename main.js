
const source = document.createElement('canvas')
assignAttributes(source, {
	id: 'source',
	height: window.innerHeight,
	width: window.innerWidth
})
document.body.appendChild(source)

const context = source.getContext('2d', {alpha: 'false'})

const baseArray = []
//create bases
for (let index = 1; index <= 4; index++) {
	const base = {
		origin: [
			((window.innerWidth / 5) * index ) - ((window.innerWidth / 10) / 2),
			window.innerHeight - ((window.innerHeight / 10) + (window.innerHeight / 20))
		],
		canFire: true,
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
	base.fireFrom = () => [
		base.origin[0] + base.dimensions[0] / 2, 
		base.origin[1]
	]
	baseArray.push(base)
}

const targetArray = []
//when mouse click occurs attemp to create target and fire
const target = (event) => {
	context.save()
	const target = {
		cycles: 50,
		origin: [
			event.clientX - 8,
			event.clientY - 8
		],
		reticle: {
			dimensions: [
				10,
				10
			],
			color: 'green'
		},
		line: {			
			color: 'yellow',
			progress: .01			
		},
		explosionSize: 20,
		expolosionColor: 'yellow',
	}
	target.reticle.offset = [
		target.origin[0] - target.reticle.dimensions[0] / 2,
		target.origin[1] - target.reticle.dimensions[1] / 2
	]
	const source = weighBases(event.clientX)
	if (source === -1) {
		return
	} else {
		target.line.source = source
	}
	target.line.start = source.fireFrom()
	target.line.vector = [
		target.origin[0] - target.line.start[0],
		target.origin[1] - target.line.start[1]		
	]
	target.line.magnitude = Math.sqrt(Math.pow(target.line.vector[0], 2) 
	+ Math.pow(target.line.vector[1], 2))
	target.line.vector = [
		target.line.vector[0] / target.line.magnitude, 
		target.line.vector[1] / target.line.magnitude
	]
	target.line.end = () => [
		target.line.start[0] + ((target.line.magnitude * target.line.progress) * target.line.vector[0]), 
		target.line.start[1] + ((target.line.magnitude * target.line.progress) * target.line.vector[1])
	]
	target.line.source.canFire = false

	target.draw = () => {		
		context.strokeStyle = target.reticle.color
		context.strokeRect(
			target.reticle.offset[0], 
			target.reticle.offset[1], 
			target.reticle.dimensions[0],
			target.reticle.dimensions[1]
		)	
		
		if (target.cycles < 49 && target.cycles > 20) {		
			context.strokeStyle = target.line.color
			context.beginPath()
			context.moveTo(target.line.start[0], target.line.start[1])
			context.lineTo(target.line.end()[0], target.line.end()[1])
			context.stroke()
			if (target.line.progress < 1 ) {
				target.line.progress += .04
			}			
		}	
		if (target.cycles < 20) {
			target.line.source.canFire = true
		}	
		target.cycles--
	}
	targetArray.push(target)
}

document.addEventListener('click', target)

//gameLoop
setInterval(() => {
	context.clearRect(0, 0, window.innerWidth, window.innerHeight)
	context.fillStyle = 'black'
	context.fillRect(0, 0, window.innerWidth, window.innerHeight) // background
	context.fillStyle = 'brown'
	context.fillRect( //ground
		0, 
		window.innerHeight - (window.innerHeight / 10), 
		window.innerWidth, 
		window.innerHeight / 10
	)
	baseArray.forEach(ele => {
		context.fillStyle = ele.color()
		context.fillRect(ele.origin[0], ele.origin[1], ele.dimensions[0], ele.dimensions[1])
	})

	targetArray.filter(ele => {
		if (ele.cycles > 0) {
			ele.draw()
			return ele
		}
	})
}, 100)

//determine which base, if any, can fire at target
function weighBases(targetX) {
	let result = []
	let choice
	let lowest

	baseArray.forEach((base, i) => {
		const weight = Math.abs(targetX - base.origin[0])
		if (base.health > 0 && base.canFire) {
			if (choice === undefined){
				choice = i
				lowest = weight
			} else {
				if (lowest > weight) {
					lowest = weight
					choice = i
				}
			}
		}
	})
	if (choice !== undefined) {
		result = baseArray[choice]
	} else {
		result = -1
	}
	return result
}
function assignAttributes(element, attributes) {
	Object.keys(attributes).forEach(key => element.setAttribute(key, attributes[key]))
}