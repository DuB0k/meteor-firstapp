//not var becouse it's a global variable
PlayersList = new Mongo.Collection('players');

if(Meteor.isClient){
	// this code only runs on the client
	Meteor.subscribe('thePlayers');
	
	Template.leaderboard.helpers({
		// helper functions go here
		'player': function() {
			var currentUserId = Meteor.userId();
			return PlayersList.find(
				{},
				{sort: {score: -1, name: 1}
			});
		},
		'selectedClass': function() {
			var playerId = this._id;
			var selectedPlayer = Session.get('selectedPlayer');
			if(playerId == selectedPlayer){
				return "selected";	
			}
		},
		'showSelectedPlayer': function(){
			var selectedPlayer = Session.get('selectedPlayer');
			return PlayersList.findOne(selectedPlayer);
		}
	});
	Template.leaderboard.events({
    // events go here
		'click .player': function(){
	        //console.log("You clicked a .player element");
			var playerId = this._id;
			Session.set('selectedPlayer', playerId);
	    },
		'click .increment': function(){
	        // Get the ID of the player that's been clicked
    	    var selectedPlayer = Session.get('selectedPlayer');
	        // Call a Meteor method and pass through selected player's ID and a value to increment by
    	    Meteor.call('modifyPlayerScore', selectedPlayer, 5);
		},
		'click .decrement': function(){
	        // Get the ID of the player that's been clicked
	        var selectedPlayer = Session.get('selectedPlayer');
	        // Call a Meteor method and pass through selected player's ID and a value to decrement by
	        Meteor.call('modifyPlayerScore', selectedPlayer, -5);
		},
		'click .remove': function(){
			var selectedPlayer = Session.get('selectedPlayer');
			var ok = confirm('Do you really want to delete user ' + PlayersList.findOne(selectedPlayer).name + '?');
			if(ok){
				Meteor.call('removePlayerData', selectedPlayer);
			}
		}
	});
	Template.addPlayerForm.events({ 
		'submit form': function(){
			//to avoid page refresh after submit a form
			event.preventDefault();
        	console.log("Form submitted");
			//this return the html element playerName
			//var playerNameVar = event.target.playerName;
			var playerNameVar = event.target.playerName.value; 
			var playerScore = event.target.score.value;
			
			event.target.playerName.value='';
			event.target.score.value='';

			Meteor.call('insertPlayerData', playerNameVar, playerScore);	
		}
	});
}
if(Meteor.isServer){
	// this code only runs on the server
	//we can see user data after meteor remove autopublish
	//console.log(PlayersList.find().fetch());
	
	Meteor.publish('thePlayers', function(){
		var currentUserId = this.userId;
		return PlayersList.find({createdBy: currentUserId})
	});
	
	Meteor.methods({ 
		'insertPlayerData': function(playerNameVar, playerScore){
			var currentUserId = Meteor.userId();
			PlayersList.insert({
	            name: playerNameVar,
	            score: parseInt(playerScore),
	            createdBy: currentUserId
			});
		},
		'removePlayerData': function(selectedPlayer){
			PlayersList.remove(selectedPlayer);	
		},
		'modifyPlayerScore': function(selectedPlayer,scoreValue){
			//$set updates only the fields passed as argument and deletes eveything else
			//PlayerList.update(selectedPlayer, {$set: {score: 5} });
			//$inc increments a value without deleting other fields
      		
			// Update a document and either increment or decrement the score field
      		PlayersList.update(selectedPlayer, {$inc: {score: scoreValue} });
		}
    });
}