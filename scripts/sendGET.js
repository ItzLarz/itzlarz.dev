var messageSent;
document.onclick = function() {
	if(gamePlaying) {
		if (gameOver && !messageSent) {
			var xhr = new XMLHttpRequest();
			var id = Math.floor(Math.random() * 1000000) + 1;
			
			if (win) {
				xhr.open("GET", "/gameOver?id=" + id.toString() + "&result=win" + "&bombs=" + bombs.toString() + "&rows=" + rows.toString() + "&columns=" + columns.toString(), true);
			}

			else if (defeat) {
				xhr.open("GET", "/gameOver?id=" + id.toString() + "&result=defeat" + "&bombs=" + bombs.toString() + "&rows=" + rows.toString() + "&columns=" + columns.toString(), true);
			}
			
			xhr.send();
			messageSent = true;
		}
	}

	else if (!gamePlaying) {
		messageSent = false;
	}
}
