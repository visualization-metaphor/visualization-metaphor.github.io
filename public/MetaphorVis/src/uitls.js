export class Remap {

    #inputMin;
    #outputMin;
    #inputRange;
    #outputRange;

    constructor(inputMin, inputMax, outputMin, outputMax) {
        this.#inputMin = inputMin;
        this.#outputMin = outputMin;

        this.#inputRange = inputMax - inputMin;
        this.#outputRange = outputMax - outputMin;
    }

    find(value) {
        const newValue = this.#outputMin + ((value - this.#inputMin) / this.#inputRange) * this.#outputRange;
        return newValue;
    }
}

export function generateRandomNumber(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

export function findMode(arr) {
    const mode = {};
    let max = 0, count = 0;
  
    for(let i = 0; i < arr.length; i++) {
      const item = Math.round(arr[i]);
      
      if(mode[item]) {
        mode[item]++;
      } else {
        mode[item] = 1;
      }
      
      if(count < mode[item]) {
        max = item;
        count = mode[item];
      }
    }

    return max;
}

export function findAverage(arr) {
    const sum = arr.reduce((sum, currentValue) => sum + currentValue, 0);
    const average = sum / arr.length;
    return average;
}
