let create_room_btn = document.querySelector(".create_new_room")

create_room_btn.onclick = function () {
    let room_id = v4()
    location.href = room_id
}
