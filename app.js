app = angular.module('pokeTeam', ['ngAnimate']);

app.controller('pokemon', function($scope, $http, $rootScope) {
	$scope.loading = true;
	$http.get('http://pokeapi.co/api/v2/pokedex/1').then(function(pokedex) {
		$scope.pokedex = pokedex.data.pokemon_entries;
		$scope.loading = false;
	});
	$scope.max_stats = {
		hp: 255,
		attack: 180,
		defense: 230,
		sp_atk: 180,
		sp_def: 230,
		speed: 180,
		total: 720
	};
	$scope.team = [];
	$scope.loadTeam = function() {
		$scope.loading = true;
		$scope.success = "Loading team ID " + $scope.load + ", please wait...";
		apiString = 'http://pokemon-team-api.herokuapp.com/teams/' + $scope.load;
		$http.get(apiString).then(function(team) {
			var newTeam = team.data.map(function(team_member){
				return $scope.loadSelected(team_member);
			});
			Promise.all(newTeam).then(function(loadedTeam){
				$rootScope.$evalAsync($scope.team = loadedTeam);
				for (var i in $scope.team) {
					for (var j in team.data[i].moves) {
				 	$scope.addMove(i, {id: team.data[i].moves[j]});
					}
				}
				$scope.loading = false;
				$scope.error = '';
				$scope.success = "Team ID " + $scope.load + " loaded";
			}).catch(function(error){
				$scope.error = "Error loading team: " + error;
				$scope.success = '';
				$scope.loading = false;
			});
		}, function() {
			$scope.error = "Invalid team ID";
			$scope.success = '';
			$scope.loading = false;
		});
	};
	$scope.saveTeam = function () {
		if ($scope.team.length > 0) {
			$scope.loading = true;
			var saveFile = [];
			for (var i in $scope.team) {
				saveFile.push({
					id: $scope.team[i].id,
					moves: $scope.team[i].moveset.map(function(move){
						return move.id;
					})
				});
			}
			$http.post('http://pokemon-team-api.herokuapp.com/teams/', saveFile).then(function(result) {
				$scope.loading = false;
				$scope.success = "Team saved, your team ID is: " + result.data;
				$scope.error = '';
			}, function () {
				$scope.loading = false;
				$scope.error = "Failed to save your team, try again later";
				$scope.success = '';
			});
		} else {
			$scope.error = "Please add at least one Pokemon to your team!";
			$scope.success = '';
		}
	};
	$scope.selectPokemon = function(id) {
		if($scope.team.length < 6) {
			$scope.loadSelected({pokemon_id: id}).then(function(newPokemon){
				$rootScope.$evalAsync($scope.team.push(newPokemon));
				$scope.loading = false;
			});
		}
		$scope.search = '';
	};
	$scope.loadSelected = function(team_member) {
		return new Promise(function(resolve, reject){
			$scope.loading = true;
			var apiString = 'http://pokeapi.co/api/v2/pokemon/' + team_member.pokemon_id;
			$scope.createPokemon(apiString, team_member).then(function(newPokemon) {
				resolve(newPokemon);
			});
		});
	};

	$scope.remove = function(index) {
		$scope.team.splice(index, 1);
	};

	$scope.addMove = function (index, move) {
		if($scope.team[index].moveset.length < 4) {
			var apiString = 'http://pokeapi.co/api/v2/move/' + move.id;
			$http.get(apiString).then(function(moveData) {
				$scope.team[index].moveset.push(new Move(move.id, moveData));
			});
		} else {
			$scope.error = 'A Pokemon can\'t know more than four moves!';
		}
	};

	$scope.createPokemon = function(apiString, team_member) {
		return new Promise(function(resolve, reject) {
			$http.get(apiString).then(function(pokemon) {
				newPokemon = {
					name: pokemon.data.name,
					id: team_member.pokemon_id,
					sprite: '/media/img/' + team_member.pokemon_id + '.png',
					types: pokemon.data.types,
					base_stats: {
						hp: pokemon.data.stats[5].base_stat,
						attack: pokemon.data.stats[4].base_stat,
						defense: pokemon.data.stats[3].base_stat,
						speed: pokemon.data.stats[0].base_stat,
						sp_atk: pokemon.data.stats[2].base_stat,
						sp_def: pokemon.data.stats[1].base_stat,
					},
					moveset: []
				};

				var total = 0;
				for(var i in newPokemon.base_stats) {
					total += newPokemon.base_stats[i];
				}
				newPokemon.base_stats.total = total;

				var moves = [];
				for (i in pokemon.data.moves) {
					moves.push(pokemon.data.moves[i].move);
				}
				newPokemon.moves = moves;

				var abilities = [];
				for (i in pokemon.data.abilities) {
					abilities.push(pokemon.data.abilities[i].ability);
				}
				newPokemon.abilities = abilities;

				resolve(newPokemon);
			});
		});
	};

	function Move(id, moveData) {
		this.id = id;
		this.name = moveData.data.name.replace(/-/g, ' ');
		this.type = moveData.data.type.name;
		this.pp = moveData.data.pp;
		this.accuracy = moveData.data.accuracy;
		this.power = moveData.data.power;
		this.damage_class = moveData.data.damage_class.name;
		this.effect = moveData.data.effect_entries[0].effect;
	}
	$scope.parseUrl = function (url) {
		return url.split('/')[6];
	};
});
