app = angular.module('pokeTeam', []);

app.controller('pokemon', function($scope, $http) {
	$http.get('http://pokeapi.co/api/v1/pokedex/1').then(function(pokedex) {
		$scope.pokedex = pokedex.data.pokemon;
	});
	$scope.team = [];
	$scope.loadTeam = function() {
		apiString = 'http://desolate-cove-17354.herokuapp.com/teams/' + $scope.load;
		$http.get(apiString).then(function(team) {
			for (var i in team.data) {
				$scope.loadSelected(team.data[i]);
			}
		}, function() {
			$scope.error = "Invalid team ID";
		});	
	};
	$scope.selectPokemon = function(pokemon) {
		if($scope.team.length < 6) {
			$scope.loadSelected(pokemon.resource_uri.split('/')[3]);
		}
		$scope.search = '';
	};
	$scope.loadSelected = function(id) {
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
			$scope.team.push(newPokemon);
		});
	};
	$scope.remove = function(index) {
		$scope.team.splice(index, 1);
	};
});

