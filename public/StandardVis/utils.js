class ReMap {
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

