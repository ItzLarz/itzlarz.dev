var messageSent;
document.onclick = function() {
	if(gamePlaying) {
		if (gameOver && !messageSent) {
			if (win) {
				
			}

			else if (defeat) {
				
			}

			messageSent = true;
		}
	}

	else if (!gamePlaying) {
		messageSent = false;
	}
}
