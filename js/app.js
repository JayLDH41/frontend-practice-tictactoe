//Controller
import View from "./view.js"; //import View
import Store from "./store.js"; //import Store

const players = [
  {
    id: 1,
    name: "Player 1",
    iconClass: "fa-x",
    colorClass: "yellow",
  },

  {
    id: 2,
    name: "Player 2",
    iconClass: "fa-o",
    colorClass: "turquoise",
  },
];

function init() {
  const view = new View();
  const store = new Store("live-t3,storage-key", players);

  //updates page based on current tab state changes
  store.addEventListener("statechange", () => {
    view.render(store.game, store.stats);
  });

  //updates page based on different tab state changes
  window.addEventListener("storage", () => {
    view.render(store.game, store.stats);
  });

  view.render(store.game, store.stats); //updates page when document is first load

  //resets current round without clearing all game data
  view.bindGameResetEvent((e) => {
    store.reset();
  });

  //clears all wins and start a whole new game
  view.bindNewRoundEvent((e) => {
    store.newRound();
  });

  view.bindPlayerMoveEvent((square) => {
    //check square has been moved or not
    const existingMove = store.game.moves.find(
      (move) => move.squareId === +square.id
    );

    if (existingMove) {
      return;
    }

    // view.handlePlayerMove(square, store.game.curPlayer); //current player move event

    store.playerMove(+square.id); //updates game state here -- pass id as integer value
  });
}

window.addEventListener(
  "load",
  init() //runs init() after page loads
);
