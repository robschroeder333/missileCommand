const source = document.getElementById('source')

const target1 = document.getElementById('target1')
const offset1 = target1.getAttribute('r')
const target2 = document.getElementById('target2')
const offset2 = target2.getAttribute('height')
let pos1 = [100, 100]
let pos2 = [100, 100]
let reverse1 = false
let reverse2 = false
const limit = source.getAttribute('height')

const test = (event) => {
	const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
	rect.setAttribute('width', 10)
	rect.setAttribute('height', 10)
	rect.setAttribute('x', event.clientX - 10)
	rect.setAttribute('y', event.clientY - 10)
	rect.setAttribute('stroke', 'green')
	rect.setAttribute('fill', 'none')

	source.appendChild(rect)
}
document.addEventListener('click', test)
setInterval(() => {

	if (reverse1) {
		pos1[0] -= 2
		if (pos1[0] < 0 + offset1) {
			reverse1 = !reverse1
		}		
	}else{
		pos1[0] += 2
		if (pos1[0] > limit - offset1) {
			reverse1 = !reverse1
		}		
	}
	target1.setAttribute('cx', pos1[0])

	if (reverse2) {
		pos2[1] -= 2
		if (pos2[1] < 0) {
			reverse2 = !reverse2
		}		
	}else{
		pos2[1] += 2
		if (pos2[1]> limit - offset2) {
			reverse2 = !reverse2
		}		
	}
	target2.setAttribute('y', pos2[1])	
}, 20)