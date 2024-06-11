// To do
// fix the calcValueHumanPlan
// see if there is a U curve when stability parameter is very high
// simulate discounting based on expect num of new objects
// Full working version of the AI Planner with stabliity threshold and notion of alpha

// MS7
function calcValueHumanPlan( bestSol , allSol, player , angleThreshold, ctx, objects ) {

    // Check
    //if (player.moving) {
    //   console.log( 'check');
    //} 
    
    // Initialize value of plan to zero
    let valueHumanPlan = 0;

    // If player is not moving, we cannot calculate the value of the plan
    if (!player.moving) {
        return [ valueHumanPlan, [] ];
    }

    // Number of objects that can potentially be intercepted
    let numObjects = allSol.ID.length;

    // Initialize values of all objects 
    let values = new Array(numObjects).fill(0);
    for (let i=0; i<numObjects; i++) values[i] = (allSol.maxValue[i] + 0.001) /  (bestSol.maxValue + 0.001 );

    // Calculate which angle bracket the player falls in
    let maxV = 0;
    let maxI = 0;
    for (let i=0; i<numObjects; i++) {
        // Optimal interception vector
        let interceptVector = allSol.interceptLocations[i][0];
        let ID = allSol.ID[i];

        // When the object can be intercepted, calculate the angle 
        if (interceptVector != null) {
            let dx1 = ( interceptVector[0] - player.x );
            let dy1 = ( interceptVector[1] - player.y );

            // Player movement vector
            let dx2 = ( player.targetX - player.x );
            let dy2 = ( player.targetY - player.y );
            
            // Calculate the dot product of the two vectors
            const dotProduct = dx1 * dx2 + dy1 * dy2;

            // Calculate the magnitude of the first vector
            const magnitude1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

            // Calculate the magnitude of the second vector
            const magnitude2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

            // Calculate the cosine of the angle between the two vectors
            const cosTheta = dotProduct / (magnitude1 * magnitude2);

            // Calculate the angle in radians
            const angleRadians = Math.acos(cosTheta);

            // Convert the angle to degrees (optional)
            const angleDegrees = angleRadians * (180 / Math.PI);

            //console.log( "Angle to interception vector for object " + allSol.ID[i] + " = " + angleDegrees );
            
            if (angleDegrees < angleThreshold) { 
                if (values[i] > maxV) {
                    maxV = values[ i ];
                    maxI = i;
                }
            }

            // For debugging purposes
            /*
            let showVisualization = true;
            if ((showVisualization) && (ID != -1)) {
                // Show a cross on where to click next 
                ctx.save();
                ctx.fillStyle = 'blue'; // Color of the text
                ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)'; // Adjust the last number for transparency
                ctx.lineWidth = 5;
                ctx.beginPath();
                // Show line from player to click
                ctx.moveTo(player.x, player.y );
                ctx.lineTo(player.targetX, player.targetY );
                ctx.stroke(); // This makes the line visible
                // Show line from object to optimal interception point
                let idx = findIndexByValue(ID , objects, 'ID' );
                ctx.moveTo(objects[idx].x, objects[idx].y );
                ctx.lineTo(interceptVector[0], interceptVector[1] );
                ctx.stroke(); // This makes the line visible
                // Show the cone... 

                ctx.restore(); // Restore the context state if you've made temporary changes
                requestAnimationFrame();
            }
            */
            
        }
    }
    
    //console.log( 'Inferred interception object: ' + allSol.ID[ maxI ] + ' with estimated value = ' + maxV );
    valueHumanPlan = maxV;

    return [ valueHumanPlan, values ];
    
}

// MS8
function runAIPlanner( objects, player , observableRadius , center, whAgent, stabilityThreshold, prevBestSol, prevAllSol, frame, alpha ) {
    // Function to run the AI planner

    // First, find all objects that have not been intercepted yet
    let ObjectsNI;
    if ((whAgent == 'human') || whAgent == 'collab') {
        ObjectsNI = objects.filter(object => !object.intercepted);
    } else if (whAgent == 'AI') {
        ObjectsNI = objects.filter(object => !object.AIintercepted);
    }
    
    // Convert the screen coordinates to normalized coordinates where circle has radius 1 and center is at (0,0)
    let numObjects = ObjectsNI.length; 
    let objectPositionsX = ObjectsNI.map(object => (object.x - center.x) / observableRadius);
    let objectPositionsY = ObjectsNI.map(object => (object.y - center.y) / observableRadius);
    let objectVelocitiesX = ObjectsNI.map(object => (object.vx * object.speed) / observableRadius);
    let objectVelocitiesY = ObjectsNI.map(object => (object.vy * object.speed) / observableRadius);
    let objectValues = ObjectsNI.map(object => object.fill / object.size); 
    let ID = ObjectsNI.map(object => object.ID ); 
    let circleRadius = +1.00;
    let playerStartX = ( player.x - center.x ) / observableRadius;
    let playerStartY = ( player.y - center.y ) / observableRadius; 
    let playerSpeed = player.velocity / observableRadius;
    
    // Add the center as a special object with value 0 and ID -1
    numObjects++;
    objectPositionsX.push( 0 ); objectPositionsY.push( 0 );
    objectVelocitiesX.push( 0 ); objectVelocitiesY.push( 0 );
    objectValues.push( 0 );
    ID.push( -1 );

    if ((frame==71) && (whAgent == 'AI')) {
        console.log( "check");
    }
    
    // Run the planner on these normalized coordinates
    // MS8
    [ bestSol, allSol ] = planSingleFrame(playerStartX, playerStartY, playerSpeed, objectPositionsX, objectPositionsY, 
        objectVelocitiesX, objectVelocitiesY, objectValues, circleRadius, ID, alpha );

    // Convert all coordinates back to screen coordinates
    let solLength = bestSol.interceptionOrder.length;
    for (let i=0; i<solLength; i++) {
         bestSol.interceptLocations[i][0] = ( bestSol.interceptLocations[i][0] * observableRadius ) + center.x;
         bestSol.interceptLocations[i][1] = ( bestSol.interceptLocations[i][1] * observableRadius ) + center.y;       
    }

    for (let k=0; k<numObjects; k++) {
        solLength = allSol.interceptionOrder[k].length;
        for (let i=0; i<solLength; i++) {
            allSol.interceptLocations[k][i][0] = ( allSol.interceptLocations[k][i][0] * observableRadius ) + center.x;
            allSol.interceptLocations[k][i][1] = ( allSol.interceptLocations[k][i][1] * observableRadius ) + center.y;       
        }
    }

    // Do we change the best solution to maintain stability?
    if ((stabilityThreshold != null) && (prevAllSol != null)) {
        // What is the current best value and current target?
        let valueCurrentPlan = bestSol.maxValue;
        let currentBestID = bestSol.ID;

        // What was the previous object that was targeted?
        let lastBestID = prevBestSol.ID; 

        //console.log( "Current best: ID=" + currentBestID + "  lastBest=" + lastBestID );

        // Are we targeting different objects?
        if (currentBestID != lastBestID) {
             // Does this object still exist in the current set of interception paths?
            let idx = findIndex( lastBestID , allSol.ID );
            if (idx != -1) {
                // What is the current value of pursuing this previous object?
                let valuePreviousPlan = allSol.maxValue[ idx ];
                //if (valuePreviousPlan == -Infinity) valuePreviousPlan = 0;
                //if (valueCurrentPlan == -Infinity) valueCurrentPlan = 0;

                // What is the improvement (if any) for the current plan?
                let ratioScores = ( valueCurrentPlan + 0.0001 ) / ( valuePreviousPlan + 0.0001 );

                // If there is insufficient improvement, revert back to the plan of intercepting the previous ID, if it is still interceptable
                if ((ratioScores < stabilityThreshold) && (allSol.minDistance[idx] != Infinity)) {
                    //console.log( "REVERTING Current best: ID=" + currentBestID + "  Reverting to ID=" + lastBestID );
                    bestSol.ID = allSol.ID[ idx ];
                    bestSol.maxValue = allSol.maxValue[ idx ];
                    bestSol.minDistance = allSol.minDistance[ idx ];
                    bestSol.minTime = allSol.minTime[ idx ];
                    bestSol.interceptionOrder = allSol.interceptionOrder[ idx ];
                    bestSol.interceptLocations = allSol.interceptLocations[ idx ]; 
                    bestSol.interceptTimes = allSol.interceptTimes[ idx ];                     
                }
            }
        }
            
    }

    if (bestSol.interceptLocations[0] == null) {
        console.log( 'check');
    }
    
    // Create a new object with just the coordinates for the first interception
    let firstStep = { x: bestSol.interceptLocations[0][0] , 
                      y: bestSol.interceptLocations[0][1], 
                      ID: bestSol.ID,
                      interceptTime: bestSol.interceptTimes[0] }; 

    //console.log( "Current target ID: " + firstStep.ID );

    return [ firstStep, bestSol, allSol ];
} 

// MS7
function findIndex(value, array) {
    return array.indexOf(value);
}

function findIndexByValue(value, array, field) {
    return array.findIndex(obj => obj[field] === value);
}

// MS8
function sortArray(values) {
    // Clone the array to avoid mutating the original array
    const clonedArray = [...values];
    // Sort the cloned array
    return clonedArray.sort((a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
  }
  

// MS8
// function planSingleFrame(playerStartX, playerStartY, playerSpeed, objectPositionsX, objectPositionsY, objectVelocitiesX, objectVelocitiesY, objectValues, circleRadius, ID, alpha ) {
//     const numObjects = objectPositionsX.length;
//     if (numObjects==0) {
//         throw new Error( 'Expected at least one object');
//     }

//     // Object representing the best sequence of interceptions
//     let bestSol = {
//         maxValue: 0,
//         minDistance: +Infinity,
//         minTime: +Infinity,
//         interceptionOrder: [],
//         interceptLocations: [],
//         interceptTimes: [],
//         ID: null,
//     };

//     // Object containing the best sequence of interceptions, conditional on first visiting each object
//     let allSol = {
//         overallMaxValue: 0,
//         maxValue: new Array(numObjects).fill( 0 ),   
//         minDistance: new Array(numObjects).fill( +Infinity),
//         minTime: new Array(numObjects).fill( +Infinity),
//         interceptionOrder: new Array(numObjects).fill([]),
//         interceptLocations: new Array(numObjects).fill([]),
//         interceptTimes: new Array(numObjects).fill([]),
//         ID: ID.slice(),
//         timeToLeaveCircle: new Array(numObjects).fill([]),
//         timeBeforeNewObject: +Infinity // Time left (expressed in cycles) when new object will be introduced
//     };

//     for (let i=0; i<numObjects; i++) {
//         allSol.timeToLeaveCircle[i] = timeBeforeLeavingCircle(objectPositionsX[i], objectPositionsY[i], objectVelocitiesX[i], objectVelocitiesY[i], circleRadius);
//         if (allSol.timeToLeaveCircle[i] < allSol.timeBeforeNewObject) {
//             allSol.timeBeforeNewObject = allSol.timeToLeaveCircle[i];
//         }
//     }

//     // MS8
//     // Sort the times of objects leaving the circle
//     let sortedTimes = sortArray( allSol.timeToLeaveCircle );
//     sortedTimes.push( Infinity );

//     // Loop over all orders of three objects
//     for (let o1 = 0; o1 < numObjects; o1++) {
//         for (let o2 = 0; o2 < numObjects; o2++) {
//             for (let o3 = 0; o3 < numObjects; o3++) {
//                 let order = [];
//                 if ((numObjects == 1) || (ID[o1]==-1)) { // If the first object is the origin, do not plan beyond it
//                     order = [ o1 ];
//                 } else if ((o1 != o2)  && ((numObjects == 2) || (ID[o2]==-1))) {
//                     order = [ o1, o2 ];
//                 } else if ((numObjects >= 3) && (o1 !=o2 ) && (o2 != o3) && (o1!=o3)) {
//                     order = [ o1, o2, o3 ];
//                 }
                    
//                 let planningDepth = order.length;
//                 if (planningDepth >= 1) {
//                     let totalValue = 0;
//                     let totalDistance = 0;
//                     let totalTime = 0;
//                     let playerPosX = playerStartX;
//                     let playerPosY = playerStartY;
//                     let currentObjectPositionsX = objectPositionsX.slice();
//                     let currentObjectPositionsY = objectPositionsY.slice();
//                     let interceptLocationsBest = [];
//                     let interceptLocationsAll = [];
//                     let interceptTime = [];
//                     let countj = 0;
//                     let interceptionOrder = [];
//                     let firstIntercept = []; // MS6

//                     let numObjectsLeft = 0; // MS8

//                     for (let j = 0; j < planningDepth; j++) {
//                         let objectIdx = order[j];
//                         let idnow = ID[objectIdx];

//                         let [success, timeToIntercept, interceptPosX, interceptPosY, distance] = attemptIntercept(
//                             playerPosX, playerPosY, playerSpeed,
//                             currentObjectPositionsX[objectIdx], currentObjectPositionsY[objectIdx],
//                             objectVelocitiesX[objectIdx], objectVelocitiesY[objectIdx],
//                             circleRadius
//                         );
                            
//                         if (success) {
//                             countj++;
//                             interceptionOrder.push(idnow);
//                             let valueNow = objectValues[objectIdx];
//                             totalTime += timeToIntercept;
//                             totalDistance += distance;
                            

//                             // MS8
//                             while (totalTime > sortedTimes[ numObjectsLeft]) {
//                                 numObjectsLeft++;
//                             }

//                             // MS8
//                             //let alpha = 0.9; 
//                             //totalValue += valueNow;
//                             totalValue += valueNow * Math.pow( alpha , numObjectsLeft );
//                             //totalValue += valueNow * Math.pow( alpha , totalDistance );
//                             //totalValue += valueNow * Math.pow( alpha , totalTime );
//                             //totalValue += valueNow * Math.pow( alpha , j );
                            
//                             playerPosX = interceptPosX;
//                             playerPosY = interceptPosY;
//                             interceptLocationsBest.push([interceptPosX, interceptPosY]);
//                             interceptLocationsAll.push([interceptPosX, interceptPosY]);
//                             interceptTime.push( timeToIntercept);
//                         }

//                         if ((j==0) && (success)) {
//                             firstIntercept = [interceptPosX, interceptPosY]; 
//                         }
//                     }

//                     if (totalValue > bestSol.maxValue || (totalValue === bestSol.maxValue && totalTime < bestSol.minTime)) {
//                         bestSol.maxValue = totalValue;
//                         allSol.overallMaxValue = totalValue;
//                         bestSol.minDistance = totalDistance;
//                         bestSol.minTime = totalTime;
//                         bestSol.interceptionOrder = interceptionOrder;
//                         bestSol.interceptLocations = interceptLocationsBest;
//                         bestSol.interceptTimes = interceptTime;
//                         bestSol.ID = ID[ o1 ]; // store the ID of the object that is targeted for first interception
//                     }

//                     if ( (totalValue > allSol.maxValue[o1] || (totalValue === allSol.maxValue[o1] && totalTime < allSol.minTime[o1])) && (firstIntercept.length != 0)) {
//                         allSol.maxValue[o1] = totalValue;
//                         allSol.minDistance[o1] = totalDistance;
//                         allSol.minTime[o1] = totalTime;
//                         allSol.interceptionOrder[o1] = interceptionOrder;
//                         allSol.interceptLocations[o1] = interceptLocationsAll;
//                         allSol.interceptTimes[o1] = interceptTime;
//                     }
//                 }
//             }
//         }
//     }

//     if (bestSol.interceptLocations[0] == null) {
//         let idx = findIndex(-1, ID);
//         bestSol.interceptLocations = [ [ allSol.interceptLocations[idx][0][0], allSol.interceptLocations[idx][0][1] ] ];
//         bestSol.interceptionOrder = allSol.interceptionOrder[idx];
//         bestSol.interceptTimes = allSol.interceptTimes[idx ];
//         bestSol.minDistance = allSol.minDistance[idx];
//         bestSol.minTime = allSol.minTime[idx];
//         bestSol.ID = ID[ idx ];
        
//     }

//     return [ bestSol, allSol ];    
// }
// MS20
function planSingleFrame(playerStartX, playerStartY, playerSpeed, objectPositionsX, objectPositionsY, objectVelocitiesX, objectVelocitiesY, objectValues, circleRadius, ID, alpha ) {
    const numObjects = objectPositionsX.length;
    if (numObjects==0) {
        throw new Error( 'Expected at least one object');
    }

    // DEBUG
    //if ((ID.length == 4) && (ID[0]==30) && (ID[1]==50) && (ID[2]==60) && (ID[3]==-1)) {
    //    console.log( 'check');
    //}
    
    // Object representing the best sequence of interceptions
    let bestSol = {
        maxValue: 0,
        minDistance: +Infinity,
        minTime: +Infinity,
        interceptionOrder: [],
        interceptLocations: [],
        interceptTimes: [],
        ID: null,
    };

    // Object containing the best sequence of interceptions, conditional on first visiting each object
    let allSol = {
        overallMaxValue: 0,
        maxValue: new Array(numObjects).fill( 0 ),   
        minDistance: new Array(numObjects).fill( +Infinity),
        minTime: new Array(numObjects).fill( +Infinity),
        interceptionOrder: new Array(numObjects).fill([]),
        interceptLocations: new Array(numObjects).fill([]),
        interceptTimes: new Array(numObjects).fill([]),
        ID: ID.slice(),
        timeToLeaveCircle: new Array(numObjects).fill([]),
        timeBeforeNewObject: +Infinity // Time left (expressed in cycles) when new object will be introduced
    };

    for (let i=0; i<numObjects; i++) {
        allSol.timeToLeaveCircle[i] = timeBeforeLeavingCircle(objectPositionsX[i], objectPositionsY[i], objectVelocitiesX[i], objectVelocitiesY[i], circleRadius);
        if (allSol.timeToLeaveCircle[i] < allSol.timeBeforeNewObject) {
            allSol.timeBeforeNewObject = allSol.timeToLeaveCircle[i];
        }
    }

    // MS8
    // Sort the times of objects leaving the circle
    let sortedTimes = sortArray( allSol.timeToLeaveCircle );
    sortedTimes.push( Infinity );

    // Loop over all orders of three objects
    for (let o1 = 0; o1 < numObjects; o1++) {
        for (let o2 = 0; o2 < numObjects; o2++) {
            for (let o3 = 0; o3 < numObjects; o3++) {
                let order = [];
                if ((numObjects == 1) || (ID[o1]==-1)) { // If the first object is the origin, do not plan beyond it
                    order = [ o1 ];
                } else if ((o1 != o2)  && ((numObjects == 2) || (ID[o2]==-1))) {
                    order = [ o1, o2 ];
                } else if ((numObjects >= 3) && (o1 !=o2 ) && (o2 != o3) && (o1!=o3)) {
                    order = [ o1, o2, o3 ];
                }
                    
                let planningDepth = order.length;
                if (planningDepth >= 1) {
                    let totalValue = 0;
                    let totalDistance = 0;
                    let totalTime = 0;
                    let playerPosX = playerStartX;
                    let playerPosY = playerStartY;
                    let currentObjectPositionsX = objectPositionsX.slice();
                    let currentObjectPositionsY = objectPositionsY.slice();
                    let interceptLocationsBest = [];
                    let interceptLocationsAll = [];
                    let interceptTime = [];
                    let countj = 0;
                    let interceptionOrder = [];
                    let firstIntercept = []; // MS6

                    let numObjectsLeft = 0; // MS8
                    let firstObjectIdx = []; // MS20

                    for (let j = 0; j < planningDepth; j++) {
                        let objectIdx = order[j];
                        let idnow = ID[objectIdx];

                        let [success, timeToIntercept, interceptPosX, interceptPosY, distance] = attemptIntercept(
                            playerPosX, playerPosY, playerSpeed,
                            currentObjectPositionsX[objectIdx], currentObjectPositionsY[objectIdx],
                            objectVelocitiesX[objectIdx], objectVelocitiesY[objectIdx],
                            circleRadius
                        );
                            
                        if (success) {
                            countj++;
                            if (countj==1) { // MS20
                                firstObjectIdx = objectIdx;
                            }
                            interceptionOrder.push(idnow);
                            let valueNow = objectValues[objectIdx];
                            totalTime += timeToIntercept;
                            totalDistance += distance;
                            

                            // MS8
                            while (totalTime > sortedTimes[ numObjectsLeft]) {
                                numObjectsLeft++;
                            }

                            // MS8
                            //let alpha = 0.9; 
                            //totalValue += valueNow;
                            totalValue += valueNow * Math.pow( alpha , numObjectsLeft );
                            //totalValue += valueNow * Math.pow( alpha , totalDistance );
                            //totalValue += valueNow * Math.pow( alpha , totalTime );
                            //totalValue += valueNow * Math.pow( alpha , j );
                            
                            playerPosX = interceptPosX;
                            playerPosY = interceptPosY;
                            interceptLocationsBest.push([interceptPosX, interceptPosY]);
                            interceptLocationsAll.push([interceptPosX, interceptPosY]);
                            interceptTime.push( timeToIntercept);
                        }

                        if ((j==0) && (success)) {
                            firstIntercept = [interceptPosX, interceptPosY]; 
                        }
                    }

                    if (totalValue > bestSol.maxValue || (totalValue === bestSol.maxValue && totalTime < bestSol.minTime)) {
                        bestSol.maxValue = totalValue;
                        allSol.overallMaxValue = totalValue;
                        bestSol.minDistance = totalDistance;
                        bestSol.minTime = totalTime;
                        bestSol.interceptionOrder = interceptionOrder;
                        bestSol.interceptLocations = interceptLocationsBest;
                        bestSol.interceptTimes = interceptTime;
                        bestSol.ID = ID[ firstObjectIdx ]; // store the ID of the object that is targeted for first interception // MS20
                    }

                    if ( (totalValue > allSol.maxValue[firstObjectIdx] || (totalValue === allSol.maxValue[firstObjectIdx] && totalTime < allSol.minTime[firstObjectIdx])) && (firstIntercept.length != 0)) { // MS20
                        allSol.maxValue[firstObjectIdx] = totalValue;
                        allSol.minDistance[firstObjectIdx] = totalDistance;
                        allSol.minTime[firstObjectIdx] = totalTime;
                        allSol.interceptionOrder[firstObjectIdx] = interceptionOrder;
                        allSol.interceptLocations[firstObjectIdx] = interceptLocationsAll;
                        allSol.interceptTimes[firstObjectIdx] = interceptTime;
                    }
                }
            }
        }
    }

    if (bestSol.interceptLocations[0] == null) {
        let idx = findIndex(-1, ID);
        bestSol.interceptLocations = [ [ allSol.interceptLocations[idx][0][0], allSol.interceptLocations[idx][0][1] ] ];
        bestSol.interceptionOrder = allSol.interceptionOrder[idx];
        bestSol.interceptTimes = allSol.interceptTimes[idx ];
        bestSol.minDistance = allSol.minDistance[idx];
        bestSol.minTime = allSol.minTime[idx];
        bestSol.ID = ID[ idx ];
        
    }


     //if ((bestSol != null) && (bestSol.ID != bestSol.interceptionOrder[0]))  {
     //    console.log("*First Step ID and First Interception Mismatch*");
     //}
                                                                                                    
    return [ bestSol, allSol ];  

    
}

function attemptIntercept(playerPosX, playerPosY, playerSpeed, objectPosX, objectPosY, objectVelX, objectVelY, circleRadius) {
    let success = false;
    let travelTime = Infinity;
    let interceptPosX = NaN;
    let interceptPosY = NaN;
    let totalDistanceTraveled = Infinity;

    // Check if the object is within the circle initially
    if (Math.sqrt(objectPosX ** 2 + objectPosY ** 2) > circleRadius) {
        return [ success, travelTime, interceptPosX, interceptPosY, totalDistanceTraveled ];
    }

    // Initial relative position from the player to the object
    let relativePosX = objectPosX - playerPosX;
    let relativePosY = objectPosY - playerPosY;

    // Solving quadratic equation
    let A = objectVelX ** 2 + objectVelY ** 2 - playerSpeed ** 2;
    let B = 2 * (relativePosX * objectVelX + relativePosY * objectVelY);
    let C = relativePosX ** 2 + relativePosY ** 2;

    let discriminant = B ** 2 - 4 * A * C;

    if (discriminant < 0) {
        // No real solutions, interception not possible
        return [ success, travelTime, interceptPosX, interceptPosY, totalDistanceTraveled ];
    }

    // Calculate potential times for interception
    let t1 = (-B + Math.sqrt(discriminant)) / (2 * A);
    let t2 = (-B - Math.sqrt(discriminant)) / (2 * A);

    // Determine the valid and earliest interception time
    if (t1 >= 0 && (t1 < t2 || t2 < 0)) {
        travelTime = t1;
    } else if (t2 >= 0) {
        travelTime = t2;
    } else {
        // No valid interception time found
        return [ success, travelTime, interceptPosX, interceptPosY, totalDistanceTraveled ];
    }

    interceptPosX = objectPosX + travelTime * objectVelX;
    interceptPosY = objectPosY + travelTime * objectVelY;
    totalDistanceTraveled = travelTime * playerSpeed;

    // Check if the intercept position is within the circle
    if (Math.sqrt(interceptPosX ** 2 + interceptPosY ** 2) <= circleRadius) {
        success = true;
    }

    if ((travelTime == null) | (interceptPosX== null) | ( interceptPosX==null) |
       (totalDistanceTraveled == null) | (success==null)) {
        console.log( 'Null values');
    }

    return [ success, travelTime, interceptPosX, interceptPosY, totalDistanceTraveled ];
}


function timeBeforeLeavingCircle(objectPosX, objectPosY, objectVelocityX, objectVelocityY, circleRadius) {
    // Check if the object is stationary
    if (objectVelocityX === 0 && objectVelocityY === 0) {
        return Infinity; // Object is stationary
    }

    // Calculate the magnitude of the object's velocity vector
    let objectSpeed = Math.sqrt(objectVelocityX ** 2 + objectVelocityY ** 2);

    // Normalizing the velocity vector to get the direction
    let objectDirectionX = objectVelocityX / objectSpeed;
    let objectDirectionY = objectVelocityY / objectSpeed;

    // Vector from circle center to object
    let centerToObjectX = -objectPosX;
    let centerToObjectY = -objectPosY;

    // Projection of centerToObject on objectDirection
    let projectionLength = (centerToObjectX * objectDirectionX) + (centerToObjectY * objectDirectionY);

    // Finding the closest point on the path to the circle center
    let closestPointX = objectPosX + projectionLength * objectDirectionX;
    let closestPointY = objectPosY + projectionLength * objectDirectionY;

    // Distance from the closest point on the path to the circle center
    let distClosestPointToCenter = Math.sqrt(closestPointX ** 2 + closestPointY ** 2);

    if (distClosestPointToCenter > circleRadius) {
        return Infinity; // Object path does not intersect with the circle
    }

    // Using Pythagorean theorem to find the distance from the closest point to the circle edge along the path
    let edgeDistance = Math.sqrt(circleRadius ** 2 - distClosestPointToCenter ** 2);

    // Total distance from the object to the intersection point
    let totalDistance = projectionLength + edgeDistance;

    // Time to reach the circle edge
    let time = totalDistance / objectSpeed;

    if (time < 0) {
        // If time is negative, the object is moving away from the circle
        return Infinity;
    }

    return time;
}

function testCase() {
    // Define constants
    //const maxEvals = 4000;
    //const typePriorityScoring = 2;
    const circleRadius = +1;

    // Set example to test whether code translation worked
    const whExample = 2;

    let playerStartX;
    let playerStartY;
    let playerSpeed;
    let objectPositionsX;
    let objectPositionsY;
    let objectVelocitiesX;
    let objectVelocitiesY; 
    let objectValues;
    let ID;

    if (whExample==2) {
        playerStartX = -0.0736;
        playerStartY = 0.4499;
        playerSpeed = circleRadius / 20;
        objectPositionsX = [-0.1596, 0.4599, -0.6698, -0.3673, -0.3108, 0.4255, -0.1966, 0.1048];
        objectPositionsY = [-0.0291, -0.7825, 0.2647, -0.6842, -0.3624, 0.1991, 0.6960, 0.8982];
        objectVelocitiesX = [0.0013, -0.0103, 0.0021, -0.0166, 0.0108, 0.0057, -0.0163, -0.0014];
        objectVelocitiesY = [0.0166, 0.0131, 0.0165, 0.0009, 0.0127, 0.0157, -0.0033, 0.0166];
        objectValues = [0.1158, 0.6298, 0.0016, 0.5479, 0.0006, 0.1105, 0.2182, 0.0386];
        ID           = [0,      1     , 2     , 3     , 4     , 5     , 6     , 7 ];

        /* Matlab solution
           maxValue: 1.3959
        minDistance: 2.4534
            minTime: 49.0688
  interceptionOrder: [4×1 double]
 interceptLocations: [4×2 double]
valueGoingTowardsObject: [8×1 double]
     interceptTimes: [4×1 double]
     lastPlayerPosX: 0
     lastPlayerPosY: 0
     */
    }

    if (whExample==3) {
        playerStartX = -0.0736;
        playerStartY = 0.4499;
        playerSpeed = circleRadius / 20;
        objectPositionsX = [];
        objectPositionsY = [];
        objectVelocitiesX = [];
        objectVelocitiesY = [];
        objectValues = [];

        /* Matlab solution
               maxValue: 0
            minDistance: 0.4559
                minTime: 9.1176
      interceptionOrder: -1
    valueGoingTowardsObject: 0
     interceptLocations: [0 0]
         interceptTimes: 9.1176
         lastPlayerPosX: 0
         lastPlayerPosY: 0
         */
    }

    if (whExample==4) {
        playerStartX = -0.0736;
        playerStartY = 0.4499;
        playerSpeed = circleRadius / 20;
        objectPositionsX = [  0.4599 ];
        objectPositionsY = [  -0.7825 ];
        objectVelocitiesX = [ -0.0103  ];
        objectVelocitiesY = [ 0.0131 ];
        objectValues = [ 0.6298 ];

        /* Matlab solution
               maxValue: 0.6298
            minDistance: 1.0184
                minTime: 20.3679
      interceptionOrder: [2×1 double]
     interceptLocations: [2×2 double]
    valueGoingTowardsObject: 0.6298
         interceptTimes: [2×1 double]
         lastPlayerPosX: 0
         lastPlayerPosY: 0
         */
    }

    if (whExample==5) {
        playerStartX = -0.0736;
        playerStartY = 0.4499;
        playerSpeed = circleRadius / 20;
        objectPositionsX = [  0.4599, -0.367 ];
        objectPositionsY = [  -0.7825, -0.6842];
        objectVelocitiesX = [ -0.0103, -0.0166 ];
        objectVelocitiesY = [ 0.0131, 0.0009];
        objectValues = [ 0.6298, 0.5479 ];

        /* Matlab solution
               maxValue: 1.1777
            minDistance: 1.9610
                minTime: 39.2204
      interceptionOrder: [3×1 double]
     interceptLocations: [3×2 double]
    valueGoingTowardsObject: [2×1 double]
         interceptTimes: [3×1 double]
         lastPlayerPosX: 0
         lastPlayerPosY: 0
         */
    }

    if (whExample==6) {
        playerStartX = 0.0744002089007483;
        playerStartY = -0.04066554145514491;
        playerSpeed = 0.0038461538461538464;
        objectPositionsX = [-0.6297230939495665, -0.7292316544554527];
        objectPositionsY = [-0.34547084443620757, -0.4043699458467161];
        objectVelocitiesX = [0.0003445251953664351, 0.0021847427293351655];
        objectVelocitiesY = [0.004346682022134775, 0.003800393898141756];
        objectValues = [0.01654784823767841, 0.4958894052542746];

        /*  Matlab solution
            maxValue: 1.1777
            minDistance: 1.9610
            minTime: 39.2204
            interceptionOrder: [3×1 double]
            interceptLocations: [3×2 double]
            valueGoingTowardsObject: [2×1 double]
            interceptTimes: [3×1 double]
            lastPlayerPosX: 0
            lastPlayerPosY: 0
        */
    }
    
    // Test execution time for 1000 calls
    console.time('functionExecutionTime');
    //let sol;    
    //for (let i=0; i<1000; i++) {
        let [ bestSol,allSol ] = planSingleFrame(playerStartX, playerStartY, playerSpeed, objectPositionsX, objectPositionsY, objectVelocitiesX, objectVelocitiesY, objectValues, circleRadius, ID)
        //sol =               planSingleFrame(playerStartX, playerStartY, playerSpeed, objectPositionsX, objectPositionsY, objectVelocitiesX, objectVelocitiesY, objectValues, circleRadius);
    //}
    console.timeEnd('functionExecutionTime');
    console.log(bestSol);
    console.log("test")
}

