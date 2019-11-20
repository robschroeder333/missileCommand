'use strict'

let baseArray = []
let targetArray = []
let missileArray = []
let missileDelay = 0
let score = 0
let difficulty = 1
let baseCount
let highScore = 0
let listener

const source = document.createElement('canvas')
const context = source.getContext('2d', {alpha: 'false'})
const button = document.createElement('button')
const cScore = document.createElement('h1')
const hScore = document.createElement('h1')

assignAttributes(source, {
	id: 'source',
	height: window.innerHeight,
	width: window.innerWidth
})
button.innerHTML = 'Play Again?'
button.onmouseup = () => {
	button.remove()
	hScore.remove()
	cScore.remove()
	gameStart()
	return false
}
cScore.setAttribute('id', 'cScore')
hScore.setAttribute('id', 'hScore')

function gameStart() {	
	targetArray = []
	missileArray = []
	baseArray = []
	score = 0

	setTimeout(() => { //delay click listener to prevent unintended click at beginning of game
		listener = document.addEventListener('click', target)		
	}, 200)
	
	makeBases()
	const gameLoop = setInterval(() => {	
		context.clearRect(0, 0, window.innerWidth, window.innerHeight)
		context.fillStyle = 'black'
		context.fillRect(0, 0, window.innerWidth, window.innerHeight) //draw background
		context.save()
		context.fillStyle = 'brown'
		context.translate(0, window.innerHeight - (window.innerHeight / 10))
		context.fillRect(0, 0, window.innerWidth, window.innerHeight / 10) //draw ground
		context.restore()
		document.body.appendChild(source)
		baseCount = baseArray.length

		baseArray.forEach(base => {//draw bases
			if (base.health === 0) {
				baseCount--
			}
			context.save()
			context.fillStyle = base.color()
			context.translate(base.origin[0], base.origin[1])
			context.fillRect(0, 0, base.dimensions[0], base.dimensions[1])
			context.restore()
		})

		missileArray = missileArray.filter(missile => {
			if (missile.cycles > 0) {
				if (!missile.explode) {//draw missile
					context.save()
					context.strokeStyle = 'white'
					context.lineWidth = 3
					context.translate(missile.origin[0], missile.origin[1])
					context.beginPath()
					context.moveTo(0, 0)
					context.lineTo(-(missile.vector[0] * missile.length), -(missile.vector[1] * missile.length))
					context.stroke()					
					context.restore()
				}
				if (missile.explode) {
					missile.drawExplosion()
					missile.cycles--
				} else if (missile.origin[1] >= missile.target[1]) {
					missile.explode = true
					baseArray[missile.base].health = Math.max(0, baseArray[missile.base].health - 1)
				} else {
					missile.origin[0] = missile.origin[0] + missile.vector[0] * missile.speed()
					missile.origin[1] = missile.origin[1] + missile.vector[1] * missile.speed()
				}
				return missile
			}
		})
		targetArray = targetArray.filter(target => {
			if (target.cycles > 0) {
				target.draw()
				return target
			}
		})
		if (missileDelay < 1) {
			missileDelay = missileSpawner()
		}
		missileDelay--
		if (baseCount === 0) {
			gameOver(gameLoop)
		}
		if (score !== 0 && score >= highScore) {
			context.fillStyle = 'white'
			context.font = '20px Georgia'
			context.fillText(`New High Score = ${score}`, 10, 20)
			highScore = score
		} else {
			context.fillStyle = 'white'
			context.font = '20px Georgia'
			context.fillText(`Score = ${score}`, 10, 20)
		}
	}, 100)
}

function gameOver(gameLoop) {
	clearInterval(gameLoop)
	clearTimeout(listener)
	source.remove()
	context.clearRect(0, 0, window.innerWidth, window.innerHeight)
	context.fillStyle = 'black'
	context.fillRect(0, 0, window.innerWidth, window.innerHeight)
	context.fillStyle = 'white'
	if (score === highScore) {
		hScore.textContent = `New High Score = ${score}`
		document.body.appendChild(hScore)
	} else {
		hScore.textContent = `High Score = ${highScore}`
		cScore.textContent = `Your Score = ${score}`
		document.body.appendChild(hScore)
		document.body.appendChild(cScore)
	}
	document.body.appendChild(button)
}

function makeBases() {
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

}

//when mouse click occurs attemp to create target and fire
function target(event) {
	const target = {//initialize target object
		cycles: 50,
		origin: [event.clientX - 8, event.clientY - 8],
		reticle: {
			dimensions: [10, 10],
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
		((target.line.magnitude * target.line.progress) * target.line.vector[0]), 
		((target.line.magnitude * target.line.progress) * target.line.vector[1])
	]
	target.line.source.canFire = false


	target.draw = () => {		
		if (target.cycles > 35) {//draw reticle where click happened
			context.save()
			context.strokeStyle = target.reticle.color
			context.translate(target.reticle.offset[0], target.reticle.offset[1])
			context.strokeRect(0, 0, target.reticle.dimensions[0], target.reticle.dimensions[1])	
			context.restore()
		}		
		if (target.cycles > 15) {//draw laser	
			context.save()	
			context.strokeStyle = target.line.color
			context.translate(target.line.start[0], target.line.start[1])
			context.beginPath()
			context.moveTo(0, 0)
			context.lineTo(target.line.end()[0], target.line.end()[1])
			context.stroke()
			context.restore()
			if (target.line.progress < 1 ) {//'animate' laser
				target.line.progress += .04
			}			
		}	
		if (target.cycles <= 25) {//draw explosion		
			context.save()
			context.fillStyle = target.explosion.color[0]
			context.strokeStyle = target.explosion.color[1]
			context.translate(target.origin[0], target.origin[1])
			context.beginPath()
			context.arc(0, 0, target.explosion.size, 0, 360)
			context.fill()
			context.stroke()
			context.restore()
			target.explosion.size += target.explosion.maxSize / 20 //'animate' explosion

			missileArray = missileArray.filter(ele => {//check if the head of missile touches an explosion
				const colided = (origin, target) => {
					return Math.pow(origin[0] - target.origin[0], 2) 
							+ Math.pow(origin[1] - target.origin[1], 2)
							<= Math.pow(target.explosion.size, 2)
				}
				
				if (colided(ele.origin, target) && !ele.explode) {					
					ele.explode = true
					score++
				}
				return ele
			})
		}	
		if (target.cycles === 25) {
			target.line.source.canFire = true
		}
		target.cycles--
	}
	targetArray.push(target)
}




function missileSpawner() {
	const targetChoice = Math.floor(Math.random() * 4)
	const missile = {//initialize missile
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
	missile.drawExplosion = () => {
		context.save()
		context.fillStyle = missile.explosion.color[0]
		context.strokeStyle = missile.explosion.color[1]
		context.translate(missile.origin[0], missile.origin[1])
		context.beginPath()
		context.arc(0, 0, missile.explosion.size, 0, 360)
		context.fill()
		context.stroke()
		context.restore()
		missile.explosion.size += missile.explosion.maxSize / 20//animate explosion
	}	
	missile.vector = [
		missile.target[0] - missile.origin[0],
		missile.target[1] - missile.origin[1]
	]
	missile.magnitude = Math.sqrt(Math.pow(missile.vector[0], 2) 
									+ Math.pow(missile.vector[1], 2))
	missile.vector = [
		missile.vector[0] / missile.magnitude,
		missile.vector[1] / missile.magnitude,
	]
	if (difficulty + 3 > missileArray.length) {		
		missileArray.push(missile)
	}								
	difficulty = difficulty > 20 ? 20 : Math.floor(score / 10)
	return Math.max(1, 20 - difficulty)
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
//helper for making attribute assignment less tedious
function assignAttributes(element, attributes) {
	Object.keys(attributes).forEach(key => element.setAttribute(key, attributes[key]))
}