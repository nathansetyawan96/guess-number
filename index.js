(() => {
    var canvasSize = 150;
    var clickX = [];
    var clickY = [];
    var clickDrag = [];
    var paint;

    var currentInput = 1;
    var inputCount = {
        1: 0,
        2: 0,
        3: 0
    };
    var minimumInput = 2;
    var userInput = [];
    var startPredict = false;

    var instruction = document.querySelector("#instruction");
    var userInputImg = document.querySelector("#user-input-img");
    var canvas = document.createElement('canvas');
    var context = canvas.getContext("2d");
    var clearBtn = document.querySelector("#clear");
    var doneBtn = document.querySelector("#done");

    canvas.setAttribute('id', 'canvas');
    canvas.setAttribute('width', canvasSize);
    canvas.setAttribute('height', canvasSize);
    canvas.className = "border-bottom shadow-sm bg-white";
    document.querySelector('#canvas-wrapper').appendChild(canvas);


    canvas.onmousedown  = function(e) {
        var mouseX = e.pageX - this.offsetLeft;
        var mouseY = e.pageY - this.offsetTop;

        paint = true;
        addClick(mouseX, mouseY);
        redraw();
    };

    canvas.onmousemove = function(e) {
        if (paint) {
            addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
            redraw();
        }
    };

    canvas.onmouseleave = function(e){
        paint = false;
    };

    canvas.onmouseup = function(e){
        paint = false;
    };

    const clearCanvas = () => {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    }

    const updateInstruction = () => {
        if (typeof inputCount[currentInput] === "undefined") {
            startPredict = true;
            instruction.innerText = `Draw one of the number that you drawn`;
            return;
        }

        const text = `Draw ${currentInput}`;
        instruction.innerText = instruction.innerText === text ? text + " again!" : text;
    }

    const resetAll = () => {
        clickX = [];
        clickY = [];
        clickDrag = [];
        paint = false;
    }

    const redraw = () => {
        clearCanvas();

        context.strokeStyle = "#000";
        context.lineJoin = "round";
        context.lineWidth = 20;
                  
        for(var i = 0; i < clickX.length; i++) {
            context.beginPath();

            if(clickDrag[i] && i) {
                context.moveTo(clickX[i-1], clickY[i-1]);
            } else {
                context.moveTo(clickX[i]-1, clickY[i]);
            }
            context.lineTo(clickX[i], clickY[i]);
            context.closePath();
            context.stroke();
        }
    }

    const addClick = (x, y, dragging) => {
        clickX.push(x);
        clickY.push(y);
        clickDrag.push(dragging);
    }

    clearBtn.onclick = () => {
        clearCanvas();
        resetAll();
    }

    doneBtn.onclick = () => {
        var x = new Array(canvasSize).fill(0);
        var y = new Array(canvasSize).fill(0);

        clickX.forEach(axis => {
            x[axis] = 1;
        });
        clickY.forEach(axis => {
            y[axis] = 1;
        });

        var input = x.concat(y);

        if (startPredict) {
            predict(input);
            return;
        }

        var output = {[currentInput]: 1};

        userInput.push({input, output})

        var card = `
            <div class="card mb-4 shadow-sm">
                <div class="card-body">
                    <img src="${canvas.toDataURL("image/png")}" class="num-${currentInput}">
                </div>
            </div>
        `
        userInputImg.innerHTML += card;

        inputCount[currentInput]++;
        
        if (inputCount[currentInput] >= minimumInput) {
            currentInput++;
        }

        clearCanvas();
        resetAll();
        updateInstruction();
    }

    const predict = (testData) => {
        const net = new brain.NeuralNetwork();
        net.train(userInput);
        
        const output = net.run(testData);

        instruction.innerHTML = "<h4>The probability</h4><pre>" + JSON.stringify(output, null, "  ") + "</pre>";

        Object.entries(output).forEach(([num, probability]) => {
            [...document.querySelectorAll(`.num-${num}`)].forEach(elem => {
                elem.style.zoom = Math.pow(1 + probability, 2);
            });
        });
    }

    updateInstruction();
})()