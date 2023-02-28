"use strict";
(function() {
    const MAXIMUM_PLAYERS_IN_TABLE = 3;
    document.addEventListener('DOMContentLoaded', function () {
        //modules
        const menuController = getMenuController();
        const boardController = getBoardController();

        const nameField = document.getElementById("user-name");
        const game = document.getElementById("game");
        const playBtn = document.getElementById("playBtn");
        const back = document.getElementById("back-btn");
        const gameOver = document.getElementById("game-over");
        const ok = document.getElementById("ok-btn");
        const table = document.getElementById("table");
        const highScores = document.getElementById("high-scores");
        const modalBody = document.getElementById("modal-body");

        game.classList.toggle('d-none');
        gameOver.classList.toggle('d-none');

        /**
         * When play button is clicked, the menu is removed
         * and the board game is set by the sizes the player picked
         */
        playBtn.addEventListener("click", function () {

            if (!menuController.isDataValid()) return;

            menuController.displayOrHideTheMenu();
            boardController.init(menuController.getRow(), menuController.getCol(), nameField.value);
        });

        /**
         * Inserts the scores table to the modal
         */
        highScores.addEventListener('click', () =>
            modalBody.innerHTML = `\<table class="table"> ${table.innerHTML} \</table>`)

        /**
         * Showes the menu when clicking 'ok' after game ends
         */
        ok.addEventListener("click", () => {
            menuController.displayOrHideTheMenu();
            gameOver.classList.toggle('d-none');
        })
        /**
         * Shows the menu when clicking 'back' after game started
         */
        back.addEventListener("click", () => {
            game.classList.toggle('d-none');
            menuController.displayOrHideTheMenu();
        })

    })

    /**
     * The func adds the player's object details to the table.
     *
     * @param {*} table -The table will hold the best players scores (top 3)
     * @param {*} objectPlayerForTable - The players object contains his name, score and rank
     */
    function sortAndCreateTable(table, objectPlayerForTable) {

        table.innerHTML = `\<th> Rank  </th> \<th> Player \</th> \<th> Score \</th>`;
        for (let player of objectPlayerForTable) {
            let str = "";
            str += `\<tr>`;
            for (let key in player)
                str += (`\<th\> ${player[key]} \</th>`)
            str += `\</tr>`;
            table.innerHTML += str;
        }
    }

    /**
     * The func sends a message to the player if he is in the Top Scores table
     * @param {*} name -The players name
     * @param {*} objectPlayerForTable - The players object contains his name, score and rank.
     * @param {*} rankMassage - A message that tells the player if he appears in the Top Scores table.
     * @returns - If the player is in top 3.
     */
    function setMessageForPlayer(name, objectPlayerForTable, rankMassage) {

        for (let player of objectPlayerForTable)
            if (player.name === name) {
                rankMassage.innerText = `You are ranked ${player.rank} out of 3`;
                return;
            }
        rankMassage.innerText = `Play again !! You are not in top three`;
    }

    /**
     * The func adds the players score to the score table and sorts the scores
     * from high to low. If the player had played previously, the higher score will be saved.
     * @param {*} name -The players name
     * @param {*} score - The players score from his last game
     * @param {*} objectPlayerForTable - The players object contains his name, score and rank.
     * @returns
     */
    function insertPlayerObjects(name, score, objectPlayerForTable) {

        for (let object of objectPlayerForTable) {
            if (name.toUpperCase() === object.name.toUpperCase()) {
                if (Number(object.score) < Number(score)) {
                    object.score = score
                    sortTable(objectPlayerForTable)
                }
                return;
            }
        }
        objectPlayerForTable.push(createPlayerObject(name, score));
        sortTable(objectPlayerForTable)
        if (objectPlayerForTable.length > MAXIMUM_PLAYERS_IN_TABLE)
            objectPlayerForTable.length = MAXIMUM_PLAYERS_IN_TABLE;
    }

    /**
     * The func sorts the score table from high to low and updates each player's rank
     * @param {*} objectPlayerForTable - The players object contains his name, score and rank.
     */
    function sortTable(objectPlayerForTable) {

        objectPlayerForTable.sort((a, b) => {
            return Number(a.score) < Number(b.score) ? 1 : -1
        });
        for (let i = 0; i < objectPlayerForTable.length; i++)
            objectPlayerForTable[i].rank = i + 1;
    }

    /**
     * This func creates an object for each player and holds his name,rank and last score.
     * @param {*} name -The player's name
     * @param {*} score -The players score
     * @returns -The players object
     */
    function createPlayerObject(name, score) {

        let object = {
            rank: 0,
            name: name,
            score: score
        };
        return object;
    }

    /**
     *The module manages the board
     */
    function getBoardController() {

        const gameOver = document.getElementById("game-over");
        const cardPlayed = document.getElementById("cardPlayed");
        const cards = document.getElementsByClassName("cardd");
        const delayInSeconds = document.getElementById("DelayInSeconds");
        const score = document.getElementById("score");
        const rankMassage = document.getElementById("rank-massage");
        const steps = document.getElementById("number-of-steps");
        const board = document.getElementById("board");
        const game = document.getElementById("game");

        let objectPlayerForTable = [],
            openCards = 0,
            row, col, userName,
            lastPictures = [],
            cardsPack = [];

        /**
         * The func updates the data of the first card that the player selected
         * @param {*} event
         */
        function firstCardPicked(event) {

            event.target.src = `images/${cardsPack[event.target.id]}.jpg`;
            lastPictures.push(event.target.src)
            steps.innerHTML = eval(`${steps.innerText} + 1`);

        }

        function init(numsOfRow, numsOfCol, userN) {

            resetGame();
            userName = userN;
            row = numsOfRow;
            col = numsOfCol;
            const numberOfCard = row * col;
            let currentCard = Array.from(Array(numberOfCard / 2).keys());
            cardsPack = shuffle([...currentCard, ...currentCard]);
            createBoard()
            game.classList.toggle('d-none');
        }

        /**
         * The function creates the playing board with the cards
         * and for each card saves the type of card via id
         */
        function createBoard() {

            let idOfPhoto = 0;

            for (let i = 0; i < row; i++) {
                board.innerHTML += `<div class="row">`
                for (let j = 0; j < col; j++, idOfPhoto++)
                    board.innerHTML += `<button class="cardd col-2" type="button">
            <img class="img-thumbnail" src="images/card.jpg" id="${idOfPhoto}"/></button>`
                board.innerHTML += `</div>`
            }
        }

        /**
         * The func flips all the cards back to '?' apart from the pairs that were found
         * @param {*} cards - The cards of the game
         * @param {*} lastPictures
         */
        function flipCard() {

            for (let element of cards)
                if (element.disabled === false)
                    element.firstElementChild.src = "images/card.jpg"

            lastPictures = []
        }

        /**
         * The func calculates the game score and returns it
         */
        function calculateScore() {
            return Math.floor(eval(`900 / delayInSeconds.value * ((cards.length * cards.length) / steps.innerText) * 10`))
        }

        /**
         * Compares between 2 cards that the player choose. If they match they will remain open,
         * otherwise they will turn back.
         * When all cards are open, the score screen will appear.
         */
        board.addEventListener("click", function (event) {

            let photoPath = event.target.src;

            if (lastPictures.length < 2 && photoPath !== undefined && photoPath.includes("card"))
                firstCardPicked(event);

            if (lastPictures.length === 2 && lastPictures[0] === lastPictures[1]) {
                for (let element of cards)
                    if (element.firstElementChild.src === lastPictures[0])
                        element.disabled = true;

                openCards += 2;
                lastPictures = [];
            }

            if (lastPictures.length === 2) {//checks if two cards already are selected
                lastPictures.push("")
                setTimeout(flipCard, 1000 * delayInSeconds.value, cards, lastPictures);
            }

            if (openCards === row * col) {
                score.innerText = calculateScore();
                insertPlayerObjects(userName, score.innerText, objectPlayerForTable)
                sortAndCreateTable(table, objectPlayerForTable);
                setMessageForPlayer(userName, objectPlayerForTable, rankMassage)
                game.classList.toggle('d-none');
                gameOver.classList.toggle('d-none');
                cardPlayed.innerText = steps.innerText;
            }
        })

        function resetGame() {

            lastPictures = []
            board.innerHTML = ""
            cardsPack = []
            steps.innerHTML = "0"
            openCards = 0

        }

        /**
         * The func shuffles the card so that pairs won't be next to each other
         * @param {*} newCardPack -The cards that will be used in the game
         * @returns - The shuffled pack
         */
        function shuffle(newCardPack) {

            for (let x of newCardPack) {
                const randomNum1 = Math.floor(Math.random() * 100) % newCardPack.length;
                const randomNum2 = Math.floor(Math.random() * 100) % newCardPack.length;
                let temp = newCardPack[randomNum1]
                newCardPack[randomNum1] = newCardPack[randomNum2]
                newCardPack[randomNum2] = temp
            }
            return newCardPack;
        }

        return {
            init
        }
    }

    function getMenuController() {

        const nameField = document.getElementById("user-name");
        const errorMessages = document.getElementById("error-messages");
        const menu = document.getElementsByClassName("menu");
        const rowOption = document.getElementById("NumberOfRow");
        const colOption = document.getElementById("NumberOfCols");

        /**
         * The function hides/shows all the menu elements when game starts/ends,
         * and resets name errors for the next round
         * @param {*} nameError -Invalid name error string
         * @param {*} menu -Menu elements
         */
        function displayOrHideTheMenu() {
            debugger
            errorMessages.innerHTML = ""
            for (let element of menu)
                element.classList.toggle('d-none');

        }

        /**
         * This func is the player's validations
         * */
        function isDataValid() {

            let answer = true,
                counter = 1;
            errorMessages.innerHTML = ""

            if (parseInt(rowOption.value) * parseInt(colOption.value) % 2 != 0) {
                errorMessages.innerHTML = `${counter}). Number of card(Rows X Columns) must be even, please correct your choice<br>`;
                answer = false;
                counter++;
            }
            let name = nameField.value.trim();
            if (name.length < 1 || !/^[A-Za-z0-9]*$/.test(name) || name.length > 10) {
                errorMessages.innerHTML += `${counter}).The name isn't valid, Please choose another name`;
                answer = false;
            }
            return answer;
        }

        return {
            isDataValid,
            displayOrHideTheMenu,
            getRow: () => {
                return parseInt(rowOption.value)
            },
            getCol: () => {
                return parseInt(colOption.value)
            }
        }
    }
})();
