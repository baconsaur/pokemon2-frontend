app = angular.module('pokeTeam', []);

app.controller('pokemon', function($scope, $http) {
	$scope.loading = true;
	$http.get('http://pokeapi.co/api/v1/pokedex/1').then(function(pokedex) {
		$scope.pokedex = pokedex.data.pokemon;
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
				$scope.success = "Team ID " + $scope.load + " loaded";
				$scope.error = '';
			}
			$scope.loading = false;
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
			$scope.loadSelected(pokemon.resource_uri.split('/')[3]);
		}
		$scope.search = '';
	};
	$scope.loadSelected = function(id) {
		$scope.loading = true;
		var apiString = 'http://pokeapi.co/api/v1/pokemon/' + id;
		$http.get(apiString).then(function(pokemon) {
			newPokemon = {
				name: pokemon.data.name,
				id: pokemon.data.national_id,
				sprite: '/media/img/' + pokemon.data.national_id + '.png',
				types: pokemon.data.types,
				base_stats: {
					hp: pokemon.data.hp,
					attack: pokemon.data.attack,
					defense: pokemon.data.defense,
					speed: pokemon.data.speed,
					sp_atk: pokemon.data.sp_atk,
					sp_def: pokemon.data.sp_def
				},
				moves: pokemon.data.moves,
				abilities: pokemon.data.abilities,
				evolutions: pokemon.data.evolutions
			};
			var total = 0;
			for(var i in newPokemon.base_stats) {
				total += newPokemon.base_stats[i];
			}
			newPokemon.base_stats.total = total;
			$scope.loading = false;
			$scope.team.push(newPokemon);
		});
	};
	$scope.remove = function(index) {
		$scope.team.splice(index, 1);
	};
});

