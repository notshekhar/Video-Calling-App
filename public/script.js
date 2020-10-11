let create_room_btn = document.querySelector(".create_new_room")
let join_room_inp = document.querySelector(".join")
let join_room_btn = document.querySelector(".join_room")

join_room_btn.onclick = () => {
    let room_id = join_room_inp.value
    if (room_id.length > 0) {
        location.href = `/${room_id}`
    }
}

create_room_btn.onclick = function () {
    let room_id = v4()
    location.href = room_id
}
