const HOST = "http://localhost:8080/api/";


function doFunction(oFormElement) {
   console.log("wrooong");

    var savetext = document.getElementById("q").value;



    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
                console.log("aaa");
            window.location.href = "question.html";

        }
    };
    xmlhttp.open("POST", HOST + "save");
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(JSON.stringify({q: savetext}));

    console.log(savetext);

    return false;

}

function doAsk(oFormElement) {

    var savetext = document.getElementById("q").value;



    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {

            JSON.parse(this.responseText).map(result => {
                showResults(result.AspectName);
            });
        }
    };
    xmlhttp.open("POST", HOST + "search");
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(JSON.stringify({q: savetext}));

    console.log(savetext);

    return false;

}


function showResults(text) {
    var para = document.createElement("h1");
    var node = document.createTextNode(text);
    para.appendChild(node);
    var element = document.getElementById("answers");
    element.appendChild(para);

}