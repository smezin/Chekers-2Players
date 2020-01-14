const UP_RIGHT = -7, UP_LEFT = -9, DOWN_RIGHT = 9, DOWN_LEFT = 7;
const WHITE_PAWN=1,WHITE_QUEEN=2,BLACK_PAWN=-1,BLACK_QUEEN=-2;
const WHITE=10, BLACK=-10;


function playCheckers (){
    setGame();    
}

/////////////Initialize checkers game////////

function actionSelector (clickedLocationId) {    
 
    var selectedLocation = document.getElementById(clickedLocationId);
    var checkerLocation = document.getElementById(document.getElementById(clickedLocationId).onPath);    
    clearCheckerPropeties();

    if (selectedLocation.onPath){     
        var checkerColor = checkerLocation.occupant.checkerColor;      
        if (checkerLocation.occupant.moveCheckerReturnIfmoveContinues(clickedLocationId)){ 
            selectedLocation.occupant.iconImage.setAttribute("class", "picked_piece_settings");     
        } else { turnIsOverFor(checkerColor); } 
    }
    else if (selectedLocation.occupant) {
        if (selectedLocation.occupant.isEatingNow === true) {
            selectedLocation.occupant.isEatingNow = false;
            clearPaths();
            turnIsOverFor(selectedLocation.occupant.checkerColor);           
        } else {
        selectedLocation.occupant.iconImage.setAttribute("class", "picked_piece_settings");
        selectedLocation.occupant.showPaths();         
        }
    } else {
        clearPaths();
    }    
}
function setGame() {

    var Locations = [];
    for (let row = 0; row < 8; row++) {
        createRowOfSquares(row, Locations);
    }
    setBlackCheckersOnTop(Locations);
    setWhiteCheckersOnBottom(Locations);    
}
function setBlackCheckersOnTop(Locations) {

    for (let i = 1; i < 24; i += 2) {
        Locations[i].occupant = new Checker(i, BLACK_PAWN);
        if (i === 7) { i--; }
        if (i === 14) { i++; }
    }
}
function setWhiteCheckersOnBottom(Locations) {

    for (let i = 62; i > 39; i -= 2) {
        Locations[i].occupant = new Checker(i, WHITE_PAWN);
        if (i === 56) { i++; }
        if (i === 49) { i--; }
    }
}
function createRowOfSquares(row, Locations) {

    for (let i = 0; i < 8; i++) {
        if (i % 2 !== row % 2) {
            var locationDiv = createLocation((row * 8 + i), "peru");
            Locations[(row * 8 + i)] = locationDiv;
        } else {
            var locationDiv = createLocation((row * 8 + i), "beige");
            Locations[(row * 8 + i)] = locationDiv;
        }
        
        document.getElementById("checkers_board").appendChild(locationDiv);
    }
}
function createLocation(id, squareColor) {
    
    var locationDiv = document.createElement("div");
    locationDiv.setAttribute("class", "locationClass");
    locationDiv.style.background = squareColor;
    locationDiv.id = id; 
    locationDiv.occupant = null;
    locationDiv.onPath = false;
    locationDiv.onclick=function()    {actionSelector(id);    }  

    return locationDiv;
}

/////////////////////////////////////////////

function getImageByType (checkerType) {

    var  iconImage = document.createElement("img");
    switch (checkerType) {
        case WHITE_PAWN:
            iconImage.setAttribute("src","images/white_man.png"); 
            break;
        case WHITE_QUEEN:
            iconImage.setAttribute("src","images/white_queen.png"); 
            break;
        case BLACK_PAWN:
            iconImage.setAttribute("src", "images/black_man.png");      
            break;
        case BLACK_QUEEN:
            iconImage.setAttribute("src", "images/black_queen.png");      
            break;    
        default:
            break;    
        }
    iconImage.setAttribute("class", "piece_settings");
    return iconImage;
}
function Checker(locationId, checkerType) {

    this.checkerLocation = locationId;
    this.checkerType = checkerType;
    this.checkerColor = (checkerType===WHITE_PAWN || checkerType===WHITE_QUEEN)?WHITE:BLACK;
    var iconImage = getImageByType(checkerType);  
    this.iconImage = iconImage;  
    this.mustEat = false;
    this.isEatingNow = false;  
    document.getElementById(locationId).appendChild(iconImage);  
}
Checker.prototype.moveCheckerReturnIfmoveContinues = function (targetId) {

    var thisLocation = document.getElementById(this.checkerLocation);
    var targetLocation = document.getElementById(targetId);
    
    thisLocation.occupant = null;
    thisLocation.removeChild(thisLocation.firstChild);    
  
    targetLocation.occupant = this;
    this.checkerLocation = targetId; 
    targetLocation.appendChild(this.iconImage);
    
    if (this.checkerType === WHITE_PAWN && Math.floor(targetId/8) === 0) {this.coronation();}
    if (this.checkerType === BLACK_PAWN && Math.floor(targetId/8) === 7) {this.coronation();}
       
    if(tryRemoveKilledChecker(thisLocation.id, targetId)) {
        targetLocation.occupant.showQueenPaths(true);
        if (pathsAvialable()) {
            allowOnlyPaths(this.checkerLocation);
            this.isEatingNow = true;
            return true;
        }
    }
    clearPaths();
    return false;          
}
Checker.prototype.coronation = function() {

    var thisLocation = document.getElementById(this.checkerLocation);
    var checkerType;
    if (this.checkerType === WHITE_PAWN) {checkerType = WHITE_QUEEN;}
    if (this.checkerType === BLACK_PAWN) {checkerType = BLACK_QUEEN;}
    thisLocation.occupant = null;
    thisLocation.removeChild(thisLocation.firstChild);
    thisLocation.occupant=new Checker (this.checkerLocation, checkerType);
}
Checker.prototype.isDifferentColor = function (otherChecker) {    

    if ((this.checkerColor===WHITE) && (otherChecker.checkerColor===BLACK)) { return true; }    
    if ((this.checkerColor===BLACK) && (otherChecker.checkerColor===WHITE)) { return true; }

    return false;
}
Checker.prototype.showPaths = function (showOnlyKillPaths = false, markThePath = true) {

    if (this.checkerType === WHITE_PAWN || this.checkerType === BLACK_PAWN) {
        this.showPawnPaths(showOnlyKillPaths,markThePath);
    }
    if (this.checkerType === WHITE_QUEEN || this.checkerType === BLACK_QUEEN) {
        this.showQueenPaths(showOnlyKillPaths,markThePath);
    }
}
Checker.prototype.showPawnPaths = function (showOnlyKillPaths, markThePath) {
    clearPaths();
    var moveRight = (this.checkerType===WHITE_PAWN)?UP_RIGHT:DOWN_RIGHT;
    var moveLeft = (this.checkerType===WHITE_PAWN)?UP_LEFT:DOWN_LEFT;    
    if (!showOnlyKillPaths) { 
        this.showPathOnDirection(moveRight,1,markThePath);
        this.showPathOnDirection(moveLeft,1,markThePath);
    }          
    this.showKillPathsOnDirection(moveRight,1, markThePath);
    this.showKillPathsOnDirection(moveLeft,1, markThePath);        
}
Checker.prototype.showQueenPaths = function (showOnlyKillPaths) {
    clearPaths();
    var directions = [UP_RIGHT, UP_LEFT, DOWN_RIGHT, DOWN_LEFT];
    
    for (let i=0, steps=1; i<4; i++, steps=1) {
        if (!showOnlyKillPaths) {
            while (this.showPathOnDirection(directions[i],steps)) {steps++;}
        }
        this.showKillPathsOnDirection(directions[i],steps);
    }  
}
Checker.prototype.showPathOnDirection = function (direction, steps = 1, markThePath = true) {

    var baseLocationId = this.checkerLocation;
    if (isOutOfBoard(baseLocationId+direction*steps) || isWrapViolation(baseLocationId, direction, steps)) {
        return false;
    }        
    var targetLocaion = document.getElementById(baseLocationId+direction*steps);
    if(!(targetLocaion.occupant)) {
        if (markThePath) {markPath(targetLocaion,this.checkerLocation);}
        return true;
    } 
    return false;      
}
Checker.prototype.showKillPathsOnDirection = function (direction, steps = 1, markThePath = true) {

    var pathExists = false;
    var baseLocationId = this.checkerLocation + ((steps-1)*direction);

    if (isOutOfBoard(baseLocationId + 2*direction) || isWrapViolation(baseLocationId, direction) 
    || isWrapViolation(baseLocationId, direction, 2)){
        return false;
    }    
    var opponentLocation = document.getElementById(baseLocationId + direction);
    var targetLocation = document.getElementById(baseLocationId + direction*2); 
    var validOppenent;
    if (opponentLocation.occupant && this.isDifferentColor(opponentLocation.occupant)) {
        validOppenent = true;
    }
    if(validOppenent && targetLocation.occupant === null) {
            if (markThePath) {
                markPath(targetLocation,this.checkerLocation);
            } else {
                this.mustEat = true;
            }
            pathExists = true;
        }
    return pathExists; 
}
function tryRemoveKilledChecker(origin, target) {

    var stepRetrace = target-origin;
    
    if (stepRetrace<0) {
        if (stepRetrace % UP_RIGHT === 0) { 
            stepRetrace = UP_RIGHT;            
        } else {
            if (stepRetrace % UP_LEFT === 0) {
                stepRetrace = UP_LEFT;
            }
        }
    } else {
        if (stepRetrace % DOWN_RIGHT === 0 ) {
            stepRetrace = DOWN_RIGHT;
        } else {
            if (stepRetrace % DOWN_LEFT === 0) {
                stepRetrace = DOWN_LEFT;
            }
        }
    }    
    var killLocation = document.getElementById(target-stepRetrace);
    if (killLocation.occupant) {
        killLocation.occupant = null;       
        killLocation.removeChild(killLocation.firstChild); 
        return true;      
    }
    return false;
}
function clearCheckerPropeties (){
    
    for (let i=0; i < 64; i++) {
        var checker = document.getElementById(i).occupant;
        if (checker) {
            checker.iconImage.setAttribute("class", "piece_settings");
            checker.mustEat = false;
        }
    }
}
function isOutOfBoard (id) {
    return (id < 0 || id > 63);
}
function markPath (pathLocation,checkerLocation) {
    pathLocation.style.backgroundColor = "saddlebrown";
    pathLocation.onPath=checkerLocation;
}
function clearPaths () {    
    for (let i = 1; i < 64; i++)
    {
       if (document.getElementById(i).onPath) {
            document.getElementById(i).onPath = false;
            document.getElementById(i).style.backgroundColor = "peru";
        }
    }
}
function pathsAvialable () {
    for (let i=0; i < 64; i++)
    {
        if (document.getElementById(i).onPath) {
            return true;
        }
    }
    return false;
}
function turnIsOverFor (color) {

    for (let i=0; i < 64; i++)
    {
        var checker=document.getElementById(i).occupant;
        document.getElementById(i).style.pointerEvents = "auto";
        if (checker && (checker.checkerColor === color)) {
            document.getElementById(i).style.pointerEvents = "none";
        }
    }
    checkMustEat (-color);
}
function allowOnlyPaths (me) {

    for (let i=0; i < 64; i++)
    {
        document.getElementById(i).style.pointerEvents = "none";
        if (document.getElementById(i).onPath) {
            document.getElementById(i).style.pointerEvents = "auto";           
        }
    }
    document.getElementById(me).style.pointerEvents = "auto"; 
}
function isWrapViolation (locationId, direction, steps=1) {

    var targetRowId = (locationId+direction*steps)%8;    
    if (targetRowId !== (( direction === UP_RIGHT  || direction === DOWN_RIGHT )?0:7)){ 
        return false;       
    }
    return true;
    
}
function checkMustEat (color) {

    for (let i = 0; i < 64; i++) {
        var checker = document.getElementById(i).occupant;
        if (checker && checker.checkerColor === color) {
            checker.showPaths(false,false);
            if (checker.mustEat === true) {
                checker.iconImage.setAttribute("class", "must_eat");     
            }
        }
    }
}











function tempFunc1(){
    
   checkMustEat(WHITE);
}
function tempFunc() {
    
    var i = 1;
    var a, x;
    for (i = 0; i < 64; i++) {

        x = document.getElementById(i);
        if (document.getElementById(i).occupant)
        {           
            document.getElementById(i).occupant.showPaths(false,false);
            x.innerHTML = document.getElementById(i).occupant.mustEat;
        }
        else{
            a=0;
        }
    }
}