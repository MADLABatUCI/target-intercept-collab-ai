// Constants
const PLAYER_SPEED = player.speed;  // Maximum speed of the player OR 1.5 px/s
const MAX_LOOKAHEAD = 5; // Max lookahead in seconds

// Helper Functions
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function predictPosition(x, y, vx, vy, t) {
    return {
        x: x + vx * t,
        y: y + vy * t
    };
}

// Calculate the time required to travel a distance at constant speed
function timeToTravel(distance, speed) {
    return distance / speed;
}

// Main Interception Function
function calculateInterception(playerX, playerY, targetX, targetY, targetVx, targetVy) {
    let bestTime = Infinity;
    let bestPoint = { x: targetX, y: targetY };

    const relativeVelocity = Math.sqrt(targetVx ** 2 + targetVy ** 2);
    const timeIncrement = Math.max(0.1, 1 / (relativeVelocity / PLAYER_SPEED + 1));  // Adaptive time increment

    for (let t = 0; t <= MAX_LOOKAHEAD; t += timeIncrement) {
        // Predict target's future position
        let predicted = predictPosition(targetX, targetY, targetVx, targetVy, t);
        // Calculate distance and time required to reach this predicted position
        let dist = distance(playerX, playerY, predicted.x, predicted.y);
        let timeRequired = timeToTravel(dist, PLAYER_SPEED);

        // Check if this is a better solution
        if (timeRequired <= bestTime && timeRequired >= t) {  // Check if player can reach before or as target arrives
            bestTime = timeRequired;
            bestPoint = predicted;
        }
    }

    return {
        x: bestPoint.x,
        y: bestPoint.y,
        time: bestTime
    };
}
