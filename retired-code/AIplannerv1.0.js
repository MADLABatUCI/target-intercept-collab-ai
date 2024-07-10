function testCase() {
    // Define constants
    const maxEvals = 4000;
    const typePriorityScoring = 2;
    const circleRadius = +1;

    // Set example to test whether code translation worked
    const whExample = 3;

    let playerStartX;
    let playerStartY;
    let playerSpeed;
    let objectPositionsX;
    let objectPositionsY;
    let objectVelocitiesX;
    let objectVelocitiesY; 
    let objectValues;

    if (whExample==2) {
        playerStartX = -0.0736;
        playerStartY = 0.4499;
        playerSpeed = circleRadius / 20;
        objectPositionsX = [-0.1596, 0.4599, -0.6698, -0.3673, -0.3108, 0.4255, -0.1966, 0.1048];
        objectPositionsY = [-0.0291, -0.7825, 0.2647, -0.6842, -0.3624, 0.1991, 0.6960, 0.8982];
        objectVelocitiesX = [0.0013, -0.0103, 0.0021, -0.0166, 0.0108, 0.0057, -0.0163, -0.0014];
        objectVelocitiesY = [0.0166, 0.0131, 0.0165, 0.0009, 0.0127, 0.0157, -0.0033, 0.0166];
        objectValues = [0.1158, 0.6298, 0.0016, 0.5479, 0.0006, 0.1105, 0.2182, 0.0386];

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
  
    // Test execution time for 1000 calls
    console.time('functionExecutionTime');
    let sol;    
    for (let i=0; i<1000; i++) {
        sol = planSingleFrame(playerStartX, playerStartY, playerSpeed, objectPositionsX, objectPositionsY, objectVelocitiesX, objectVelocitiesY, objectValues, circleRadius);
    }
    console.timeEnd('functionExecutionTime');
    console.log(sol);
}

// MS6
function calcValueHumanPlan( sol , player , angleThreshold) {

  // Check
  //if (player.moving) {
  //   console.log( 'check');
  //} 

  // Number of suggested locations
  let numSuggestions = sol.interceptLocationTowardsObject.length;
  let valueHumanPlan = 0;
  if ((numSuggestions == 0) | (!player.moving)) {
      return [ valueHumanPlan, [] ];
  } else {
      let values = new Array(numSuggestions).fill(0);

      // Copy over the values and add some number to avoid division by zero
      for (let i=0; i<numSuggestions; i++) values[i] = (sol.valueGoingTowardsObject[i] + 0.001) /  (sol.maxValue + 0.001 );

      // Calculate which angle bracket the player falls in
      let maxV = 0;
      let maxI = 0;
      for (let i=0; i<numSuggestions; i++) {
          // Optimal interception vector
          let interceptVector = sol.interceptLocationTowardsObject[i];
          if (interceptVector != null) {
              let dx2 = ( interceptVector[0] - player.x );
              let dy2 = ( interceptVector[1] - player.y );

              // Player movement
              let dx1 = ( player.targetX - player.x );
              let dy1 = ( player.targetY - player.y );
              
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
            // let dotProduct = dx1 * dx2 + dy1 * dy2;

            // // Calculate magnitude of vector b
            // let magnitudeB = Math.sqrt(dx2 * dx2 + dy2 * dy2);

            // // Calculate and return scalar projection of a onto b (length of the projection)
            // let distance = dotProduct / magnitudeB;

              if (angleDegrees < angleThreshold) { 
                  if (values[i] > maxV) {
                      maxV = values[ i ];
                      maxI = i;
                  }
              }
          }
          
      }
      
      valueHumanPlan = maxV;
      return [ valueHumanPlan, values ];
  }
}

function runAIPlanner( objects, player , observableRadius , center, planNumFramesAhead, whAgent  ) {
    // Function to run the AI planner

    // Add an id 
    const objectsWithId = objects.map((object, index) => ({
        ...object, // Spread the original object to keep its properties
        OriginalIndex: index // Add the Id property, which is the original index
    }));

    // First, find all objects that have not been intercepted yet
    let filteredObjects;
    if (whAgent == 'human') {
        filteredObjects = objectsWithId.filter(object => !object.intercepted);
    } else {
        filteredObjects = objectsWithId.filter(object => !object.AIintercepted);
    }
    

    // First, convert the screen coordinates to normalized coordinates where circle has radius 1 and center is at (0,0)
    let numObjects = filteredObjects.length; 

    let objectPositionsX = filteredObjects.map(object => (object.x - center.x) / observableRadius);
    let objectPositionsY = filteredObjects.map(object => (object.y - center.y) / observableRadius);
    let objectVelocitiesX = filteredObjects.map(object => (object.vx * object.speed) / observableRadius);
    let objectVelocitiesY = filteredObjects.map(object => (object.vy * object.speed) / observableRadius);
    let objectValues = filteredObjects.map(object => object.fill / object.size); // MS6 check this
    let originalIndex = filteredObjects.map(object => object.OriginalIndex );
    
    let circleRadius = +1.00;
    
    // Do we need to plan for a future display state?
    if (planNumFramesAhead > 0) {
        let withinCircle = new Array(numObjects).fill(1);
        
        for (let i=0; i<numObjects; i++) {
            objectPositionsX[i] += objectVelocitiesX[i] * planNumFramesAhead; 
            objectPositionsY[i] += objectVelocitiesY[i] * planNumFramesAhead; 

            let dx = objectPositionsX[i];
            let dy = objectPositionsY[i];
            let distanceFromCenter = Math.sqrt(dx * dx + dy * dy);

            if (distanceFromCenter > circleRadius) {
                withinCircle[i] = 0;
            }          
        }

        let filteredObjectPositionsX = [];
        let filteredObjectPositionsY = [];
        let filteredVelocitiesX = [];
        let filteredVelocitiesY = [];
        let filteredValues = [];
        let filteredOriginalIndex = [];
        
        for (let i = 0; i < numObjects; i++) {
            if (withinCircle[i] !== 0) {
                filteredObjectPositionsX.push(objectPositionsX[i]);
                filteredObjectPositionsY.push(objectPositionsY[i]);
                filteredVelocitiesX.push(objectVelocitiesX[i]);
                filteredVelocitiesY.push(objectVelocitiesY[i]);
                filteredValues.push(objectValues[i]);
                filteredOriginalIndex.push( originalIndex[i]);
            }
        }
        
        // Now, objectPositionsX and objectPositionsY only contain entries that are within the circle
        objectPositionsX = filteredObjectPositionsX;
        objectPositionsY = filteredObjectPositionsY;
        objectVelocitiesX = filteredVelocitiesX;
        objectVelocitiesY = filteredVelocitiesY;
        objectValues = filteredValues;
        originalIndex = filteredOriginalIndex;

        numObjects = objectValues.length; 
    }
  

    let playerStartX = ( player.x - center.x ) / observableRadius;
    let playerStartY = ( player.y - center.y ) / observableRadius; 
    let playerSpeed = player.velocity / observableRadius; 

    sol = planSingleFrame(playerStartX, playerStartY, playerSpeed, objectPositionsX, objectPositionsY, 
        objectVelocitiesX, objectVelocitiesY, objectValues, circleRadius);

    // Now convert all coordinates back to screen coordinates
    let solLength = sol.interceptionOrder.length;
    sol.originalIndex = new Array(solLength).fill(-1);
    for (let i=0; i<solLength; i++) {
        sol.interceptLocations[i][0] = ( sol.interceptLocations[i][0] * observableRadius ) + center.x;
        sol.interceptLocations[i][1] = ( sol.interceptLocations[i][1] * observableRadius ) + center.y;

        // MS6
        let index = sol.interceptionOrder[ i ];
        if (index != -1) {
            sol.originalIndex[i] = originalIndex[ index ];
        }       
    }


    // MS6
    if (whAgent == 'human') {
        let numSuggestions = sol.valueGoingTowardsObject.length;
        sol.originalIndexSuggestions = new Array(numSuggestions).fill(-1);
        for (let i=0; i<numSuggestions; i++) {
            if (sol.interceptLocationTowardsObject[i] != null) {
                if (originalIndex[i] != null) {
                    sol.originalIndexSuggestions[i] = originalIndex[ i ];
                }
                    
                sol.interceptLocationTowardsObject[i][0] = ( sol.interceptLocationTowardsObject[i][0] * observableRadius ) + center.x; 
                sol.interceptLocationTowardsObject[i][1] = ( sol.interceptLocationTowardsObject[i][1] * observableRadius ) + center.y;
            } 
        }
    }
    
    return sol;
} 

// MS6
function planSingleFrame(playerStartX, playerStartY, playerSpeed, objectPositionsX, objectPositionsY, objectVelocitiesX, objectVelocitiesY, objectValues, circleRadius) {
    const numObjects = objectPositionsX.length;
    let timeToLeaveCircle = new Array(numObjects).fill(0);
    for (let i = 0; i < numObjects; i++) {
        timeToLeaveCircle[i] = timeBeforeLeavingCircle(objectPositionsX[i], objectPositionsY[i], objectVelocitiesX[i], objectVelocitiesY[i], circleRadius);
    }

    let sol = {
        maxValue: 0,
        minDistance: Infinity,
        minTime: Infinity,
        interceptionOrder: [],
        interceptLocations: [],
        interceptTimes: [],
        interceptLocationTowardsObject: [],
        valueGoingTowardsObject: new Array(numObjects).fill(0),
        lastPlayerPosX: null,
        lastPlayerPosY: null
    };

    if (numObjects==0) {
        playerPosX = playerStartX;
        playerPosY = playerStartY;
        objectPosX = 0;
        objectPosY = 0;
        objectVelX = 0;
        objectVelY = 0;
        objectID   = -1; // -1 represents the center location

        let [success, timeToIntercept, interceptPosX, interceptPosY, distance ] = attemptIntercept( 
            playerPosX, playerPosY, playerSpeed, objectPosX, objectPosY, objectVelX, objectVelY, circleRadius);

        sol.maxValue = 0;
        sol.minDistance = distance;
        sol.minTime = timeToIntercept;
        sol.interceptionOrder = objectID;
        sol.interceptLocationTowardsObject.push([ objectPosX, objectPosY ]);
        sol.valueGoingTowardsObject = [ 0 ]; // MS6
        sol.interceptionOrder = [ objectID ];
        sol.interceptLocations.push([ objectPosX, objectPosY ]);
        sol.interceptTimes = [ timeToIntercept ];
        sol.lastPlayerPosX = objectPosX;
        sol.lastPlayerPosY = objectPosY;

        return sol;
    } else {
        for (let o1 = 0; o1 < numObjects; o1++) {
            for (let o2 = 0; o2 < numObjects; o2++) {
                for (let o3 = 0; o3 < numObjects; o3++) {
                    let order = [];
                    if (numObjects == 1) {
                        order = [ o1 ];
                    } else if ((numObjects == 2) && (o1 != o2)) {
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
                        let interceptLocations = [];
                        let interceptTime = [];
                        let countj = 0;
                        let interceptionOrder = [];
                        let firstIntercept = []; // MS6
    
                        for (let j = 0; j < planningDepth; j++) {
                            let objectIdx = order[j];

                            let [success, timeToIntercept, interceptPosX, interceptPosY, distance] = attemptIntercept(
                                playerPosX, playerPosY, playerSpeed,
                                currentObjectPositionsX[objectIdx], currentObjectPositionsY[objectIdx],
                                objectVelocitiesX[objectIdx], objectVelocitiesY[objectIdx],
                                circleRadius
                            );
                                
                            if (success) {
                                countj++;
                                interceptionOrder.push(objectIdx);
                                // MS7 change
                                let valueNow = objectValues[objectIdx];
                                totalTime += timeToIntercept;
                                totalDistance += distance;
                                totalValue += valueNow;
                                //let alpha = 0.1; // HARD CODED PARAMETER!!!!!!!!!!!!!!!!!!!!!!!!!!!
                                //totalValue += valueNow * Math.pow( alpha , totalDistance );
                                //totalValue += valueNow * Math.pow( alpha , totalTime );
                                //totalValue += valueNow * Math.pow( alpha , j );
                                
                                playerPosX = interceptPosX;
                                playerPosY = interceptPosY;
                                interceptLocations.push([interceptPosX, interceptPosY]);
                                interceptTime.push( timeToIntercept);
                            }

                            // MS6
                            if ((j==0) && (success)) {
                                firstIntercept = [interceptPosX, interceptPosY]; 
                            }
                        }
    
                        if (totalValue > sol.maxValue || (totalValue === sol.maxValue && totalTime < sol.minTime)) {
                            sol.maxValue = totalValue;
                            sol.minDistance = totalDistance;
                            sol.minTime = totalTime;
                            sol.interceptionOrder = interceptionOrder;
                            sol.interceptLocations = interceptLocations;
                            sol.interceptTimes = interceptTime;
                            sol.lastPlayerPosX = playerPosX;
                            sol.lastPlayerPosY = playerPosY;
                        }

                        // MS6: made changes in this block
                        if ((totalValue > sol.valueGoingTowardsObject[o1]) && (firstIntercept.length != 0)) {
                            sol.valueGoingTowardsObject[o1] = totalValue;
                            sol.interceptLocationTowardsObject[o1] = firstIntercept;
                        }
                    }
                }
            }
        }
    
        // Add returning to the center as the last step
        let [success, timeToIntercept, interceptPosX, interceptPosY, distance] = attemptIntercept(
            sol.lastPlayerPosX, sol.lastPlayerPosY, playerSpeed,
            0, 0, 0, 0, circleRadius
        );
    
        if (success) {
            sol.interceptionOrder.push(-1); // -1 represents the center location
            sol.interceptLocations.push([0, 0]);
            sol.interceptTimes.push(timeToIntercept);
        }
    
        return sol;
    }
    
    
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
