let bottom = document.querySelector(".bottom")

window.onmousemove = (e) => {
    let y = e.clientY
    let height = window.innerHeight
    if (y >= height - 200) {
        bottom.classList.remove("hide_bottom")
        bottom.classList.add("show_bottom")
        setTimeout(() => {
            bottom.classList.add("hide_bottom")
            bottom.classList.remove("show_bottom")
        }, 5000)
    } else {
        bottom.classList.add("hide_bottom")
        bottom.classList.remove("show_bottom")
    }
}

function recalculateLayout() {
    const gallery = document.querySelector(".gallery")
    const aspectRatio = 16 / 9
    const screenWidth = document.querySelector(".left").getBoundingClientRect()
        .width
    const screenHeight = document.querySelector(".left").getBoundingClientRect()
        .height
    const videoCount = document.querySelectorAll("video").length

    const calculateLayout = (
        containerWidth,
        containerHeight,
        videoCount,
        aspectRatio
    ) => {
        let bestLayout = {
            area: 0,
            cols: 0,
            rows: 0,
            width: 0,
            height: 0,
        }
        for (let cols = 1; cols <= videoCount; cols++) {
            const rows = Math.ceil(videoCount / cols)
            const hScale = containerWidth / (cols * aspectRatio)
            const vScale = containerHeight / rows
            let width
            let height
            if (hScale <= vScale) {
                width = Math.floor(containerWidth / cols)
                height = Math.floor(width / aspectRatio)
            } else {
                height = Math.floor(containerHeight / rows)
                width = Math.floor(height * aspectRatio)
            }
            const area = width * height
            if (area > bestLayout.area) {
                bestLayout = {
                    area,
                    width,
                    height,
                    rows,
                    cols,
                }
            }
        }
        return bestLayout
    }

    const { width, height, cols } = calculateLayout(
        screenWidth,
        screenHeight,
        videoCount,
        aspectRatio
    )

    gallery.style.setProperty("--width", width + "px")
    gallery.style.setProperty("--height", height + "px")
    gallery.style.setProperty("--cols", cols + "")

    let vide_cont = document.querySelectorAll(".video_container")
    for (let i = 0; i < vide_cont.length; i++) {
        if(!vide_cont[i].querySelector("video")){
            vide_cont[i].remove()
        }
    }
}
window.onresize = () => recalculateLayout()
