app = angular.module('pokeTeam', ['ngAnimate']);

app.controller('pokemon', function($scope, $http) {
	$scope.loading = true;
	$http.get('http://beta.pokeapi.co/api/v2/pokedex/1').then(function(pokedex) {
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
		apiString = 'http://desolate-cove-17354.herokuapp.com/teams/' + $scope.load;
		$http.get(apiString).then(function(team) {
			for (var i in team.data) {
				$scope.team = [];
				$scope.loadSelected(team.data[i]);
				$scope.error = '';
			}
			$scope.loading = false;
			$scope.success = "Team ID " + $scope.load + " loaded";
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
				saveFile.push($scope.team[i].id);
			}
			$http.post('http://desolate-cove-17354.herokuapp.com/teams/save', saveFile).then(function(result) {
				$scope.loading = false;
				$scope.success = "Team saved, your team ID is:" + result.data;
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
	$scope.selectPokemon = function(pokemon) {
		if($scope.team.length < 6) {
			$scope.loadSelected(pokemon);
		}
		$scope.search = '';
		$scope.loading = false;
	};
	$scope.loadSelected = function(id) {
		$scope.loading = true;
		var apiString = 'http://beta.pokeapi.co/api/v2/pokemon/' + id;
		$http.get(apiString).then(function(pokemon) {
			newPokemon = {
				name: pokemon.data.name,
				id: id,
				sprite: '/media/img/' + id + '.png',
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
			$scope.team.push(newPokemon);
		});
	};
	$scope.remove = function(index) {
		$scope.team.splice(index, 1);
	};
	$scope.addMove = function (index, move) {
		if($scope.team[index].moveset.length < 4) {
			var apiString = 'http://beta.pokeapi.co/api/v2/move/' + move.id;
			$http.get(apiString).then(function(moveData) {
				$scope.team[index].moveset.push({
					id: move.id,
					name: moveData.data.name.replace(/-/g, ' '),
					type: moveData.data.type.name,
					pp: moveData.data.pp,
					accuracy: moveData.data.accuracy,
					power: moveData.data.power,
					damage_class: moveData.data.damage_class.name,
					effect: moveData.data.effect_entries[0].effect
				});
			});
		} else {
			$scope.error = 'A Pokemon can\'t know more than four moves!';
		}
	};
	$scope.parseUrl = function (url) {
		return url.split('/')[6];
	};
});
