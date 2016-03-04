app = angular.module('pokeTeam')
  .controller('pokemonController', pokemonController);

function pokemonController($scope, PokemonService, TeamService, MoveService) {
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
	$scope.loading = true;

	PokemonService.getPokedex().then(function(data) {
		$scope.pokedex = data;
		$scope.loading = false;
    $scope.$apply();
	});

	$scope.loadTeam = function() {
		$scope.loading = true;
		$scope.success = "Loading team ID " + $scope.load + ", please wait...";
		TeamService.loadTeam($scope.load).then(function(team) {
			$scope.team = team;
			$scope.loading = false;
			$scope.error = '';
			$scope.success = "Team ID " + $scope.load + " loaded";
      $scope.$apply();
		}).catch(function(error){
			$scope.error = "Error loading team: " + error;
			$scope.success = '';
			$scope.loading = false;
      $scope.$apply();
		});
	};

	$scope.saveTeam = function () {
		if ($scope.team.length > 0) {
			$scope.loading = true;
			TeamService.saveTeam($scope.team).then(function(result){
				$scope.loading = false;
				$scope.success = "Team saved, your team ID is: " + result.data;
				$scope.error = '';
        $scope.$apply();
			}).catch(function(){
				$scope.loading = false;
				$scope.error = "Failed to save your team, try again later";
				$scope.success = '';
        $scope.$apply();
			});
		} else {
			$scope.error = "Please add at least one Pokemon to your team!";
			$scope.success = '';
		}
	};

	$scope.selectPokemon = function(id) {
		if($scope.team.length < 6) {
			PokemonService.loadSelected(id).then(function(newPokemon){
				$scope.team.push(newPokemon);
				$scope.loading = false;
        $scope.$apply();
			});
		} else {
      $scope.error = "Your team can't have more than 6 Pokemon!";
    }
		$scope.search = '';
	};

	$scope.remove = function(index) {
		$scope.team.splice(index, 1);
	};

	$scope.addMove = function(index, move) {
		if($scope.team[index].moveset.length < 4) {
      $scope.loading = true;
      MoveService.addMove(move).then(function(newMove){
        $scope.team[index].moveset.push(newMove);
        $scope.loading = false;
        $scope.$apply();
      });
		} else {
			$scope.error = "A Pokemon can't know more than four moves!";
		}
	};

  $scope.parseUrl = function(url) {
    return url.split('/')[6];
  };
}
