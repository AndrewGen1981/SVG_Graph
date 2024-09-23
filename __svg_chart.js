// ***  SVG Chart Tools
import roundPathCorners from "./roundPath.js"


// Returns an SVG range
function getRange(svg) {
    if (!svg) return {}

    const viewBoxAttr = svg.getAttribute("viewBox")
    if (!viewBoxAttr) return {}
    
    const viewBoxRange = viewBoxAttr.split(/\s+|,/)
    if (viewBoxRange?.length < 4) return {}

    return { 
        x1: parseInt(viewBoxRange[0] || 0),
        y1: parseInt(viewBoxRange[1] || 0),
        x2: parseInt(viewBoxRange[2] || 0),
        y2: parseInt(viewBoxRange[3] || 0) * 0.98
    }
}



// Returns 3-color gradient
function getGradient(params = {}) {
    const { gradientID = "gradient", x2 = 0, y2 = 1 } = params

    return `<linearGradient id="${ gradientID }" x2="${ x2 }" y2="${ y2 }">
        <stop offset="0%" stop-color="var(--color-stop-1)" />
        <stop offset="50%" stop-color="var(--color-stop-2)" />
        <stop offset="100%" stop-color="var(--color-stop-3)" />
    </linearGradient>`
}



// Returns grid-lines
function getGridLinesHTML(params = {}) {
    const { gridNormalLines = 6, isSubGrid = true, x1, y1, x2, y2 } = params
    if (isNaN(x2 - x1) || isNaN(y2 - y1)) return

    const step = Math.floor((x2 - x1) / gridNormalLines)
    const halfStep = Math.floor(step / 2)

    return Array.from({ length: gridNormalLines }, (_, index) => index + 1)
    .map((l) => {
        const x = l * step + 1
        let line = isSubGrid && `<line class="subgrid-line" x1="${ x - halfStep }" y1="${ y1 }" x2="${ x - halfStep }" y2="${ y2 }"/>`
        line += `<line class="grid-line" x1="${ x }" y1="${ y1 }" x2="${ x }" y2="${ y2 }"/>`
        return line
    })
    .join("")
}



function getLinePathElement(data, ratio, step, isFill, gradientID) {
    // -5 because of @stroke-width: 5px;
    return `
        <path d="${ `M -5 -5 L -5 ${ data[0] * ratio }` }
        ${ data.reduce((acc, cur, i) => acc + `L ${ step * i } ${ cur * ratio } `, "") }
        V -5 Z" stroke="gray" fill=${ isFill ? `url(#${ gradientID })` : "none" } />
    `
}


function getCurvPathElement(data, ratio, step, isFill, gradientID) {
    return `
        <path d="${ `M -5 -5 L -5 ${ data[0] * ratio }` }
        ${ roundPathCorners(data.reduce((acc, cur, i) => acc + `L ${ step * i } ${ cur * ratio } `, ""), 15) }
        V -5 Z" stroke="gray" fill=${ isFill ? `url(#${ gradientID })` : "none" } />
    `
}


function getCurv1PathElement(data, ratio, step, isFill, gradientID) {
    let path = ""
    
    for (let i = 0; i < data.length; i++) {
        
        const i1 = i + 1
        const i2 = i + 2

        if (data[i2] !== undefined) {

            const ay = data[i] * ratio
            const by = data[i1] * ratio
            const cy = data[i2] * ratio

            const byDirection = (by - ay) / (Math.abs(by - ay) || 1)
            const cyDirection = (cy - by) / (Math.abs(cy - by) || 1)

            const x1 = step * i + step * 0.2
            const y1 = ay + by * byDirection * 0.1
            
            const x2 = step * i2 - step * 0.9
            const y2 = by - cy * cyDirection * 0.1

            const x = step * i2
            const y = cy

            path += `C ${ x1 } ${ y1 }, ${ x2 } ${ y2 }, ${ x } ${ y } `

            i++

        }
    }

    return `
        <path d="${ `M -5 -5 L -5 ${ data[0] * ratio }` } ${ path }
        V -5 Z" stroke="gray" fill=${ isFill ? `url(#${ gradientID })` : "none" } />
    `
}



// Returns line SVG chart
function getChartHTML(graphData = {}) {
    const { graph, isVGrid = true, isFill = false, isCurv = "line", data } = graphData
    if (!graph || !data?.length) return

    const { x1 = 0, y1 = 0, x2 = 0, y2 = 0 } = getRange(graph)
    if (( x2 - x1 === 0) || (y2 - y1 === 0)) return console.log("svg item viewBox issue: some of the bounds are absent")

    const gradientID = `gr${ Math.round(Math.random() * 1000) }`
    
    const valStep = Math.round((x2 - x1) / (data.length - 1))

    // const maxVal = data.reduce((acc, cur) => cur > acc ? cur : acc ,data[0])
    const maxVal = Math.max(...data)
    const lineRatio = y2 / maxVal

    const dataHTML =
    isCurv === "line" ? getLinePathElement(data, lineRatio, valStep, isFill, gradientID) :
    isCurv === "curv" ? getCurvPathElement(data, lineRatio, valStep, isFill, gradientID) :
    getCurv1PathElement(data, lineRatio, valStep, isFill, gradientID)

    graph.innerHTML =
    `
        ${ isFill && getGradient({ gradientID }) }
        ${ isVGrid && getGridLinesHTML({ x1, y1, x2, y2 }) }
        ${ dataHTML }
    `
}



export {
    getRange,
    getGradient,
    getGridLinesHTML,
    getChartHTML
}