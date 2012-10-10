define('./x', ['./y', './z'], { name: 'x' })
define('./y', ['./x'], { name: 'y' })
define('./z', ['./x'], { name: 'z' })