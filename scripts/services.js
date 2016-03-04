app = angular.module('pokeTeam')
  .factory('PokemonService', PokemonService)
  .factory('MoveService', MoveService)
  .factory('TeamService', TeamService);

function PokemonService($http) {
  var pokedex = new Promise(function(resolve, reject) {
    $http.get('http://pokeapi.co/api/v2/pokedex/1').then(function(pokedex) {
  		resolve(pokedex.data.pokemon_entries);
  	});
  });

  function createPokemon (apiString, id) {
    return new Promise(function(resolve, reject) {
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

        resolve(newPokemon);
      });
    });
  }

  return {
    getPokedex: function () {
      return pokedex;
    },
    loadSelected: function (id) {
      return new Promise(function(resolve, reject){
        var apiString = 'http://pokeapi.co/api/v2/pokemon/' + id;
        createPokemon(apiString, id).then(function(newPokemon) {
          resolve(newPokemon);
        });
      });
    }
  };
}


function TeamService($http, PokemonService, MoveService) {
  function formatSaveFile(team) {
    var saveFile = [];
    for (var i in team) {
      saveFile.push({
        id: team[i].id,
        moves: team[i].moveset.map(function(move){
          return move.id;
        })
      });
    }
    return saveFile;
  }

  function getMoves(moveArray) {
    return new Promise(function(resolve, reject) {
      // for (var i in loadedTeam) {
      //   for (var j in team.data[i].moves) {
      //     loadedTeam[i].moveset.push();
      //   }
      // }
      var moveset = moveArray.map(function(move) {
        return MoveService.addMove({id: move});
      });
      Promise.all(moveset).then(function(loadedMoves) {
        resolve(loadedMoves);
      });
    });
  }

  function getTeam(team){
    return new Promise(function(resolve, reject) {
      var newTeam = team.data.map(function(team_member){
        return new Promise(function(resolve, reject){
          PokemonService.loadSelected(team_member.pokemon_id).then(function(pokemon) {
            getMoves(team_member.moves).then(function(moves) {
              pokemon.moveset = moves;
              resolve(pokemon);
            });
          });
        });
      });
    Promise.all(newTeam).then(function(loadedTeam){
        resolve(loadedTeam);
      });
    });
  }

  return {
    saveTeam: function(team) {
      return new Promise(function (resolve, reject) {
        var saveFile = formatSaveFile(team);
  			$http.post('http://pokemon-team-api.herokuapp.com/teams/', saveFile).then(function(result) {
  				resolve(result);
  			}, function (error) {
  				reject(error);
  			});
      });
    },
    loadTeam: function (id) {
      return new Promise(function(resolve, reject) {
        var apiString = 'http://pokemon-team-api.herokuapp.com/teams/' + id;
        $http.get(apiString).then(function(team) {
          getTeam(team).then(function(newTeam){
            resolve(newTeam);
          });
        });
      });
    }
  };
}

function MoveService($http) {
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
  return {
    addMove: function (move) {
      return new Promise(function(resolve, reject) {
        var apiString = 'http://pokeapi.co/api/v2/move/' + move.id;
        $http.get(apiString).then(function(moveData) {
          var newMove = new Move(move.id, moveData);
          resolve(newMove);
        });
      });
    }
  };
}
