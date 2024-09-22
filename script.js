import { getChartHTML } from  "./__svg_chart.js"


const data = [ 21, 24, 8, 7, 9, 4, 11, 14, 13, 16, 12, 10, 3 ]
// const data = Array.from({ length: 13 }, (_, index) => (Math.random() * 50) || 1)


getChartHTML({
    graph: document.querySelector("svg#graph"),
    isFill: true,
    // isCurv: "line",
    // isCurv: "curv",
    isCurv: "curv1",
    data
})

getChartHTML({
    graph: document.querySelector("svg#graph1"),
    data
})