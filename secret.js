var password = "CarBus is the best youtuber";

function passcheck() {
    if (document.getElementById("pass1").value != password) {
        alert("INCORRECT PASSWORD :(")
        return false
    }

    if (document.getElementById("pass1").value == password) {
        alert("Correct Password")
    }
}