const express = require("express")
const ejs = require("ejs")
const socketio = require("socket.io")
const { PeerServer, ExpressPeerServer } = require("peer")

const app = express()
const server = app.listen(3000, () => {
    console.log("Listening on port 3000")
})
const peerServer = ExpressPeerServer(server, {
    debug: true,
})
peerServer.on("connection", (client)=>{
    console.log("Client Id:", client.id)
})

const io = socketio(server)
io.on("connection", (s) => {
    s.on("join-room", (room_id, user_id) => {
        s.join(room_id)
        s.to(room_id).broadcast.emit("user-connected", user_id)
        s.on("disconnect", () => {
            s.to(room_id).broadcast.emit("user-disconnected", user_id)
        })
    })
})

app.use("/peerjs", peerServer)
app.set("view engine", "ejs")
app.use(express.static("public"))

app.get("/", (req, res) => {
    res.render("index")
})
app.get("/:id", (req, res) => {
    let { id } = req.params
    res.render("room", { id })
})
