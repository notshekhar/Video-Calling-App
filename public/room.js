let bottom = document.querySelector(".bottom")
let video_count = 0
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

let socket = io("/")

const user_id = v4()
let calls = {}

const peer = new Peer(user_id, {
    host: "/",
    port: 3000,
    path: "/peerjs"
})
peer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id)
})
socket.on("user-disconnected", (uid) => {
    console.log("disconnected", uid)
    if (calls[uid]) calls[uid].close()
})

function hasMediaDevises() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
}

if (hasMediaDevises()) {
    navigator.mediaDevices
        .getUserMedia({
            video: true,
            audio: true,
        })
        .then((stream) => {
            let myvideo = document.createElement("video")
            addVideo(myvideo, stream, true)
            peer.on("call", (call) => {
                console.log("recevied a call")
                call.answer(stream)
                let video = document.createElement("video")
                call.on("stream", (userVideoStream) => {
                    addVideo(video, userVideoStream)
                    recalculateLayout()
                })
            })
            peer.on("error", (err) => console.log(err))
            socket.on("user-connected", (user) => {
                console.log("connection", user)
                conntectToUser(stream, user)
            })
            recalculateLayout()
        })
} else {
    console.log("mediaDevice not suported in your device")
}

function conntectToUser(stream, uid) {
    let call = peer.call(uid, stream)
    console.log("calling to id", uid)
    let video = document.createElement("video")
    call.on("stream", (userVideoStream) => {
        addVideo(video, userVideoStream)
        recalculateLayout()
    })
    call.on("error", (err) => console.log(err))
    call.on("close", () => {
        video.remove()
        recalculateLayout()
    })
    calls[uid] = call
}

function addVideo(video, stream, muted) {
    let left = document.querySelector(".gallery")
    let container = document.createElement("div")
    container.classList.add("video_container")
    video.srcObject = stream
    video.play()
    if (muted) video.muted = true
    container.append(video)
    left.append(container)
    video_count++
}
