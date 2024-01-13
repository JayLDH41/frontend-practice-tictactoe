//View
//strict mode
//for app.js
export default class View {
  $ = {};
  $$ = {};
  constructor() {
    this.$.menu = this.#qs("[data-id='menu']"); //uses [] to identify an attribute
    this.$.menuBtn = this.#qs("[data-id='menu-btn']");
    this.$.menuItems = this.#qs("[data-id='menu-items']");
    this.$.resetBtn = this.#qs("[data-id='reset-btn']");
    this.$.newRoundBtn = this.#qs("[data-id='new-round-btn']");
    this.$.modal = this.#qs("[data-id='modal']");
    this.$.modalText = this.#qs("[data-id='modal-text']");
    this.$.modalBtn = this.#qs("[data-id='modal-btn']");
    this.$.turn = this.#qs("[data-id='turn']");
    this.$.p1Wins = this.#qs("[data-id='p1-wins']");
    this.$.p2Wins = this.#qs("[data-id='p2-wins']");
    this.$.ties = this.#qs("[data-id='ties']");

    this.$$.squares = this.#qsAll("[data-id='square']"); //multiple elements grouped in a list

    //UI only event listeners (100% responsibility of view class)
    this.$.menuBtn.addEventListener("click", (e) => {
      this.#toggleMenu();
    });
  }

  /**
   * Register all event handlers
   */

  bindGameResetEvent(handler) {
    this.$.resetBtn.addEventListener("click", handler);
    this.$.modalBtn.addEventListener("click", handler);
  }

  bindNewRoundEvent(handler) {
    this.$.newRoundBtn.addEventListener("click", handler);
  }

  bindPlayerMoveEvent(handler) {
    this.$$.squares.forEach((square) => {
      square.addEventListener("click", () => handler(square));
    });
  }

  //method for rendering the page for every event
  //game and stats getter from store class
  render(game, stats) {
    const { playerWithStats, ties } = stats;
    const {
      moves,
      curPlayer,
      status: { isComplete, winner },
    } = game;

    this.#closeAll();
    this.#clearMoves();

    this.#updateScoreboard(
      playerWithStats[0].wins,
      playerWithStats[1].wins,
      ties
    );
    this.#initializeMoves(moves);

    if (isComplete) {
      this.#openModal(
        winner ? `${game.status.winner.name} wins!` : "Tie game!"
      );
      return;
    }

    this.#setTurnIndicator(curPlayer);
  }

  /**
   * DOM helper methods (helper methods to help change UI)
   */
  //# makes the function becomes private -- to prevent it be called outside the class (enforce consistency of responsibility)

  //updates the scoreboard
  #updateScoreboard(p1Wins, p2Wins, ties) {
    this.$.p1Wins.innerText = `${p1Wins} wins`;
    this.$.p2Wins.innerText = `${p2Wins} wins`;
    this.$.ties.innerText = `${ties}`;
  }

  //opens modal
  #openModal(message) {
    this.$.modal.classList.remove("hidden");
    this.$.modalText.innerText = message;
  }

  //closes modal, private: only called in this class
  #closeModal() {
    this.$.modal.classList.add("hidden");
  }

  //hides menu and resets chevron
  #closeMenu() {
    this.$.menuItems.classList.add("hidden");
    this.$.menuItems.classList.remove("border");

    const icon = this.$.menuBtn.querySelector("i");
    icon.classList.add("fa-chevron-down");
    icon.classList.remove("fa-chevron-up");
  }

  //closes both modal and menu when resetting
  #closeAll() {
    this.#closeModal();
    this.#closeMenu();
  }

  //clear gameboard
  #clearMoves() {
    this.$$.squares.forEach((square) => {
      square.replaceChildren();
    });
  }

  //initialize selected squares if tab is refreshed while game is ongoing
  #initializeMoves(moves) {
    this.$$.squares.forEach((square) => {
      const existingMove = moves.find((move) => move.squareId === +square.id);
      if (existingMove) {
        this.#handlePlayerMove(square, existingMove.player);
      }
    });
  }

  //toggle action menu
  #toggleMenu() {
    this.$.menuItems.classList.toggle("hidden");
    this.$.menuBtn.classList.toggle("border");

    const icon = this.$.menuBtn.querySelector("i");
    icon.classList.toggle("fa-chevron-down");
    icon.classList.toggle("fa-chevron-up");
  }

  //creates an icon for the squared clicked by current player
  #handlePlayerMove(squareEl, player) {
    const icon = document.createElement("i");
    icon.classList.add("fa-solid", player.iconClass, player.colorClass);
    squareEl.replaceChildren(icon);
  }

  //updates the turn division that shows next player on the move
  #setTurnIndicator(player) {
    const icon = document.createElement("i");
    const label = document.createElement("p");

    icon.classList.add("fa-solid", player.iconClass, player.colorClass);

    label.classList.add(player.colorClass);
    label.innerText = `${player.name}, you are up!`;

    this.$.turn.replaceChildren(icon, label);
  }

  #qs(selector, parent) {
    const el = parent
      ? parent.querySelector(selector)
      : document.querySelector(selector);
    if (!el) throw new Error("Could not find element");
    return el;
  }

  #qsAll(selector) {
    const elList = document.querySelectorAll(selector);
    if (!elList) throw new Error("Could not find element");
    return elList;
  }
}
