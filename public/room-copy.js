const myId = v4()

let broadcasts = {}
let watches = {}

const socket = io("/")

const config = {
    iceServers: [
        {
            urls: "stun:stun.l.google.com:19302",
        },
    ],
}

function hasMediaDevises() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
}
const myVideo = document.createElement("video")
myVideo.muted = true

if (hasMediaDevises()) {
    navigator.mediaDevices
        .getUserMedia({
            video: true,
            audio: true,
        })
        .then((stream) => {
            addVideo(myVideo, stream, myId)
            socket.emit("join-room", ROOM_ID, myId)
            recalculateLayout()
        })
} else {
    console.log("mediaDevice not suported in your device")
}
socket.on("got-you", (sender_id) => {
    const peerConnection = new RTCPeerConnection(config)
    broadcasts[sender_id] = peerConnection
    console.log(sender_id)
    let stream = myVideo.srcObject
    stream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, stream))
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            //to watcher from broadcaster
            socket.emit("candidateToWatcher", sender_id, myId, event.candidate)
        }
    }
    peerConnection
        .createOffer()
        .then((sdp) => peerConnection.setLocalDescription(sdp))
        .then(() => {
            socket.emit(
                "offer",
                sender_id,
                myId,
                peerConnection.localDescription
            )
        })
})

socket.on("user-connected", (user_id) => {
    socket.emit("got-you", user_id, myId)
    const peerConnection = new RTCPeerConnection(config)
    broadcasts[user_id] = peerConnection
    console.log(user_id)
    let stream = myVideo.srcObject
    stream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, stream))
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            //to watcher from broadcaster
            socket.emit("candidateToWatcher", user_id, myId, event.candidate)
        }
    }
    peerConnection
        .createOffer()
        .then((sdp) => peerConnection.setLocalDescription(sdp))
        .then(() => {
            socket.emit("offer", user_id, myId, peerConnection.localDescription)
        })
})
socket.on("candidateToBroadCast", (user_id, candidate) => {
    console.log(candidate)
    broadcasts[user_id].addIceCandidate(new RTCIceCandidate(candidate))
})
socket.on("answer", (user_id, description) => {
    broadcasts[user_id].setRemoteDescription(description)
})

//watcher
socket.on("offer", (sender_id, description) => {
    let video = document.createElement("video")
    watches[sender_id] = new RTCPeerConnection(config)
    watches[sender_id]
        .setRemoteDescription(description)
        .then(() => watches[sender_id].createAnswer())
        .then((sdp) => watches[sender_id].setLocalDescription(sdp))
        .then(() => {
            socket.emit(
                "answer",
                sender_id,
                myId,
                watches[sender_id].localDescription
            )
        })
    watches[sender_id].ontrack = (event) => {
        addVideo(video, event.streams[0], sender_id)
        video.muted = true
        recalculateLayout()
    }
    watches[sender_id].onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit(
                "candidateToBroadCast",
                sender_id,
                myId,
                event.candidate
            )
        }
    }
})
socket.on("candidateToWatcher", (sender_id, candidate) => {
    watches[sender_id]
        .addIceCandidate(new RTCIceCandidate(candidate))
        .catch((e) => console.error(e))
})

socket.on("user-disconnected", (id) => {
    let _id = ""
    for (let i = 0; i < id.length; i++) {
        _id += id[i] != "-" & isNaN(parseInt(id[i])) ? id[i] : ""
    }
    let container = document.querySelector(`#${_id}`)
    container.remove()
})

function addVideo(video, stream, id) {
    let _id = ""
    for (let i = 0; i < id.length; i++) {
        _id += id[i] != "-" & isNaN(parseInt(id[i])) ? id[i] : ""
    }
    let left = document.querySelector(".gallery")
    let container = document.createElement("div")
    container.classList.add("video_container")
    container.id = _id
    video.srcObject = stream
    video.play()
    container.append(video)
    left.append(container)
}
