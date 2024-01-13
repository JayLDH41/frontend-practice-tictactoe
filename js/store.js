//Model

const initialValue = {
  curGameMoves: [],
  history: {
    curRoundGames: [],
    allGames: [],
  },
};

export default class Store extends EventTarget {
  //key required for local storage
  constructor(key, players) {
    super();
    this.storageKey = key;
    this.players = players;
  }

  //get total number of wins of both players & tied games
  get stats() {
    const state = this.#getState();
    return {
      //an array containing both player's information and total wins
      playerWithStats: this.players.map((player) => {
        //get total rounds won by this player
        const wins = state.history.curRoundGames.filter(
          (game) => game.status.winner?.id === player.id
        ).length;

        return {
          ...player, //spread the elements of player object (color, icon, ...)
          wins,
        };
      }),

      ties: state.history.curRoundGames.filter(
        (game) => game.status.winner === null
      ).length,
    };
  }

  //get read-only value from the class
  get game() {
    const state = this.#getState();

    const curPlayer = this.players[state.curGameMoves.length % 2]; //either 0 and 1 -- used to get the next player

    const winningPatterns = [
      [1, 2, 3],
      [1, 5, 9],
      [1, 4, 7],
      [2, 5, 8],
      [3, 5, 7],
      [3, 6, 9],
      [4, 5, 6],
      [7, 8, 9],
    ];

    let winner = null;

    //get all moves from player 1 & 2
    for (const player of this.players) {
      const selectedSqaureIds = state.curGameMoves
        .filter((move) => move.player.id === player.id)
        .map((move) => move.squareId);

      //compare player moves to each winning pattern -- 100% matches = win
      for (const pattern of winningPatterns) {
        if (pattern.every((v) => selectedSqaureIds.includes(v))) {
          winner = player;
        }
      }
    }

    return {
      moves: state.curGameMoves,
      curPlayer,
      status: {
        isComplete: winner != null || state.curGameMoves.length === 9,
        winner,
      },
    };
  }

  //updates game state
  //uses clone to not directly modify the private state value
  playerMove(squareId) {
    const stateClone = structuredClone(this.#getState());
    stateClone.curGameMoves.push({
      squareId,
      player: this.game.curPlayer,
    });
    this.#saveState(stateClone);
  }

  //does not clear the scoreboard
  reset() {
    const stateClone = structuredClone(this.#getState());
    const { status, moves } = this.game;

    //save completed game only
    if (this.game.status.isComplete) {
      stateClone.history.curRoundGames.push({ moves, status });
    }

    stateClone.curGameMoves = [];
    this.#saveState(stateClone);
  }

  //clears the scoreboard and current round data
  newRound() {
    this.reset();

    const stateClone = structuredClone(this.#getState());
    stateClone.history.allGames.push(...stateClone.history.curRoundGames);
    stateClone.history.curRoundGames = [];

    this.#saveState(stateClone);
  }

  //gets latest state from local storage
  #getState() {
    const item = window.localStorage.getItem(this.storageKey);
    return item ? JSON.parse(item) : initialValue;
  }

  //saves state into local storage
  #saveState(stateOrFunc) {
    const preState = this.#getState();
    let newState;
    switch (typeof stateOrFunc) {
      case "function":
        newState = stateOrFunc(preState);
        break;
      case "object":
        newState = stateOrFunc;
        break;
      default:
        throw new Error("Invalid argument passed");
    }

    window.localStorage.setItem(this.storageKey, JSON.stringify(newState));
    this.dispatchEvent(new Event("statechange"));
  }
}
