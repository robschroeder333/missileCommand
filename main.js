
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

let targetArray = []
//when mouse click occurs attemp to create target and fire
const target = (event) => {
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
		explosion: {
			maxSize: 30,
			color: ['red', 'yellow'],
			size: 1
		}
		
	}
	target.reticle.offset = [
		target.origin[0] - target.reticle.dimensions[0] / 2,
		target.origin[1] - target.reticle.dimensions[1] / 2
	]
	const source = weighBases(event.clientX)
	if (source === null) {
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
		if (target.cycles > 35) {
			context.strokeStyle = target.reticle.color
			context.strokeRect(
				target.reticle.offset[0], 
				target.reticle.offset[1], 
				target.reticle.dimensions[0],
				target.reticle.dimensions[1]
			)	
		}		
		if (target.cycles > 15) {		
			context.strokeStyle = target.line.color
			context.beginPath()
			context.moveTo(target.line.start[0], target.line.start[1])
			context.lineTo(target.line.end()[0], target.line.end()[1])
			context.stroke()
			if (target.line.progress < 1 ) {
				target.line.progress += .04
			}			
		}	
		if (target.cycles <= 25) {
			target.line.source.canFire = true
			context.fillStyle = target.explosion.color[0]
			context.strokeStyle = target.explosion.color[1]
			context.beginPath()
			context.arc(target.origin[0], target.origin[1], target.explosion.size, 0, 360)
			context.fill()
			context.stroke()
			target.explosion.size += target.explosion.maxSize / 20
			missleArray = missleArray.filter(ele => {
				const colided = (origin, target) => {
					console.log(target.explosion.size)
					return Math.pow(origin[0] - target.origin[0], 2) 
							+ Math.pow(origin[1] - target.origin[1], 2)
							<= Math.pow(target.explosion.size, 2)
				}
				
				if (colided(ele.origin, target)) {					
					ele.explode = true
				}
				return ele
			})
		}	
		target.cycles--
	}
	targetArray.push(target)
}



let missleArray = []
let missleDelay = 0
const missleSpawner = () => {
	const targetChoice = Math.floor(Math.random() * 4)
	const missle = {
		origin: [
			Math.random() * (window.innerWidth - 20) + 20,
			10
		],
		cycles: 20,
		explode: false,
		target: baseArray[targetChoice].fireFrom(),
		base: targetChoice,
		length: 10,
		speed: () => {
			if (difficulty > 10 && difficulty < 15) {
				return 4
			} else if (difficulty > 15) {
				return 5
			} else {
				return 3
			}
		},
		explosion: {
			maxSize: 10,
			color: ['red', 'yellow'],
			size: 1
		}			
	}
	missle.drawExplosion = () => {
		context.fillStyle = missle.explosion.color[0]
		context.strokeStyle = missle.explosion.color[1]
		context.beginPath()
		context.arc(missle.origin[0], missle.origin[1], missle.explosion.size, 0, 360)
		context.fill()
		context.stroke()
		missle.explosion.size += missle.explosion.maxSize / 20
	}	
	missle.vector = [
		missle.target[0] - missle.origin[0],
		missle.target[1] - missle.origin[1]
	]
	missle.magnitude = Math.sqrt(Math.pow(missle.vector[0], 2) 
									+ Math.pow(missle.vector[1], 2))
	missle.vector = [
		missle.vector[0] / missle.magnitude,
		missle.vector[1] / missle.magnitude,
	]
	if (difficulty + 3 > missleArray.length) {		
		missleArray.push(missle)
	}								
	difficulty = difficulty > 20 ? 20 : Math.floor(score / 10)
	return Math.max(1, 20 - difficulty)
}

let score = 0
let difficulty = 1
let gameOver = false


const gameStart = function () {
	document.getElementById('opening').remove()
	setTimeout(() => {
		document.addEventListener('click', target)		
	}, 200)
	setInterval(() => {//gameLoop
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

		missleArray = missleArray.filter(ele => {
			if (ele.cycles > 0) {
				if (!ele.explode) {
					context.strokeStyle = 'white'
					context.lineWidth = 3
					context.beginPath()
					context.moveTo(ele.origin[0], ele.origin[1])
					context.lineTo(
						ele.origin[0] - (ele.vector[0] * ele.length), 
						ele.origin[1] - (ele.vector[1] * ele.length))
					context.stroke()
					context.lineWidth = 1
				}
				if (ele.explode) {
					ele.drawExplosion()
					ele.cycles--
				} else if (ele.origin[1] >= ele.target[1]) {
					ele.explode = true
					baseArray[ele.base].health = Math.max(0, baseArray[ele.base].health - 1)
				} else {
					ele.origin[0] = ele.origin[0] + ele.vector[0] * ele.speed()
					ele.origin[1] = ele.origin[1] + ele.vector[1] * ele.speed()
				}
				return ele
			}
		})
		targetArray = targetArray.filter(ele => {
			if (ele.cycles > 0) {
				ele.draw()
				return ele
			}
		})
		if (missleDelay < 1) {
			missleDelay = missleSpawner()
		}
		missleDelay--

		if (gameOver) {
			clearInterval()
		}
	}, 100)
}

//determine which base, if any, can fire at target
function weighBases(targetX) {
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
		return baseArray[choice]
	} else {
		return null
	}
}
function assignAttributes(element, attributes) {
	Object.keys(attributes).forEach(key => element.setAttribute(key, attributes[key]))
}